<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import type { UiFileCollectionViewProps } from '@uninterface/uninterface/backend'
  import { VBtn } from 'vuetify/components/VBtn'
  defineProps<UiFileCollectionViewProps>()
</script>
<template>
  <ul class="vuetify-file-collection">
    <li
      v-for="file in files"
      :key="file.key"
    >
      <slot :file="file" />
      <VBtn
        v-if="removable"
        type="button"
        :disabled="disabled"
        :aria-label="`${removeLabel}: ${file.name}`"
        @click="remove(file.key)"
      >
        {{ removeLabel }}
      </VBtn>
    </li>
  </ul>
</template>
