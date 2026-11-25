<script setup lang="ts">
  defineProps<{
    name?: string
    query?: boolean
    contents?: boolean
    stacked?: boolean
    lineBreak?: boolean
    row?: boolean
    grow?: boolean
    separate?: boolean
    element?: (value: HTMLElement | undefined) => void
  }>()
</script>
<template>
  <component
    :is="query ? 'section' : 'div'"
    :ref="(value: any) => element?.(value ?? undefined)"
    :data-header-part="name"
    :data-ui-collection-query-panel="query ? '' : undefined"
    class="vuetify-collection-header-part"
    :data-contents="contents ? '' : undefined"
    :data-stacked="stacked ? '' : undefined"
    :data-new-row="row ? '' : undefined"
    :data-line-break="lineBreak ? '' : undefined"
    :data-grow="grow ? '' : undefined"
    :data-separate="separate ? '' : undefined"
  >
    <slot />
  </component>
</template>
