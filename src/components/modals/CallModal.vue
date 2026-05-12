<template>
  <Dialog v-model:visible="callStore.isCallModalVisible" modal class="w-full m-2!">
    <template #header>
      <div class="flex items-center gap-2">
        <i class="pi pi-phone text-green-400" style="font-size: 1.5rem"></i>

        <span class="ml-2 text-2xl">
          <span class="text-green-400">
            {{ callStore.remoteUserName }}
          </span>

          <br />

          {{ headerTitle }}
        </span>
      </div>
    </template>

    <template #closebutton>
      <div></div>
    </template>

    <template #footer>
      <div
        v-if="callStore.callState === callStates.income"
        class="flex items-center justify-center w-full gap-10"
      >
        <Button icon="pi pi-phone" size="large" severity="success" rounded @click="accept" />
        <Button icon="pi pi-times" size="large" severity="danger" rounded @click="reject" />
      </div>

      <div
        v-else-if="callStore.callState === callStates.ringing"
        class="flex items-center justify-center w-full gap-10"
      >
        <Button icon="pi pi-times" size="large" severity="danger" rounded @click="cancel" />
      </div>

      <div
        v-else-if="callStore.callState === callStates.call"
        class="flex items-center justify-center w-full gap-10"
      >
        <Button
          icon="pi pi-microphone"
          size="large"
          :severity="isMicrophoneEnabled ? 'primary' : 'secondary'"
          rounded
          @click="() => _toggleMicrophone(!isMicrophoneEnabled)"
        />
        <Button
          icon="pi pi-camera"
          size="large"
          :severity="isCameraEnabled ? 'primary' : 'secondary'"
          rounded
          @click="() => _toggleCamera(!isCameraEnabled)"
        />
        <Button icon="pi pi-times" size="large" severity="danger" rounded @click="cancel" />
      </div>

      <div
        v-else-if="callStore.callState === callStates.rejected"
        class="flex items-center justify-center w-full gap-10"
      >
        <Button icon="pi pi-times" size="large" severity="danger" rounded @click="close" />
      </div>

      <div
        v-else-if="callStore.callState === callStates.canceled"
        class="flex items-center justify-center w-full gap-10"
      >
        <Button icon="pi pi-times" size="large" severity="danger" rounded @click="close" />
      </div>
    </template>

    <div>
      <div
        v-if="callStore.callState === callStates.income"
        class="flex items-center justify-center h-full"
      >
        <span>Income Call Icon</span>
      </div>

      <div
        v-if="callStore.callState === callStates.ringing"
        class="flex items-center justify-center h-full"
      >
        <span>Ringing Icon</span>
      </div>

      <div v-show="callStore.callState === callStates.call" class="flex flex-col gap-3">
        <video ref="localVideoRef" class="video" autoplay playsinline muted />
        <video ref="remoteVideoRef" class="video" autoplay playsinline muted />

        <audio ref="remoteAudioRef" autoplay />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { Dialog, Button } from 'primevue';
import { computed, ref, watchEffect } from 'vue';
import { callStates, useCallStore } from '@/stores/callStore.js';
import { useWebRTC } from '@/composables/webRTC.js';
import { useAuthStore } from '@/stores/authStore.js';
import { apiAcceptCall, apiCancelCall, apiRejectCall } from '@/api.js';

const authStore = useAuthStore();
const callStore = useCallStore();

const isMicrophoneEnabled = ref(true);
const isCameraEnabled = ref(false);

const {
  localVideoRef,
  remoteVideoRef,
  remoteAudioRef,
  initPeerConnection,
  acceptCall,
  cancelCall,
  toggleCamera,
  toggleMicrophone,
} = useWebRTC();

const headerTitle = computed(() => {
  switch (callStore.callState) {
    case callStates.income:
      return `Income call`;
    case callStates.ringing:
      return 'Ringing..';
    case callStates.connecting:
      return 'Connecting..';
    case callStates.rejected:
      return 'Call rejected';
    case callStates.canceled:
      return 'Call canceled';
    default:
      return 'Call';
  }
});

watchEffect(() => {
  if (callStore.callState === callStates.canceled) {
    isCameraEnabled.value = false;
    isMicrophoneEnabled.value = true;
  }

  if (callStore.callState === callStates.call) {
    // _toggleMicrophone(true);
  }
});

function reject() {
  apiRejectCall(callStore.remoteUserId);

  callStore.setState(callStates.await);
}

async function accept() {
  callStore.setState(callStates.connecting);

  await apiAcceptCall(callStore.remoteUserId);
  await acceptCall();
}

function cancel() {
  apiCancelCall(callStore.remoteUserId);

  callStore.setState(callStates.canceled);
}

function close() {
  callStore.setState(callStates.await);
}

async function _toggleCamera() {
  if (isCameraEnabled.value) {
    await toggleCamera(false);

    isCameraEnabled.value = false;
  } else {
    await toggleCamera(true);

    isCameraEnabled.value = true;
  }
}

async function _toggleMicrophone(enabled) {
  await toggleMicrophone(enabled);

  isMicrophoneEnabled.value = enabled;
}

watchEffect(async () => {
  switch (callStore.callState) {
    case callStates.connecting:
      await initPeerConnection(authStore.userInfo.id, callStore.remoteUserId);
      break;
    case callStates.canceled:
      cancelCall();
      break;
  }
});
</script>
