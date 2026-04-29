<template>
  <AppMenu />

  <RouterView />

  <Toast position="bottom-center" />
  <ConfirmPopup />
</template>

<script setup>
import { RouterView } from 'vue-router'
import { Toast, ConfirmPopup } from 'primevue';
import AppMenu from '@/components/AppMenu.vue';
</script>
