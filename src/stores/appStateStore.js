import { defineStore } from 'pinia';
import { ref } from 'vue';
import { modals } from '@/composables/modal.js';

const useAppStateStore = defineStore('appState', () => {
  const isMenuVisible = ref(false);
  const notificationsCount = ref(0);

  const activeModal = ref(modals.none);

  const events = {
    acceptFriendshipRequest: undefined,
    newFriendshipRequest: undefined,
    friendshipRequestAccepted: undefined,
    autoAddedFriend: undefined,
    friendRemoved: undefined,
  };

  function showMenu() {
    isMenuVisible.value = true;
  }

  function hideMenu() {
    isMenuVisible.value = false;
  }

  function showModal(modal) {
    if (Object.values(modals).includes(modal)) {
      activeModal.value = modal;
    } else {
      console.error('Invalid modal.');
    }
  }

  return {
    isMenuVisible,
    notificationsCount,
    activeModal,
    events,
    showMenu,
    hideMenu,
    showModal,
  };
});

export { useAppStateStore };
