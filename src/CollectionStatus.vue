<script setup lang="ts">
  import Empty from './UiEmpty.vue'
  import Indicator from './UiLoadingIndicator.vue'
  import type { UiCollectionViewProps } from '@uninterface/uninterface/backend'
  defineProps<
    UiCollectionViewProps & {
      emptyInBody?: boolean
      suppressAnnouncement?: boolean
    }
  >()
</script>
<template>
  <div
    class="vuetify-collection-status"
    :data-infinity-feedback="
      (infinite && (appending || infinityComplete)) || undefined
    "
  >
    <template v-if="empty">
      <div v-if="!emptyInBody">
        <slot name="empty"><Empty :label="message" /></slot>
      </div>
    </template>
    <Indicator
      v-else-if="appending"
      :label="message"
      :style="infinite ? { fontSize: 'inherit' } : undefined"
    >
      <slot
        v-if="infinite"
        name="infinity-loading"
        :message="message"
        :loaded-count="rows.length"
      >
        {{ message }}
      </slot>
      <template v-else>{{ message }}</template>
    </Indicator>
    <p
      v-else-if="
        !failed && !loading && !appending && (!summary || showSummary === true)
      "
    >
      <slot
        v-if="infinityComplete"
        name="infinity-complete"
        :message="message"
        :loaded-count="rows.length"
      >
        {{ message }}
      </slot>
      <template v-else>{{ message }}</template>
    </p>
    <span
      v-if="!suppressAnnouncement"
      class="vuetify-collection-announcement"
      data-ui-loading-status
      role="status"
      aria-atomic="true"
    >
      {{ announcement }}
    </span>
  </div>
</template>
