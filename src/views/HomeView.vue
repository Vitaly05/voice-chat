<template>
  <AppHeader />
  <CallModal />

  <main class="px-2">
    <FriendList />
  </main>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue';
import FriendList from '@/components/FriendList.vue';
import CallModal from '@/components/modals/CallModal.vue';
import { onMounted } from 'vue';
import { callStates, useCallStore } from '@/stores/callStore.js';
import { useAuthStore } from '@/stores/authStore.js';

const authStore = useAuthStore();
const callStore = useCallStore();

onMounted(async () => {
  await authStore.getUserInfo();

  listenIncomingCalls(authStore.userInfo.id);
  listenCallAccepts(authStore.userInfo.id);
});

function listenIncomingCalls(currentUserId) {
  // eslint-disable-next-line no-undef
  Echo.private(`Chat.${currentUserId}`).listen('.income-call', async (event) => {
    callStore.remoteUserId = event.sender_id;
    callStore.remoteUserName = event.sender_name;

    callStore.setState(callStates.income);
  });
}

function listenCallAccepts(currentUserId) {
  // eslint-disable-next-line no-undef
  Echo.private(`Chat.${currentUserId}`).listen('.accept-call', async (event) => {
    callStore.setState(callStates.connecting);
    callStore.startCall();
  });
}
</script>
