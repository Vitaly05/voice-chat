import { createRouter, createWebHistory } from 'vue-router';
import LobbyView from '../views/LobbyView.vue';
import { useAuthStore } from '@/stores/authStore.js';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'lobby',
      component: LobbyView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
  ],
});

router.beforeEach((to) => {
  if (to.name !== 'login' && !useAuthStore().isAuthenticated) {
    return { name: 'login' };
  }
});

export default router;
