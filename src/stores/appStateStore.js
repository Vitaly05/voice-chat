import { defineStore } from 'pinia';
import { ref } from 'vue';

const useAppStateStore = defineStore('appState', () => {
  const isMenuVisible = ref(false);
  const haveNotification = ref(false);

  function showMenu() {
    isMenuVisible.value = true;
  }

  function hideMenu() {
    isMenuVisible.value = false;
  }

  function showNotification() {
    haveNotification.value = true;
  }

  function hideNotification() {
    haveNotification.value = false;
  }

  return {
    isMenuVisible,
    haveNotification,
    showMenu,
    hideMenu,
    showNotification,
    hideNotification,
  };
});

export { useAppStateStore };
