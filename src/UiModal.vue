<script setup lang="ts">
  import FooterActions from './FooterActions.vue'
  import { useId } from 'vue'
  import { uiFocusPresentation } from './focus'
  import {
    useUiModalView,
    createUiModalCssMotion,
    type UiModalViewProps,
  } from '@uninterface/uninterface/backend'
  import {
    VCard,
    VCardText,
    VCardItem,
    VCardActions,
  } from 'vuetify/components/VCard'
  import { VBtn } from 'vuetify/components/VBtn'
  const props = defineProps<UiModalViewProps>()
  const emit = defineEmits<{
    cancel: [reason: UiModalViewProps['closeOn'][number]]
  }>()
  const {
    widthStyle,
    vModalPart,
    ModalPart,
    dialog,
    body,
    title: heading,
    open,
    close,
    cancel,
    pointerdown,
    click,
  } = useUiModalView(
    () => props,
    emit,
    createUiModalCssMotion('dialog-transition'),
  )
  const id = useId()
  defineExpose({ open, close })
</script>
<template>
  <dialog
    ref="dialog"
    :style="widthStyle"
    class="vuetify-modal"
    :aria-labelledby="`${id}-title`"
    @cancel="cancel"
    @pointerdown="pointerdown"
    @click="click"
  >
    <VCard
      class="vuetify-modal-surface"
      :elevation="5"
    >
      <VCardItem
        v-modal-part="'header'"
        class="vuetify-modal-header"
      >
        <template #title>
          <h2
            :id="`${id}-title`"
            ref="heading"
            v-bind="uiFocusPresentation"
            tabindex="-1"
            class="vuetify-modal-title"
          >
            {{ title }}
          </h2>
        </template>
        <template
          v-if="closeOn.includes('close-button')"
          #append
        >
          <VBtn
            v-if="closeOn.includes('close-button')"
            icon="$close"
            variant="text"
            :disabled="pendingClose"
            :aria-label="closeLabel"
            @click="emit('cancel', 'close-button')"
          />
        </template>
        <ModalPart part="header">
          <slot name="header-extra" />
        </ModalPart>
      </VCardItem>
      <VCardText
        class="vuetify-modal-scroll"
        :data-content-scroll="bodyScroll === 'content' || undefined"
        v-bind="uiFocusPresentation"
        role="region"
        :aria-labelledby="`${id}-title`"
        tabindex="0"
      >
        <div
          ref="body"
          class="vuetify-modal-body"
          :data-content-scroll="bodyScroll === 'content' || undefined"
        >
          <slot />
        </div>
      </VCardText>
      <VCardActions
        v-modal-part="'footer'"
        v-if="$slots.footer || $slots.actions"
        class="vuetify-modal-footer"
      >
        <ModalPart part="footer">
          <FooterActions v-if="$slots.actions">
            <slot name="actions" />
          </FooterActions>
          <slot
            v-else
            name="footer"
          />
        </ModalPart>
      </VCardActions>
    </VCard>
  </dialog>
</template>
