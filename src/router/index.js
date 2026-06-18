import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/landing/LandingView.vue'
import FeaturesView from '../views/landing/FeaturesView.vue'
import AboutView from '../views/landing/AboutView.vue'
import ByodbView from '../views/landing/ByodbView.vue'
import PricingView from '../views/landing/PricingView.vue'
import OpenSourceView from '../views/landing/OpenSourceView.vue'
import ChangelogView from '../views/landing/ChangelogView.vue'
import LegalView from '../views/landing/LegalView.vue'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'
import TrackerView from '../views/TrackerView.vue'
import ExpenseDetailView from '../views/ExpenseDetailView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import SettingsView from '../views/SettingsView.vue'
import { useAuth } from '../composables/useAuth'
import { useDatabaseConnection } from '../composables/useDatabaseConnection'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: LandingView
  },
  {
    path: '/features',
    name: 'features',
    component: FeaturesView
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView
  },
  {
    path: '/byodb',
    name: 'byodb',
    component: ByodbView
  },
  {
    path: '/pricing',
    name: 'pricing',
    component: PricingView
  },
  {
    path: '/open-source',
    name: 'open-source',
    component: OpenSourceView
  },
  {
    path: '/changelog',
    name: 'changelog',
    component: ChangelogView
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: LegalView,
    props: { page: 'privacy' }
  },
  {
    path: '/terms',
    name: 'terms',
    component: LegalView,
    props: { page: 'terms' }
  },
  {
    path: '/refund-policy',
    name: 'refund-policy',
    component: LegalView,
    props: { page: 'refund' }
  },
  {
    path: '/license',
    name: 'license',
    component: LegalView,
    props: { page: 'license' }
  },
  {
    path: '/login',
    redirect: (to) => ({ name: 'connect', query: to.query, hash: to.hash })
  },
  {
    path: '/connect',
    name: 'connect',
    component: LoginView
  },
  {
    path: '/app',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/app/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/app/expenses',
    name: 'expenses',
    component: TrackerView,
    meta: { requiresAuth: true }
  },
  {
    path: '/app/expenses/:id',
    name: 'expense-detail',
    component: ExpenseDetailView,
    meta: { requiresAuth: true }
  },
  {
    path: '/app/categories',
    name: 'categories',
    component: CategoriesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/app/recurrences',
    redirect: { name: 'dashboard' }
  },
  {
    path: '/app/settings',
    name: 'settings',
    component: SettingsView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  if ('config' in to.query) {
    const { applyConnectionFromBase64 } = useDatabaseConnection()
    applyConnectionFromBase64(to.query.config)

    const query = { ...to.query }
    delete query.config
    return {
      path: to.path,
      params: to.params,
      query,
      hash: to.hash,
      replace: true
    }
  }

  if (!to.meta.requiresAuth) return true

  const { isAuthenticated, restoreSession } = useAuth()
  if (isAuthenticated.value) return true

  const restored = await restoreSession()
  if (restored) return true

  return {
    name: 'connect',
    query: to.fullPath === '/app' ? {} : { redirect: to.fullPath }
  }
})

export default router
