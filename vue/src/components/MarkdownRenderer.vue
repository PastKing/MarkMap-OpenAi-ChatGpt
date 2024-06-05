<template>
    <div v-html="compiledMarkdown"></div>
</template>

<script>
import MarkdownIt from 'markdown-it';

export default {
    name: 'MarkdownRenderer',
    props: {
        content: {
            type: String,
            required: true
        }
    },
    computed: {
        compiledMarkdown() {
            const md = new MarkdownIt();
            console.log(md.render(this.content));
            return md.render(this.content);
        }
    }
};
</script>

<style scoped>

</style>
