import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: {name: 'vr1'}
    },
    {
      path: '/sandbox',
      name: 'sandbox',
      component: () => import('@/views/Sandbox.vue'),
    },
    {
      path: '/wall',
      name: 'wall',
      component: () => import('@/views/WallTests.vue'),
    },
    {
      path: '/speech',
      name: 'speech',
      component: () => import('@/views/SpeechExperiments.vue')
    },
    {
      path: '/vr1',
      name: 'vr1',
      component: () => import('@/views/VR1.vue')
    },
    {
      path: '/vr2',
      name: 'vr2',
      component: () => import('@/views/VR2.vue')
    },
    {
      path: '/avatar',
      name: 'avatar',
      component: () => import('@/views/Avatar.vue')
    },
    {
      path: '/laser',
      name: 'laser',
      component: () => import('@/views/LaserScene.vue')
    },
  ]
})

export default router
