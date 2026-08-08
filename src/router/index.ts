import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import { useCoachingStore } from '../stores/coaching'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/coach',
      name: 'coach',
      component: () => import('../views/CoachDashboard.vue'),
      meta: { requiresCoach: true }
    },
    {
      path: '/assessment',
      name: 'assessment',
      component: () => import('../views/Assessment.vue')
    },
    {
      path: '/values',
      name: 'values',
      component: () => import('../views/Values.vue')
    },
    {
      path: '/kamchi',
      name: 'kamchi',
      component: () => import('../views/Kamchi.vue')
    },
    {
      path: '/colors',
      name: 'colors',
      component: () => import('../views/ColorTest.vue')
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const store = useCoachingStore()

  // 1. Check if user is logged in
  if (to.path !== '/login' && !store.currentUser) {
    return next('/login')
  }

  // 2. Check if route requires coach role
  if (to.meta.requiresCoach) {
    if (!store.currentUser?.roles?.includes('coach')) {
      return next('/dashboard')
    }
  }

  // 3. If going to login while already logged in
  if (to.path === '/login' && store.currentUser) {
    if (store.currentUser.roles.includes('coach')) {
      return next('/coach')
    }
    return next('/dashboard')
  }

  next()
})

export default router
