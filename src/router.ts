import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import AppControl from './components/app-control.vue'
import AppSettings from './components/app-settings.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/control' },
  { path: '/index.html', redirect: '/control' },
  { path: '/control', name: 'control', component: AppControl },
  { path: '/settings', name: 'settings', component: AppSettings },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
