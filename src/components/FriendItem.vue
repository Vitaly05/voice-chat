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

async function call() {
  await apiStartCall(props.id);
}
</script>
