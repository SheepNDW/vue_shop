import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 引入第三方icon
import './assets/fonts/iconfont.css'

// global樣式
import './assets/css/global.css'

import axios from 'axios'
// 配置請求根路徑
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
