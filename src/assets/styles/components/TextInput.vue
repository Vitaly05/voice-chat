<template>
  <div class="flex flex-col">
    <span :class="{ 'text-red-500': isError }">{{ title }}</span>
    <input
      class="px-2 py-1 rounded bg-stone-800 outline-none border"
      :class="{
        'border-stone-50/30 hover:border-stone-50/60 focus:border-stone-50/100': !isError,
        'border-red-500/60 hover:border-red-400/60 focus:border-red-400/100': isError,
      }"
      :type="type"
      v-model="model"
    />
    <span class="text-red-500 text-xs" :class="{ hidden: !isError }" v-if="errorMessage">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  errorMessage: String,
  isError: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'text',
  },
});

const model = defineModel();
</script>
