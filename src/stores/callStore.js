import { defineStore } from 'pinia';
import { ref } from 'vue';

const useCallStore = defineStore('call', () => {
  const isCallModalVisible = ref(false);
  const isCallStarted = ref(false);
  const isCallAccepted = ref(false);
  const remoteUserId = ref(null);

  function showCallModal() {
    isCallModalVisible.value = true;
  }

  function hideCallModal() {
    isCallModalVisible.value = false;
  }

  function startCall(_remoteUserId) {
    remoteUserId.value = _remoteUserId;
    isCallStarted.value = true;
  }

  function acceptCall(_remoteUserId) {
    remoteUserId.value = _remoteUserId;
    isCallStarted.value = true;
    isCallAccepted.value = true;
  }

  return {
    isCallModalVisible,
    isCallStarted,
    isCallAccepted,
    remoteUserId,
    showCallModal,
    hideCallModal,
    startCall,
    acceptCall,
  };
});

export { useCallStore };
