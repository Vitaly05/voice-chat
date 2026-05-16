<template>
  <div v-if="isLoading" class="flex flex-col gap-4 py-4">
    <Skeleton v-for="n in 4" height="4rem" :key="n" />
  </div>

  <div v-else-if="friends.length > 0" class="flex flex-col gap-4 py-4">
    <FriendItem
      v-for="friend in friends"
      :key="friend.id"
      :name="friend.name"
      :id="friend.id"
      @remove="removeFriend"
    />
  </div>

  <div v-else class="flex flex-col items-center py-6">
    <div class="text-xl">You haven't added any friends</div>

    <Button label="Add friend" icon="pi pi-plus" class="mt-5" @click="addFriend" />
  </div>
</template>

<script setup>
import FriendItem from '@/components/FriendItem.vue';
import { Button, Skeleton } from 'primevue';
import { onMounted, ref } from 'vue';
import { apiGetAllFriends } from '@/api.js';
import { useAppStateStore } from '@/stores/appStateStore.js';
import { modals } from '@/composables/modal.js';

const appStateStore = useAppStateStore();

const friends = ref([]);
const isLoading = ref(false);

onMounted(async () => {
  isLoading.value = true;

  const result = await apiGetAllFriends();

  isLoading.value = false;

  friends.value = result;
});

appStateStore.events.acceptFriendshipRequest = (user) => {
  friends.value.push(user);
};

appStateStore.events.friendshipRequestAccepted = (user) => {
  friends.value.push(user);
};

appStateStore.events.friendRemoved = removeFriend;

function addFriend() {
  appStateStore.showModal(modals.addFriend);
}

function removeFriend(userId) {
  friends.value.forEach((friend, i) => {
    if (friend.id === userId) {
      friends.value.splice(i, 1);
    }
  });
}
</script>
