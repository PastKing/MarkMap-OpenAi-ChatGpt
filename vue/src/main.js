import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import '@/assets/css/global.css'
import '@/assets/css/iconfont/iconfont.css'
import '@/assets/css/theme/index.css'
import 'highlight.js/styles/monokai-sublime.css'

Vue.config.productionTip = false
Vue.use(ElementUI, { size: 'small' });

console.log('VUE_APP_API_BASE_URL:', process.env.VUE_APP_API_BASE_URL);
console.log('VUE_APP_API_KEY:', process.env.VUE_APP_API_KEY);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
