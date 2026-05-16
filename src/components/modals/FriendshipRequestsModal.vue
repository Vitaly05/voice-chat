<template>
  <Dialog
    v-model:visible="isVisible"
    header="Friendship requests"
    class="pb-4"
    modal
    :style="{ width: '90%' }"
    @hide="onClose"
  >
    <div v-if="isLoading" class="flex flex-col gap-4">
      <Skeleton v-for="n in 4" height="4rem" :key="n" />
    </div>

    <div v-else-if="requests.length === 0" class="text-xl text-center">No friendship requests</div>

    <div v-else class="flex flex-col gap-4">
      <FriendshipRequestItem
        v-for="request in requests"
        :name="request.name"
        :id="request.id"
        :key="request.id"
        @remove="removeRequest"
      />
    </div>
  </Dialog>
</template>

<script setup>
import { Dialog, Skeleton } from 'primevue';
import { modals, useModal } from '@/composables/modal.js';
import FriendshipRequestItem from '@/components/FriendshipRequestItem.vue';
import { onMounted, ref } from 'vue';
import { apiGetFriendshipRequests } from '@/api.js';
import { useAppStateStore } from '@/stores/appStateStore.js';

const appStateStore = useAppStateStore();

const { isVisible, onClose } = useModal(modals.friendshipRequests);

const isLoading = ref(true);
const requests = ref([]);

onMounted(async () => {
  isLoading.value = true;

  const response = await apiGetFriendshipRequests();

  isLoading.value = false;

  if (response) {
    requests.value = response;
  }
});

appStateStore.events.newFriendshipRequest = (request) => {
  requests.value.push(request);
};

appStateStore.events.autoAddedFriend = (request) => {
  removeRequest(request.id);
};

function removeRequest(id, callback) {
  requests.value.forEach((request, i) => {
    if (request.id === id) {
      requests.value.splice(i, 1);

      callback?.(request);
    }
  });
}
</script>
