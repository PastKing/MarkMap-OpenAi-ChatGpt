<template>
    <div>
        <h1>About Us</h1>
        <MarkdownRenderer :content="markdownContent" />
        <img src="https://jsd.cdn.zzko.cn/gh/PastKing/image-tuchuang/收款码-拷贝.4x4g3os37sm0.jpg" alt="收款码" style="width: 200px;"/>

    </div>
</template>

<script>
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';

export default {
    name: 'About',
    components: {
        MarkdownRenderer,
    },
    data() {
        return {
            markdownContent: `
# 我们的使命

淡泊明志，宁静致远。珍惜原创，矢志不渝。

# 我们的目的

_开源是为了_ 让所有朋友用上免费的GPT Ai思维导图。

# 作者

PastKing

![](https://jsd.cdn.zzko.cn/gh/PastKing/image-tuchuang/qrcode_for_gh_4d0c4adc3dae_258.1xj62q31y2u8.jpg)

# 源码地址

源码(GitHub)：[mindmap-generator](https://github.com/PastKing/MarkMap-OpenAi-ChatGpt)

源码(Gitee)：[mindmap-generator](https://gitee.com/past-dust/mindmap-generator)

# 赞助/支持
`
        };
    }
};
</script>
<style>

</style>
