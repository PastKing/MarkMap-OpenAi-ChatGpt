# GPT 思维导图生成器

> 本项目完全开源
> 如果觉得不错麻烦帮忙点一次`Star⭐️`

## 项目简介
本项目是一个结合了Vue、Markmap和OpenAI ChatGPT的思维导图生成工具。用户可以输入标题和内容，通过调用ChatGPT生成思维导图，并支持放大、缩小、适应屏幕和下载功能。

## 效果演示
![](doc/PastKing_2024-06-05_13-14-09.gif)

## 技术栈
- **前端框架**：Vue
- **UI组件库**：Element Ui
- **思维导图库**：Markmap
- **图像生成库**：html-to-image
- **文件保存库**：file-saver
- **AI模型**：OpenAI ChatGPT

## 项目结构
```
├── public
│ └── index.html
├── src
│ ├── assets
│ ├── components
│ │ └── MarkdownRenderer.vue
│ ├── views
│ │ └── Home.vue
│ │ └── About.vue
│ ├── App.vue
│ └── main.js
├── .env
├── .gitignore
├── package.json
├── README.md
└── vue.config.js
```


## 联系作者
- **邮箱**：pastking@ltde.cn
- **公众号**：昔尘科技

## 项目部署教程
1. **克隆项目**：
    ```bash
    git clone https://github.com/example/mindmap-generator.git
    cd mindmap-generator
    ```

2. **安装依赖**：
    ```bash
    npm install
    ```

3. **配置环境变量**：
    在项目根目录创建一个`.env`文件，并添加以下内容：
    ```
    VUE_APP_API_BASE_URL=https://api.openai.com
    VUE_APP_API_KEY=your_openai_api_key
    ```

4. **运行项目**：
    ```bash
    npm run serve
    ```

5. **构建项目**：
    ```bash
    npm run build
    ```

6. **部署项目**：
    将`dist`文件夹中的内容上传到你的服务器或静态文件托管服务（如Vercel、Netlify等）。

## 赞助/支持
<img src="https://jsd.cdn.zzko.cn/gh/PastKing/image-tuchuang/收款码-拷贝.4x4g3os37sm0.jpg" alt="收款码" style="width: 200px;"/>
