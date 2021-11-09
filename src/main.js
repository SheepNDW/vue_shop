import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 引入第三方icon
import './assets/fonts/iconfont.css'

// global樣式
import './assets/css/global.css'

import TreeTable from 'vue-table-with-tree-grid'

// 引入富文本編輯器
import VueQuillEditor from 'vue-quill-editor'
// 引入富文本編輯器對應的樣式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import axios from 'axios'
// 配置請求根路徑
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最後必須 return config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
// 將富文本編輯器註冊為全局可用的組件
Vue.use(VueQuillEditor)

// 全局時間過濾器
Vue.filter('dateFormat', function (originValue) {
  const dt = new Date(originValue)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
