<template>
  <div class="flex justify-between items-center p-4 border border-stone-700 rounded">
    <span>
      {{ name }}
    </span>

    <div class="flex items-center gap-2">
      <Button
        icon="pi pi-plus"
        :aria-label="`Add ${name} to friends`"
        :loading="isLoading"
        @click="accept"
      />

      <Button
        icon="pi pi-minus"
        severity="danger"
        :aria-label="`Reject ${name} friendship request`"
        :loading="isLoading"
        @click="reject"
      />
    </div>
  </div>
</template>

<script setup>
import { Button, useToast } from 'primevue';
import { apiAcceptFriendshipRequest, apiRejectFriendshipRequest } from '@/api.js';
import { ref } from 'vue';
import { useAppStateStore } from '@/stores/appStateStore.js';

const toast = useToast();

const appStateStore = useAppStateStore();

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['remove']);

const isLoading = ref(false);

async function accept() {
  isLoading.value = true;

  const response = await apiAcceptFriendshipRequest(props.id);

  isLoading.value = false;

  processResponse(
    response,
    `${props.name} has been added to friends`,
    appStateStore.events.acceptFriendshipRequest,
  );
}

async function reject() {
  isLoading.value = true;

  const response = await apiRejectFriendshipRequest(props.id);

  isLoading.value = false;

  processResponse(response, `Friendship request from ${props.name} has been rejected`);
}

function processResponse(response, successMessage, callback) {
  if (!response) {
    toast.add({ summary: 'An unknown error has occurred', severity: 'error', life: 5000 });
    return;
  }

  if (!response.success) {
    if (response.message) {
      toast.add({ summary: response.message, severity: 'error', life: 5000 });
      return;
    }
  }

  toast.add({ summary: successMessage, severity: 'success', life: 5000 });

  appStateStore.notificationsCount--;

  emit('remove', props.id, callback);
}
</script>
