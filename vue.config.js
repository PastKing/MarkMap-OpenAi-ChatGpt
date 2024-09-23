const { defineConfig } = require('@vue/cli-service')
const dotenv = require('dotenv');
dotenv.config();
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 7000
  },

  chainWebpack: config =>{
    config.plugin('html')
        .tap(args => {
          args[0].title = "MarkMap";
          return args;
        })
  }
})
