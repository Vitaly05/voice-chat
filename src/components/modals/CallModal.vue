<template>
  <Dialog v-model:visible="callStore.isCallModalVisible" modal class="w-full m-2!">
    <template #header>
      <div class="flex items-center gap-2">
        <i class="pi pi-phone text-green-400" style="font-size: 1.5rem"></i>

        <span class="text-2xl">Incoming Call</span>
      </div>
    </template>

    <template #closebutton>
      <div></div>
    </template>

    <template #footer>
      <div class="flex items-center justify-center w-full gap-10">
        <Button icon="pi pi-phone" size="large" severity="success" rounded />
        <Button icon="pi pi-times" size="large" severity="danger" rounded @click="close" />
      </div>
    </template>

    <div>
      <video ref="localVideoRef" autoplay playsinline muted />
      <video ref="remoteVideoRef" autoplay playsinline muted />

      <audio ref="remoteAudioRef" autoplay />
    </div>
  </Dialog>
</template>

<script setup>
import { Dialog, Button } from 'primevue';
import { onMounted, watchEffect } from 'vue';
import { useCallStore } from '@/stores/callStore.js';
import { useWebRTC } from '@/composables/webRTC.js';
import { useAuthStore } from '@/stores/authStore.js';

const authStore = useAuthStore();
const callStore = useCallStore();

const { localVideoRef, remoteVideoRef, remoteAudioRef, initPeerConnection, acceptCall } =
  useWebRTC();

function close() {
  callStore.hideCallModal();
}

watchEffect(async () => {
  if (callStore.isCallStarted) {
    await initPeerConnection(authStore.userInfo.id, callStore.remoteUserId);
  }

  if (callStore.isCallAccepted) {
    await acceptCall();
  }
});

onMounted(() => {
  // callStore.showCallModal();
});
</script>
