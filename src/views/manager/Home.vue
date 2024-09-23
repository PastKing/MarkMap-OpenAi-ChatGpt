<template>
    <el-row :gutter="20" class="mind-container">
        <el-col :span="6" class="left-panel">
            <!-- 选择输入模式 -->
            <el-row :gutter="20">
                <el-col :span="24">
                    <el-select v-model="inputMode" placeholder="选择模式">
                        <el-option label="URL" value="url"></el-option>
                        <el-option label="自定义文本" value="text"></el-option>
                    </el-select>
                </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-top: 20px;">
                <!-- 根据选择显示输入框 -->
                <el-col :span="24" v-if="inputMode === 'url'">
                    <el-input v-model="urlInput" placeholder="输入URL"></el-input>
                </el-col>
                <el-col :span="24" v-if="inputMode === 'text'">
                    <el-input v-model="title" placeholder="输入标题"></el-input>
                </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-top: 20px;" v-if="inputMode === 'text'">
                <el-col :span="24">
                    <el-input v-model="editorContent" type="textarea" :rows="10" placeholder="编辑内容"></el-input>
                </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-top: 20px;">
                <el-col :span="12">
                    <el-button type="primary" @click="generateMindMap">生成</el-button>
                </el-col>
                <el-col :span="12">
                    <el-checkbox v-model="continuousQA">连续问答</el-checkbox>
                </el-col>
            </el-row>
        </el-col>

        <el-col :span="18" class="right-panel">
            <div class="svg-container">
                <svg ref="svgRef" class="markmap-svg"></svg>
            </div>
            <el-row :gutter="10" class="controls">
                <el-col :span="4">
                    <el-button @click="zoomIn">放大</el-button>
                </el-col>
                <el-col :span="4">
                    <el-button @click="zoomOut">缩小</el-button>
                </el-col>
                <el-col :span="4">
                    <el-button @click="fitToScreen">适应屏幕</el-button>
                </el-col>
                <el-col :span="12">
                    <el-dropdown @command="handleDownload" trigger="hover">
                        <el-button>
                            下载 <i class="el-icon-arrow-down el-icon--right"></i>
                        </el-button>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="png">.png</el-dropdown-item>
                            <el-dropdown-item command="jpeg">.jpeg</el-dropdown-item>
                            <el-dropdown-item command="svg">.svg</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </el-col>
            </el-row>
        </el-col>
    </el-row>
</template>

<script>
import { ref, onMounted, watch, nextTick } from 'vue'
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'
import * as htmlToImage from 'html-to-image'
import { saveAs } from 'file-saver'

