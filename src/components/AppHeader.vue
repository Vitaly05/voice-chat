<template>
  <header class="sticky top-0 z-999 min-h-15 p-2 border-b border-green-600">
    <div class="absolute left-2 top-2">
      <OverlayBadge v-if="appStateStore.haveNotification" severity="info">
        <Button @click="appStateStore.showMenu" icon="pi pi-bars" aria-label="Open menu" />
      </OverlayBadge>

      <Button v-else @click="appStateStore.showMenu" icon="pi pi-bars" aria-label="Open menu" />
    </div>

    <h1 class="text-center text-2xl">Voice Chat</h1>
  </header>
</template>
<script setup>
import { Button, OverlayBadge } from 'primevue';
import { useAppStateStore } from '@/stores/appStateStore.js';

const appStateStore = useAppStateStore();
</script>
