import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  const _accessToken = ref(localStorage.getItem('access_token') || '');

  const accessToken = computed(() => _accessToken.value);
  const isAuthenticated = computed(() => !!accessToken.value);

  function setAccessToken(token) {
    if (token) {
      localStorage.setItem('access_token', token);
      _accessToken.value = token;
    }
  }

  function clearAccessToken() {
    localStorage.removeItem('access_token');
    _accessToken.value = '';
  }

  return { accessToken, isAuthenticated, setAccessToken, clearAccessToken };
});