export default {
    name: 'HomeView',
    setup() {
        const transformer = new Transformer()

        const inputMode = ref('text') // 默认模式为text
        const urlInput = ref('')     // URL输入框
        const title = ref('')        // 标题输入框 (用于自定义文本模式)
        const editorContent = ref(`# 思维导图\n1. 标题1\n - 子标题1\n - 子标题2\n3. 标题2\n4. 标题3\n- beautiful\n- useful\n- easy\n- interactive`)
        const continuousQA = ref(false)
        const conversationHistory = ref([])

        const mm = ref(null)
        const svgRef = ref(null)
        const fitToScreenState = ref(false)

        const update = () => {
            if (mm.value && svgRef.value) {
                const { root } = transformer.transform(editorContent.value)
                mm.value.setData(root)
                mm.value.fit()
            }
        }

        const zoomIn = () => mm.value && mm.value.rescale(1.25)
        const zoomOut = () => mm.value && mm.value.rescale(0.8)
        const fitToScreen = () => {
            if (mm.value) {
                mm.value.fit()
                fitToScreenState.value = true
            }
        }

        const generateMindMap = async () => {
            try {
                const model =
                    (inputMode.value === 'url' ? process.env.VUE_APP_URL_MODEL : process.env.VUE_APP_DEFAULT_MODEL)

                const messages = [
                    {
                        role: 'system',
                        content: inputMode.value === 'url'
                            ? '请分析给定的URL内容，并以markdown格式输出一个相关的思维导图，不要无用的说明，只需呈现主题、子主题、关联关系即可，若无法访问，也要保证思维导图的完整性。确保输出是有效的markdown，以"# 主题"开始，使用"-"或数字来表示层级，不要使用代码块。'
                            : '请设计一个思维导图，以markdown格式输出，不要无用的说明，只需呈现主题、子主题、关联关系即可。确保输出是有效的markdown，以"# 主题"开始，使用"-"或数字来表示层级，不要使用代码块。'
                    },
                    ...conversationHistory.value
                ]

                if (continuousQA.value && editorContent.value.trim() !== '') {
                    messages.push({
                        role: 'assistant',
                        content: editorContent.value
                    })
                    messages.push({
                        role: 'user',
                        content: `基于上述内容，继续深入探讨"${inputMode.value === 'url' ? urlInput.value : title.value}"这个主题，补充更多相关的想法和概念。`
                    })
                } else {
                    messages.push({
                        role: 'user',
                        content: inputMode.value === 'url' ? urlInput.value : title.value
                    })
                }

                const response = await fetch(
                    `${process.env.VUE_APP_API_BASE_URL}/v1/chat/completions`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${process.env.VUE_APP_API_KEY}`
                        },
                        body: JSON.stringify({
                            messages: messages,
                            stream: true,
                            model: model,
                            temperature: 0.5,
                            presence_penalty: 2
                        })
                    }
                )

                const reader = response.body.getReader()
                const decoder = new TextDecoder('utf-8')
                let result = ''

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    const chunk = decoder.decode(value, { stream: true })
                    const lines = chunk.split('\n').filter(line => line.trim())
                    for (const line of lines) {
                        if (line === 'data: [DONE]') {
                            editorContent.value = result.trim()
                            if (continuousQA.value) {
                                conversationHistory.value.push({
                                    role: 'user',
                                    content: inputMode.value === 'url' ? urlInput.value : title.value
                                })
                                conversationHistory.value.push({
                                    role: 'assistant',
                                    content: result.trim()
                                })
                            } else {
                                conversationHistory.value = []
                            }
                            return
                        }
                        if (line.startsWith('data: ')) {
                            const data = JSON.parse(line.slice(6))
                            if (data.choices[0].delta && data.choices[0].delta.content) {
                                result += data.choices[0].delta.content
                                editorContent.value = result // Update the editor content
                            }
                        }
                    }
                }

                editorContent.value = result.trim()
            } catch (error) {
                console.error('Error generating mind map:', error)
            }
        }

        const handleDownload = async (format) => {
            if (!svgRef.value) return

            try {
                let dataUrl;
                const svgNode = svgRef.value;

                // 强制适配屏幕下载
                if (!fitToScreenState.value) {
                    fitToScreen();
                }
                // 等待500ms后再下载
                await new Promise(resolve => setTimeout(resolve, 500));

                // 设置白色背景
                svgNode.style.backgroundColor = '#ffffff';

                switch (format) {
                    case 'png':
                        dataUrl = await htmlToImage.toPng(svgNode, { backgroundColor: '#ffffff' });
                        break;
                    case 'jpeg':
                        dataUrl = await htmlToImage.toJpeg(svgNode, { backgroundColor: '#ffffff' });
                        break;
                    case 'svg':
                        const svgContent = new XMLSerializer().serializeToString(svgNode);
                        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
                        saveAs(svgBlob, `mindmap.svg`);
                        return;
                    default:
                        throw new Error('Unsupported format');
                }
                saveAs(dataUrl, `mindmap.${format}`);
            } catch (error) {
                console.error('Error saving image:', error);
            }
        }

        onMounted(() => {
            nextTick(() => {
                if (svgRef.value) {
                    mm.value = Markmap.create(svgRef.value)
                    update()
                }
            })
        })

        watch(editorContent, () => {
            nextTick(update)
        })

        return {
            inputMode,
            urlInput,
            title,
            editorContent,
            continuousQA,
            generateMindMap,
            zoomIn,
            zoomOut,
            fitToScreen,
            fitToScreenState,
            svgRef,
            handleDownload
        }
    }
}
</script>

<style scoped>
.mind-container {
    width: 100%;
    height: 100%;
    display: flex;
    padding: 10px;
    background-color: #f5f5f5;
}

.left-panel {
    display: flex;
    flex-direction: column;
    max-height: 100vh;
    overflow: auto;
    padding: 20px;
    background-color: #fff;
    border-right: 1px solid #dcdcdc;
    border-radius: 10px;
}

.right-panel {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 20px;
    background-color: #fff;
    border-radius: 10px;
}

.svg-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    background-color: #fff;
    border: 1px solid #dcdcdc;
    border-radius: 10px;
}

.markmap-svg {
    width: 100%;
    height: 100%;
}

.controls {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    margin-top: 10px;
}
</style>
