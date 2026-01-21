import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import LoginView from '../views/LoginView.vue'
import TrackerView from '../views/TrackerView.vue'
import { useAuth } from '../composables/useAuth'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: LandingView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/app',
    name: 'app',
    component: TrackerView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  if (!to.meta.requiresAuth) return true

  const { isAuthenticated } = useAuth()
  if (isAuthenticated.value) return true

  return { name: 'login' }
})

export default router
