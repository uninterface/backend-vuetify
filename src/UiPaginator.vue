<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()
  import {
    useUiCollectionFooterNavigation,
    useUiCollectionFooterCompact,
  } from '@uninterface/uninterface/backend'
  const footerCompact = useUiCollectionFooterCompact()

  import { computed } from 'vue'
  import { useUiResponsive } from '@uninterface/uninterface'
  import { VPagination } from 'vuetify/components/VPagination'
  import { VIcon } from 'vuetify/components/VIcon'
  import { VBtn } from 'vuetify/components/VBtn'
  import type { UiPaginatorViewProps } from '@uninterface/uninterface/backend'
  const props = defineProps<UiPaginatorViewProps>()
  const footerWidth = useUiCollectionFooterNavigation(
    () => (4 + Math.min(props.pageCount ?? 1, 7)) * 3.625,
    () => 18.125 + Math.max(0, String(props.page ?? 1).length - 2) * 0.65,
  )
  // Native auto sizing initially uses viewport width, which can expand a
  // content-sized footer to a full row before siblings receive their space.
  const { context } = useUiResponsive()
  const compact = computed(
    () => footerCompact?.value ?? context.value === 'mobile',
  )
  const numbered = computed(
    () =>
      props.page !== undefined &&
      props.pageCount !== undefined &&
      props.pageCount > 0 &&
      props.page <= props.pageCount &&
      props.canJump,
  )
</script>
<template>
  <nav
    class="vuetify-paginator"
    :data-compact="compact ? '' : undefined"
    :aria-label="label"
    :aria-busy="pending"
  >
    <VPagination
      v-if="numbered"
      show-first-last-page
      tag="div"
      role="group"
      :aria-label="label"
      :model-value="page"
      :length="pageCount"
      :total-visible="
        compact
          ? Math.max(
              1,
              Math.min(5, Math.floor(((footerWidth ?? 290) - 232) / 58) - 2),
            )
          : 5
      "
      :disabled="pending"
      @update:model-value="goTo"
    />
    <template v-else>
      <VBtn
        size="large"
        :icon="compact"
        type="button"
        :disabled="!canFirst"
        :aria-label="firstLabel"
        @click="first"
      >
        <VIcon
          v-if="compact"
          class="vuetify-paginator-direction"
          aria-hidden="true"
          icon="$first"
        />
        <template v-else>{{ firstLabel }}</template>
      </VBtn>
      <VBtn
        size="large"
        :icon="compact"
        type="button"
        :disabled="!canPrevious"
        :aria-label="previousLabel"
        @click="previous"
      >
        <VIcon
          v-if="compact"
          class="vuetify-paginator-direction"
          aria-hidden="true"
          icon="$prev"
        />
        <template v-else>{{ previousLabel }}</template>
      </VBtn>
      <span
        v-if="pageLabel"
        :aria-label="pageLabel"
      >
        {{ compact ? page : pageLabel }}
      </span>
      <VBtn
        size="large"
        :icon="compact"
        type="button"
        :disabled="!canNext"
        :aria-label="nextLabel"
        @click="next"
      >
        <VIcon
          v-if="compact"
          class="vuetify-paginator-direction"
          aria-hidden="true"
          icon="$next"
        />
        <template v-else>{{ nextLabel }}</template>
      </VBtn>
      <VBtn
        size="large"
        :icon="compact"
        type="button"
        :disabled="!canLast"
        :aria-label="lastLabel"
        @click="last"
      >
        <VIcon
          v-if="compact"
          class="vuetify-paginator-direction"
          aria-hidden="true"
          icon="$last"
        />
        <template v-else>{{ lastLabel }}</template>
      </VBtn>
    </template>
  </nav>
</template>
