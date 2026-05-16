<template>
  <Dialog
    v-model:visible="isVisible"
    header="Add Friend"
    modal
    :style="{ width: '90%' }"
    @hide="onClose"
  >
    <Form
      v-slot="$form"
      :validate-on-value-update="false"
      :validate-on-blur="true"
      :initial-values
      :resolver
      @submit="addFriend"
    >
      <div class="mt-4 flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <FloatLabel variant="on">
            <InputText name="name" type="name" class="w-full" />
            <label for="name">Name</label>
          </FloatLabel>

          <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple"
            >{{ $form.name.error?.message }}
          </Message>
        </div>
      </div>

      <div class="mt-6 flex gap-4 justify-between">
        <Button type="submit" label="Add" class="button" :loading="isLoading" />
      </div>
    </Form>
  </Dialog>
</template>

<script setup>
import { Button, Dialog, FloatLabel, InputText, Message, useToast } from 'primevue';
import { modals, useModal } from '@/composables/modal.js';
import { reactive, ref } from 'vue';
import { validateName } from '@/helpers/validationHelper.js';
import { Form } from '@primevue/forms';
import { apiAddFriend } from '@/api.js';
import { useAppStateStore } from '@/stores/appStateStore.js';

const toast = useToast();

const appStateStore = useAppStateStore();

const { isVisible, onClose } = useModal(modals.addFriend);

const initialValues = reactive({
  name: '',
});

const resolver = ({ values }) => {
  const errors = {};

  const nameError = validateName(values.name);

  if (nameError) {
    errors.name = [{ message: nameError }];
  }

  return {
    errors,
  };
};

const isLoading = ref(false);

async function addFriend(form) {
  if (!form.valid) {
    return;
  }

  isLoading.value = true;

  const response = await apiAddFriend(form.states.name.value);

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
  } else {
    if (response.status === 'friend_added') {
      const userData = {
        id: response.user.id,
        name: response.user.name,
      };

      appStateStore.notificationsCount--;
      appStateStore.events.friendshipRequestAccepted?.(userData);
      appStateStore.events.autoAddedFriend?.(userData);

      toast.add({ summary: 'A friend has been added', severity: 'success', life: 5000 });
      return;
    }
  }

  toast.add({ summary: 'A friend request has been sent', severity: 'success', life: 5000 });
}
</script>
