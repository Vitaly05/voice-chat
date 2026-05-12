import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { apiGetCurrentUserInfo } from '@/api.js';

const _accessTokenKey = 'access_token';

const useAuthStore = defineStore('auth', () => {
  const _accessToken = ref(localStorage.getItem(_accessTokenKey) || '');

  const accessToken = computed(() => _accessToken.value);
  const isAuthenticated = computed(() => !!accessToken.value);

  const userInfo = ref(null);

  function setAccessToken(token) {
    if (token) {
      localStorage.setItem(_accessTokenKey, token);
      _accessToken.value = token;
    }
  }

  function clearAccessToken() {
    localStorage.removeItem(_accessTokenKey);
    _accessToken.value = '';
  }

  async function getUserInfo() {
    userInfo.value = await apiGetCurrentUserInfo();
  }

  return { accessToken, isAuthenticated, userInfo, setAccessToken, clearAccessToken, getUserInfo };
});

export { useAuthStore };
