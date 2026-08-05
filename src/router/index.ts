import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard
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

export default router
