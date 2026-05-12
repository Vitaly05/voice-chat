<template>
  <Drawer v-model:visible="appStateStore.isMenuVisible" header="Voice Chat">
    <Menu :model="menuItems" />
  </Drawer>
</template>

<script setup>
import { Drawer, Menu, useConfirm, useToast } from 'primevue';
import { useAppStateStore } from '@/stores/appStateStore.js';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore.js';
import { useRouter } from 'vue-router';

const appStateStore = useAppStateStore();
const authStore = useAuthStore();
const confirm = useConfirm();
const toast = useToast();
const router = useRouter();

const menuItems = ref([
  {
    label: 'Logout',
    command: logout,
    icon: 'pi pi-sign-out',
  },
]);

function logout(event) {
  confirm.require({
    target: event.originalEvent.currentTarget,
    message: 'Are you sure you want to logout?',
    icon: 'pi pi-question',
    acceptProps: {
      label: 'Yes',
      severity: 'danger',
    },
    rejectProps: {
      label: 'No',
      severity: 'secondary',
    },
    accept: () => {
      authStore.clearAccessToken();
      appStateStore.hideMenu();
      toast.add({ summary: 'You have successfully logout', severity: 'success', life: 5000 });
      router.push({ name: 'login' });
    },
  });
}
</script>
