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
import { apiAcceptCall } from '@/api.js';
import { useCallStore } from '@/stores/callStore.js';
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
    await apiAcceptCall(event.sender_id);

    callStore.showCallModal();
    callStore.acceptCall(event.sender_id);
  });
}

function listenCallAccepts(currentUserId) {
  // eslint-disable-next-line no-undef
  Echo.private(`Chat.${currentUserId}`).listen('.accept-call', async (event) => {
    callStore.showCallModal();
    callStore.startCall(event.recipient_id);
  });
}
</script>
