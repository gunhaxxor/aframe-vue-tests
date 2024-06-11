import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/main',
      name: 'main',
      component: () => import('@/views/MainScene.vue'),
    },
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
      path: '/pdf',
      name: 'pdf',
      component: () => import('@/views/PDF.vue'),
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
      path: '/avatarold',
      name: 'avatarold',
      component: () => import('@/views/Avatar.vue')
    },
    {
      path: '/avatar',
      name: 'avatar',
      component: () => import('@/views/AvatarScene.vue')
    },
    {
      path: '/laser',
      name: 'laser',
      component: () => import('@/views/LaserScene.vue')
    },
    {
      path: '/emoji',
      name: 'emoji',
      component: () => import('@/views/EmojiScene.vue')
    },
    {
      path: '/ui',
      name: 'ui',
      component: () => import('@/views/UIScene.vue')
    },
    {
      path: '/colorpicker',
      name: 'colorpicker',
      component: () => import('@/views/ColorPickerScene.vue')
    },
  ]
})

export default router
