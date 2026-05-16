import { ref, watchEffect } from 'vue';
import { useAppStateStore } from '@/stores/appStateStore.js';

export const modals = {
  none: 0,
  addFriend: 1,
  friendshipRequests: 2,
};

export function useModal(modal) {
  const appStateStore = useAppStateStore();

  const isVisible = ref(false);

  const events = {
    onOpen: undefined,
  }

  watchEffect(() => {
    if (appStateStore.activeModal === modal) {
      isVisible.value = true;

      events.onOpen?.();
    }
  });

  function onClose() {
    appStateStore.showModal(modals.none);
  }

  return { isVisible, onClose, events };
}
