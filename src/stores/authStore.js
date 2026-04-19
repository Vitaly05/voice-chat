import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

const _accessTokenKey = 'access_token';

const useAuthStore = defineStore('auth', () => {
  const _accessToken = ref(localStorage.getItem(_accessTokenKey) || '');

  const accessToken = computed(() => _accessToken.value);
  const isAuthenticated = computed(() => !!accessToken.value);

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

  return { accessToken, isAuthenticated, setAccessToken, clearAccessToken };
});

export { useAuthStore };
