<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiFilePreviewView,
    type UiFilePreviewViewProps,
  } from '@uninterface/uninterface/backend'
  import { VImg } from 'vuetify/components/VImg'
  import UiImagePreview from './UiImagePreview.vue'
  import FileTypeIcon from './FileTypeIcon.vue'
  const props = withDefaults(defineProps<UiFilePreviewViewProps>(), {
    presentation: 'tile',
  })
  const { kind, sizeLabel, icon, thumbnailImage } = useUiFilePreviewView(props)
</script>
<template>
  <UiImagePreview
    v-if="image && !thumbnail"
    :url="url"
    :alt="alt"
  />
  <div
    v-else
    class="vuetify-file-preview"
    data-ui-file-preview
    :data-presentation="presentation"
  >
    <span
      class="vuetify-file-icon"
      data-file-icon
      :data-file-kind="kind"
      aria-hidden="true"
    >
      <VImg
        v-if="thumbnailImage"
        :key="thumbnailImage.url"
        :src="thumbnailImage.url"
        alt=""
        :cover="false"
        :rounded="false"
        :transition="false"
        eager
        data-file-thumbnail
        v-on="{ error: thumbnailImage.error }"
      >
        <template #placeholder><span /></template>
        <template #error><span /></template>
      </VImg>
      <component
        v-else-if="icon"
        :is="icon"
        aria-hidden="true"
        focusable="false"
      />
      <FileTypeIcon
        v-else
        :kind="kind"
      />
    </span>
    <div class="vuetify-file-details">
      <span
        class="vuetify-file-preview-name"
        data-file-name
        :title="name"
      >
        {{ name }}
      </span>
      <span
        v-if="sizeLabel !== undefined"
        class="vuetify-file-size"
        data-file-size
      >
        {{ sizeLabel }}
      </span>
    </div>
  </div>
</template>
