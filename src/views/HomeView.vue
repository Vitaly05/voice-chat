<template>
  <AppHeader />

  <CallModal />
  <AddFriendModal />
  <FriendshipRequestsModal />

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
import AddFriendModal from '@/components/modals/AddFriendModal.vue';
import FriendshipRequestsModal from '@/components/modals/FriendshipRequestsModal.vue';
import { useAppStateStore } from '@/stores/appStateStore.js';
import { apiGetNotificationsCount } from '@/api.js';
import { useToast } from 'primevue';

const toast = useToast();

const appStateStore = useAppStateStore();
const authStore = useAuthStore();
const callStore = useCallStore();

onMounted(async () => {
  await authStore.getUserInfo();

  listenChatChannel(authStore.userInfo.id);

  await getNotificationsCount();
});

function listenChatChannel(currentUserId) {
  // eslint-disable-next-line no-undef
  Echo.private(`Chat.${currentUserId}`)
    .listen('.income-call', (event) => {
      callStore.remoteUserId = event.sender_id;
      callStore.remoteUserName = event.sender_name;

      callStore.setState(callStates.income);
    })
    .listen('.accept-call', () => {
      callStore.setState(callStates.connecting);
      callStore.isCallAccepted = true;
    })
    .listen('.reject-call', () => {
      callStore.setState(callStates.rejected);
    })
    .listen('.cancel-call', () => {
      callStore.setState(callStates.canceled);
    })
    .listen('.new-friendship-request', (event) => {
      appStateStore.notificationsCount++;
      appStateStore.events.newFriendshipRequest?.({
        id: event.user_id,
        name: event.user_name,
      });

      toast.add({
        summary: 'You have received a new friend request',
        severity: 'info',
        life: 5000,
      });
    })
    .listen('.accept-friendship-request', (event) => {
      appStateStore.events.friendshipRequestAccepted?.({
        id: event.user_id,
        name: event.user_name,
      });

      toast.add({
        summary: `${event.user_name} accept your friendship request`,
        severity: 'info',
        life: 5000,
      });
    })
    .listen('.remove-friend', (event) => {
      appStateStore.events.friendRemoved?.(event.user_id);

      toast.add({
        summary: `${event.user_name} remove you from friend list`,
        severity: 'info',
        life: 5000,
      });
    });
}

async function getNotificationsCount() {
  const response = await apiGetNotificationsCount();

  if (response?.success) {
    appStateStore.notificationsCount = response.count;
  }
}
</script>
