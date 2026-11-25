<script setup lang="ts">
  defineProps<{ kind: string }>()
</script>
<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5"
    />
    <path
      v-if="kind === 'document'"
      d="M8 12h8M8 15h8M8 18h5"
    />
    <path
      v-if="kind === 'pdf'"
      d="M8 17c4-2 5-6 4-7-2 0 0 7 5 7-1-2-7-1-9 0"
    />
    <path
      v-if="kind === 'spreadsheet'"
      d="M8 11h8v8H8zM8 15h8M12 11v8"
    />
    <path
      v-if="kind === 'presentation'"
      d="M7 12h10v6H7zM12 18v2M9 20h6"
    />
    <path
      v-if="kind === 'archive'"
      d="M11 10h2m-2 3h2m-2 3h2m-2 3h2"
    />
    <path
      v-if="kind === 'audio'"
      d="M10 17v-5l6-1v5M10 17c0 2-3 2-3 0s3-2 3 0m6-1c0 2-3 2-3 0s3-2 3 0"
    />
    <path
      v-if="kind === 'video'"
      d="m10 11 6 4-6 4z"
    />
    <path
      v-if="kind === 'code'"
      d="m10 12-3 3 3 3m4-6 3 3-3 3"
    />
  </svg>
</template>
