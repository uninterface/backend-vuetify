<script setup lang="ts">
  import type { UiCollectionCardsViewProps } from '@uninterface/uninterface/backend'
  import Card from './UiCard.vue'
  defineProps<{
    summary: NonNullable<UiCollectionCardsViewProps['dataSummary']>
  }>()
</script>
<template>
  <section
    class="vuetify-collection-data-summary"
    data-collection-summary
    :data-summary-status="summary.status"
    :aria-label="summary.label"
  >
    <Card
      :level="0"
      :color="summary.cardTreatment.color"
      :treatment="summary.cardTreatment"
      :loading="false"
      loading-label=""
    >
      <template #title>
        <div data-collection-summary-label>{{ summary.label }}</div>
      </template>
      <dl class="vuetify-collection-summary-content">
        <div
          v-for="column in summary.columns"
          :key="column.key"
        >
          <dt>{{ column.label }}</dt>
          <dd><slot :column="column" /></dd>
        </div>
      </dl>
    </Card>
  </section>
</template>
