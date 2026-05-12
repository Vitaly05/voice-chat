<template>
  <div v-if="isLoading" class="flex flex-col gap-4 py-4">
    <Skeleton v-for="n in 4" height="4rem" :key="n" />
  </div>

  <div v-else-if="friends.length > 0" class="flex flex-col gap-4 py-4">
    <FriendItem v-for="friend in friends" :key="friend.id" :name="friend.name" :id="friend.id" />
  </div>

  <div v-else class="flex flex-col items-center py-6">
    <div class="text-xl">You haven't added any friends</div>

    <Button label="Add friend" icon="pi pi-plus" class="mt-5" />
  </div>
</template>

<script setup>
import FriendItem from '@/components/FriendItem.vue';
import { Button, Skeleton } from 'primevue';
import { onMounted, ref } from 'vue';
import { apiGetAllFriends } from '@/api.js';

const friends = ref([]);
const isLoading = ref(false);

onMounted(async () => {
  isLoading.value = true;

  const result = await apiGetAllFriends();

  isLoading.value = false;

  friends.value = result;
});
</script>
