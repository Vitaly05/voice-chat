import { defineStore } from 'pinia';
import { ref } from 'vue';

const callStates = {
  await: 0,
  income: 1,
  ringing: 2,
  connecting: 3,
  call: 4,
  rejected: 5,
  canceled: 6,
};

const useCallStore = defineStore('call', () => {
  const isCallModalVisible = ref(false);
  const isCallStarted = ref(false);
  const isCallAccepted = ref(false);
  const remoteUserId = ref(null);
  const remoteUserName = ref('');
  const callState = ref(callStates.canceled);

  function setState(state) {
      callState.value = state;
      isCallModalVisible.value = true;
  }

  function startCall() {
    isCallStarted.value = true;
  }

  function acceptCall() {
    isCallStarted.value = true;
    isCallAccepted.value = true;
  }

  return {
    isCallModalVisible,
    isCallStarted,
    isCallAccepted,
    remoteUserId,
    remoteUserName,
    callState,
    setState,
    startCall,
    acceptCall,
  };
});

export { useCallStore, callStates };
