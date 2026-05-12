<template>
  <div class="p-4 flex justify-between items-center bg-stone-800 rounded-lg">
    <span class="text-xl">{{ name }}</span>

    <div class="flex gap-4">
      <Button icon="pi pi-phone" aria-label="Call friend" @click="call" />
      <Button icon="pi pi-trash" aria-label="Delete friend" severity="danger" />
    </div>
  </div>
</template>

<script setup>
import { Button } from 'primevue';
import { apiStartCall } from '@/api.js';
import { callStates, useCallStore } from '@/stores/callStore.js';

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

const callStore = useCallStore();

function call() {
  apiStartCall(props.id);

  callStore.remoteUserName = props.name;
  callStore.remoteUserId = props.id;

  callStore.setState(callStates.ringing);
}
</script>
