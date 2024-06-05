<template>
    <el-row :gutter="20" class="mind-container">
        <el-col :span="8" class="left-panel">
            <el-row :gutter="20">
                <el-col :span="24">
                    <el-input v-model="title" placeholder="输入标题"></el-input>
                </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-top: 10px;">
                <el-col :span="24">
                    <el-button type="primary" @click="generateMindMap">生成</el-button>
                </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-top: 20px;">
                <el-col :span="24">
                    <el-input v-model="editorContent" type="textarea" rows="10" placeholder="编辑内容"></el-input>
                </el-col>
            </el-row>
        </el-col>

        <el-col :span="16" class="right-panel">
            <div class="svg-container">
                <svg ref="svgRef" class="markmap-svg"></svg>
            </div>
            <el-row :gutter="10" class="controls">
                <el-col :span="6">
                    <el-button @click="zoomIn">放大</el-button>
                </el-col>
                <el-col :span="6">
                    <el-button @click="zoomOut">缩小</el-button>
                </el-col>
                <el-col :span="6">
                    <el-button @click="fitToScreen">适应屏幕</el-button>
                </el-col>
                <el-col :span="6">
                    <el-button @click="onSave">下载</el-button>
                </el-col>
            </el-row>
        </el-col>
    </el-row>
</template>

<script>
import { ref, onMounted, onUpdated } from 'vue'
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'
import * as htmlToImage from 'html-to-image'
import { saveAs } from 'file-saver'

export default {
    name: 'HomeView',
    setup() {
        const transformer = new Transformer()

        const title = ref('')
        const editorContent = ref(`
# 思维导图

1. 标题1
 - 子标题1
 - 子标题2
3. 标题2
4. 标题3
- beautiful
- useful
- easy
- interactive
        `)

        const mm = ref()
        const svgRef = ref()

        const update = () => {
            const { root } = transformer.transform(editorContent.value)
            mm.value.setData(root)
            mm.value.fit()
        }

        const zoomIn = () => mm.value.rescale(1.25)

        const zoomOut = () => mm.value.rescale(0.8)

        const fitToScreen = () => mm.value.fit()

        const onSave = async () => {
            const dataUrl = await htmlToImage.toPng(svgRef.value)
            saveAs(dataUrl, 'pastking.png')
        }

        const generateMindMap = async () => {
            try {
                const response = await fetch(
                    `${process.env.VUE_APP_API_BASE_URL}/v1/chat/completions`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${process.env.VUE_APP_API_KEY}`
                        },
                        body: JSON.stringify({
                            messages: [
                                {
                                    role: 'system',
                                    content: `我将设计思维导图，请以markdown格式输出`
                                },
                                {
                                    role: 'user',
                                    content: `${title.value}`
                                }
                            ],
                            stream: true,
                            model: `gpt-3.5-turbo`,
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
                        if (line === 'data: [DONE]') return
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
                update()
            } catch (error) {
                console.error('Error generating mind map:', error)
            }
        }

        onMounted(() => {
            // 初始化markmap思维导图
            mm.value = Markmap.create(svgRef.value)
            // 更新思维导图渲染
            update()
        })

        onUpdated(update)

        return {
            title,
            editorContent,
            generateMindMap,
            zoomIn,
            zoomOut,
            fitToScreen,
            onSave,
            svgRef
        }
    }
}
</script>

<style scoped>
.mind-container {
    width: 100%;
    height: 100%;
    display: flex;
}

.left-panel {
    display: flex;
    flex-direction: column;
    max-height: 100vh;
    overflow: auto;
}

.right-panel {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.svg-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
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
