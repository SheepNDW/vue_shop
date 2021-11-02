import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    // 自動定位至登入頁
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/Home',
    component: Home
  },
]

const router = new VueRouter({
  routes
})

// 掛載路由導航守衛
router.beforeEach((to, from, next) => {
  // 訪問登入頁直接放行
  if (to.path === '/login') return next()
  // 獲取 token 值
  const tokenStr = window.sessionStorage.getItem('token')
  // 沒有token, 直接送回登入頁
  if (!tokenStr) return next('/login')
  next()
})

export default router
