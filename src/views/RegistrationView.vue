<template>
  <main>
    <div class="flex justify-center items-center h-dvh px-2">
      <div class="p-6 w-100 rounded border border-stone-100/30">
        <h1 class="font-bold text-2xl text-center">Registration</h1>

        <Form
          v-slot="$form"
          :validate-on-value-update="false"
          :validate-on-blur="true"
          :initial-values
          :resolver
          @submit="sendRegisterRequest"
        >
          <div class="mt-4 flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <FloatLabel variant="on">
                <InputText name="name" type="name" class="w-full" />
                <label for="name">Name</label>
              </FloatLabel>

              <Message
                v-if="$form.name?.invalid || !!errorsFromApi.name"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form.name.error?.message }}
                {{ errorsFromApi.name }}
              </Message>
            </div>

            <div class="flex flex-col gap-1">
              <FloatLabel variant="on">
                <InputText name="password" type="password" class="w-full" />
                <label for="username">Password</label>
              </FloatLabel>

              <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple"
                >{{ $form.password.error?.message }}
              </Message>
            </div>
          </div>

          <div class="mt-6 flex gap-4 justify-between">
            <Button type="submit" label="Registration" class="button" :loading="isLoading" />

            <Button
              label="Login"
              class="p-0!"
              as="router-link"
              variant="link"
              :to="{ name: 'login' }"
            />
          </div>
        </Form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { Form } from '@primevue/forms';
import { Button, useToast, InputText, FloatLabel, Message } from 'primevue';
import { onMounted, reactive, ref } from 'vue';
import { apiRegister } from '@/api.js';
import { useAuthStore } from '@/stores/authStore.js';
import { useRouter } from 'vue-router';
import { validateName, validatePassword } from '@/helpers/validationHelper.js';

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const initialValues = reactive({
  name: '',
  password: '',
});

const errorsFromApi = reactive({
  name: '',
});

const resolver = ({ values }) => {
  const errors = {};

  const nameError = validateName(values.name);

  if (nameError) {
    errors.name = [{ message: nameError }];
  }

  const passwordError = validatePassword(values.password);

  if (passwordError) {
    errors.password = [{ message: passwordError }];
  }

  return {
    errors,
  };
};

const isLoading = ref(false);

async function sendRegisterRequest(form) {
  if (!form.valid) {
    return;
  }

  const data = {
    name: form.states.name.value,
    password: form.states.password.value,
  };

  isLoading.value = true;

  const response = await apiRegister(data);

  isLoading.value = false;

  processResponse(response);
}

function processResponse(response) {
  if (!response) {
    toast.add({ summary: 'An unknown error has occurred', severity: 'error', life: 5000 });
    return;
  }

  if (!response.success && response.messages) {
    if (response.messages.name) {
      errorsFromApi.name = response.messages.name[0];
      return;
    }
  }

  if (!response.access_token) {
    toast.add({ summary: 'An unknown error has occurred', severity: 'error', life: 5000 });
    return;
  }

  authStore.setAccessToken(response.access_token);

  toast.add({ summary: 'You have successfully created an account', severity: 'success', life: 5000 });

  router.push({ name: 'lobby' });
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push({ name: 'home' });
  }
});
</script>
