<template>
  <div class="p-4 flex justify-between items-center bg-stone-800 rounded-lg">
    <span class="text-xl">{{ name }}</span>

    <div class="flex gap-4">
      <Button icon="pi pi-phone" aria-label="Call friend" @click="call" />

      <Button
        icon="pi pi-trash"
        aria-label="Delete friend"
        severity="danger"
        :loading="isLoading"
        @click="removeFromFriends"
      />
    </div>
  </div>
</template>

<script setup>
import { Button, useToast } from 'primevue';
import { apiRemoveFriend, apiStartCall } from '@/api.js';
import { callStates, useCallStore } from '@/stores/callStore.js';
import { ref } from 'vue';

const props = defineProps({
  name: {
    type: String,
    default: 'Friend name',
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['remove']);

const toast = useToast();

const callStore = useCallStore();

const isLoading = ref(false);

function call() {
  apiStartCall(props.id);

  callStore.remoteUserName = props.name;
  callStore.remoteUserId = props.id;

  callStore.setState(callStates.ringing);
}

async function removeFromFriends() {
  isLoading.value = true;

  const response = await apiRemoveFriend(props.id);

  isLoading.value = false;

  processResponse(response);
}

function processResponse(response) {
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

  toast.add({
    summary: `${props.name} removed from your friends list`,
    severity: 'success',
    life: 5000,
  });

  emit('remove', props.id);
}
</script>
