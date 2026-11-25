<script setup lang="ts">
  import FooterActions from './FooterActions.vue'
  import { computed, ref } from 'vue'
  import { VSnackbar } from 'vuetify/components/VSnackbar'
  import { VLocaleProvider } from 'vuetify/components/VLocaleProvider'
  import { useNativeDirection } from './nativeDirection'
  import { VCard, VCardText, VCardActions } from 'vuetify/components/VCard'
  import { VFadeTransition } from 'vuetify/components/transitions'
  import { VBtn } from 'vuetify/components/VBtn'
  import {
    useUiFeedbackView,
    type UiFeedbackItemViewProps,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<UiFeedbackItemViewProps>()
  const root = ref<HTMLElement>()
  // Read outside the Snackbar, whose native overlay sets its own direction.
  const direction = useNativeDirection(() => root.value)
  const { events, summary, role } = useUiFeedbackView(props, root)
  const nativeColor = computed(() =>
    props.color === 'danger' ? 'error' : props.color,
  )
</script>
<template>
  <div
    ref="root"
    v-bind="events"
    :id="id"
    data-ui-feedback-item
    :data-closing="!open || undefined"
    class="vuetify-feedback-item"
  >
    <VLocaleProvider
      v-if="surface === 'toast'"
      :rtl="direction === 'rtl'"
    >
      <VSnackbar
        :model-value="open"
        :timeout="-1"
        :attach="true"
        contained
        :z-index="0"
        :_disable-global-stack="true"
        :color="nativeColor"
        class="vuetify-feedback-snackbar"
        :content-props="{
          class: 'vuetify-feedback-surface',
          style: { position: 'relative', minWidth: '0', width: '100%' },
        }"
        @update:model-value="
          (value) => {
            if (!value && open) onDismissRequest()
          }
        "
        @after-leave="onExited"
      >
        <!-- Header avoids the native content live region: summary is announced separately. -->
        <template #header>
          <div
            class="v-snackbar__content vuetify-feedback-content"
            tabindex="0"
            role="region"
            :aria-label="title || viewportLabel"
          >
            <strong v-if="title">{{ title }}</strong>
            <slot>
              <div v-if="message">{{ message }}</div>
              <ul v-if="details?.length">
                <li
                  v-for="(detail, index) in details"
                  :key="index"
                >
                  {{ detail }}
                </li>
              </ul>
            </slot>
          </div>
        </template>
        <template
          v-if="$slots.actions || dismissible"
          #actions
        >
          <FooterActions v-if="$slots.actions">
            <slot name="actions" />
          </FooterActions>
          <VBtn
            v-if="dismissible"
            icon="$close"
            variant="text"
            :aria-label="closeLabel"
            @click="onDismissRequest"
          />
        </template>
      </VSnackbar>
    </VLocaleProvider>
    <VFadeTransition
      v-else
      appear
      @after-leave="onExited"
    >
      <VCard
        v-show="open"
        class="vuetify-feedback-surface"
        :title="title"
        :color="nativeColor"
        variant="elevated"
      >
        <template
          v-if="dismissible"
          #append
        >
          <VBtn
            icon="$close"
            variant="text"
            :aria-label="closeLabel"
            @click="onDismissRequest"
          />
        </template>
        <VCardText
          class="vuetify-feedback-content"
          tabindex="0"
          role="region"
          :aria-label="title || viewportLabel"
        >
          <slot>
            <div v-if="message">{{ message }}</div>
            <ul v-if="details?.length">
              <li
                v-for="(detail, index) in details"
                :key="index"
              >
                {{ detail }}
              </li>
            </ul>
          </slot>
        </VCardText>
        <VCardActions v-if="$slots.actions">
          <FooterActions>
            <slot name="actions" />
          </FooterActions>
        </VCardActions>
      </VCard>
    </VFadeTransition>
    <span
      class="vuetify-feedback-announcement"
      :role="role"
      :aria-live="announcement"
      aria-atomic="true"
    >
      {{ summary }}
    </span>
  </div>
</template>
