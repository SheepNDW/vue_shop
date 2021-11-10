import Vue from 'vue'
import VueRouter from 'vue-router'

// 使用路由懶加載的方式優化項目

const Login = () => import(/* webpackChunkName: "login_home_welome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "login_home_welome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "login_home_welome" */ '../components/Welcome.vue')

const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/Users.vue')
const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Roles.vue')

const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Cate.vue')
const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Params.vue')

const GoodsList = () => import(/* webpackChunkName: "GoodsList_Add" */ '../components/goods/List.vue')
const Add = () => import(/* webpackChunkName: "GoodsList_Add" */ '../components/goods/addpage/Add.vue')

const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/Order.vue')
const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/Report.vue')

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
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report },
    ]
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
