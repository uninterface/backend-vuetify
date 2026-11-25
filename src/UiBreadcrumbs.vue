<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()
  import { useUiZPart } from '@uninterface/uninterface/backend'
  const vUiZPart = useUiZPart()

  import { VBtn } from 'vuetify/components/VBtn'
  import type { UiBreadcrumbsViewProps } from '@uninterface/uninterface/backend'
  defineProps<UiBreadcrumbsViewProps>()
  import {
    VBreadcrumbs,
    VBreadcrumbsItem,
    VBreadcrumbsDivider,
  } from 'vuetify/components/VBreadcrumbs'
</script>
<template>
  <nav :aria-label="label">
    <VBreadcrumbs tag="ol">
      <template
        v-for="(item, index) in items"
        :key="item.key"
      >
        <VBreadcrumbsDivider
          v-if="index"
          aria-hidden="true"
        />
        <VBreadcrumbsItem
          v-ui-z-part="item.z"
          :active="item.current"
          :disabled="item.current || item.disabled"
        >
          <component
            :is="
              item.href === undefined
                ? item.actionable
                  ? 'button'
                  : 'span'
                : 'a'
            "
            v-bind="item.attributes"
            :href="item.href"
            :type="
              item.actionable && item.href === undefined ? 'button' : undefined
            "
            :class="{ 'v-breadcrumbs-item--link': item.href !== undefined }"
            :aria-disabled="item.disabled || undefined"
          >
            <slot :item="item" />
          </component>
        </VBreadcrumbsItem>
      </template>
    </VBreadcrumbs>
    <div
      v-if="status?.message"
      role="status"
      :aria-busy="status.pending || undefined"
    >
      {{ status.message }}
      <VBtn
        variant="text"
        v-if="status.failed"
        @click="retry?.()"
      >
        {{ status.retryLabel }}
      </VBtn>
    </div>
  </nav>
</template>
