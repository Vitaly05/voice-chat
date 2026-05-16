<template>
  <Drawer v-model:visible="appStateStore.isMenuVisible" header="Voice Chat">
    <Menu :model="menuItems">
      <template #item="{ item, props }">
        <a class="flex items-center" v-bind="props.action">
          <span :class="item.icon" />

          <span>{{ item.label }}</span>

          <Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
        </a>
      </template>
    </Menu>
  </Drawer>
</template>

<script setup>
import { Badge } from 'primevue';
import { Drawer, Menu, useConfirm, useToast } from 'primevue';
import { useAppStateStore } from '@/stores/appStateStore.js';
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore.js';
import { useRouter } from 'vue-router';
import { modals } from '@/composables/modal.js';

const appStateStore = useAppStateStore();
const authStore = useAuthStore();

const confirm = useConfirm();
const toast = useToast();
const router = useRouter();

const friendshipRequestsCount = computed(() => appStateStore.notificationsCount)

const menuItems = ref([
  {
    label: 'Add friend',
    icon: 'pi pi-user-plus',
    command: openAddFriendModal,
  },
  {
    label: 'Friendship requests',
    icon: 'pi pi-users',
    badge: friendshipRequestsCount,
    command: openFriendshipRequestsModal,
  },
  {
    separator: true,
  },
  {
    label: 'Logout',
    icon: 'pi pi-sign-out',
    command: logout,
  },
]);

function openAddFriendModal() {
  appStateStore.showModal(modals.addFriend);
}

function openFriendshipRequestsModal() {
  appStateStore.showModal(modals.friendshipRequests);
}

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
