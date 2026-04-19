<template>
  <main>
    <div class="flex justify-center items-center h-dvh">
      <div class="p-6 w-100 rounded border border-stone-100/30">
        <h1 class="font-bold text-2xl text-center">Login</h1>

        <div class="mt-4 flex flex-col gap-1">
          <TextInput
            title="Name"
            :error-message="errorMessages.name"
            :is-error="isError.name"
            v-model="name"
          />
          <TextInput
            title="Password"
            type="password"
            :error-message="errorMessages.password"
            :is-error="isError.password"
            v-model="password"
          />
        </div>

        <div class="mt-4" :class="{ hidden: !formError }">
          <span class="text-red-500 text-sm">{{ formError }}</span>
        </div>

        <div class="mt-6 flex gap-4 justify-between">
          <button
            class="button"
            :disabled="isLoading"
            :class="{ loading: isLoading }"
            @click="sendLoginRequest"
          >
            Login
          </button>
          <button
            class="button"
            :disabled="isLoading"
            :class="{ loading: isLoading }"
            @click="sendRegistrationRequest"
          >
            Registration
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import TextInput from '@/assets/styles/components/TextInput.vue';
import { ref } from 'vue';
import { apiLoginByName, apiRegister } from '@/api.js';
import { useAuthStore } from '@/stores/authStore.js';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const name = ref('');
const password = ref('');

const formError = ref('');
const isError = ref({
  name: false,
  password: false,
});
const errorMessages = ref({
  name: '',
  password: '',
});

const isLoading = ref(false);

function isFormValid() {
  clearErrors();

  let isValid = true;

  const nameValue = name.value.trim();

  if (nameValue.length < 4 || nameValue.length > 15) {
    isValid = false;

    errorMessages.value.name = 'Name field must be greater than 4 and less than 15.';
    isError.value.name = true;
  }

  const passwordValue = password.value.trim();

  if (passwordValue.length < 6 || passwordValue.length > 30) {
    isValid = false;

    errorMessages.value.password = 'Password field must be greater than 6 and less than 30.';
    isError.value.password = true;
  }

  return isValid;
}

function clearErrors() {
  errorMessages.value.name = '';
  errorMessages.value.password = '';

  isError.value.name = false;
  isError.value.password = false;

  formError.value = '';
}

async function sendLoginRequest() {
  if (!isFormValid()) {
    return;
  }

  isLoading.value = true;

  const response = await apiLoginByName({
    name: name.value,
    password: password.value,
  });

  isLoading.value = false;

  processResponse(response);
}

async function sendRegistrationRequest() {
  if (!isFormValid()) {
    return;
  }

  isLoading.value = true;

  const response = await apiRegister({
    name: name.value,
    password: password.value,
  });

  isLoading.value = false;

  processResponse(response);
}

function processResponse(response) {
  if (!response) {
    formError.value = 'An unknown error has occurred';

    return;
  }

  if (!response.success) {
    if (response.messages) {
      for (let key in response.messages) {
        errorMessages.value[key] = response.messages[key].join('\n');
        isError.value[key] = true;
      }
    }

    if (response.message) {
      formError.value = response.message;
    }
  }

  if (!response.access_token) {
    return;
  }

  authStore.setAccessToken(response.access_token);

  router.push({ name: 'lobby' });
}
</script>
