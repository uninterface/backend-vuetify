<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  defineOptions({ inheritAttrs: false })
  import { useUiLoadingSurface } from '@uninterface/uninterface/backend'
  import LoadingRegion from './UiLoadingRegion.vue'
  import { VBtn } from 'vuetify/components/VBtn'
  import { VCheckboxBtn } from 'vuetify/components/VCheckbox'
  import { VNumberInput } from 'vuetify/components/VNumberInput'
  import { VSelect } from 'vuetify/components/VSelect'
  import { computed } from 'vue'
  import {
    useUiCollectionView,
    type UiListViewProps,
  } from '@uninterface/uninterface/backend'
  import Status from './CollectionStatus.vue'
  const props = defineProps<UiListViewProps>()
  const { root, target, sentinel, rowRef, failure } = useUiCollectionView(props)
  const grid = computed(() =>
    props.columns
      ? `repeat(${props.columns}, minmax(0, 1fr))`
      : props.columnWidth
        ? `repeat(auto-fit, minmax(min(100%, ${props.columnWidth}), 1fr))`
        : undefined,
  )
  const loadingSurface = useUiLoadingSurface(() => root.value)
</script>
<template>
  <div
    class="vuetify-collection-frame"
    :data-collection-full="height === 'full' || undefined"
  >
    <div
      v-if="failed && failurePlacement === 'replacement' && !loading"
      ref="failure"
      class="vuetify-collection-failure"
      data-collection-failure="replacement"
    >
      <slot
        name="error"
        :placement="failurePlacement!"
        :error="error"
        :retry="retry"
        :can-retry="canRetry"
      />
    </div>
    <div
      ref="root"
      v-bind="$attrs"
      class="vuetify-collection"
      :data-full="height === 'full' || undefined"
      :data-loading-empty="(loading && rows.length === 0) || undefined"
      :data-scroll="scroll"
      :role="scroll !== 'none' ? 'region' : undefined"
      :aria-label="scroll !== 'none' ? label : undefined"
      :tabindex="scroll !== 'none' ? 0 : undefined"
    >
      <div
        v-if="failed && failurePlacement === 'initial' && !loading"
        ref="failure"
        class="vuetify-collection-failure"
        data-collection-failure="initial"
      >
        <slot
          name="error"
          :placement="failurePlacement!"
          :error="error"
          :retry="retry"
          :can-retry="canRetry"
        />
      </div>
      <ul
        ref="target"
        class="vuetify-list"
        :style="{ gridTemplateColumns: grid }"
        :aria-label="label"
        :aria-busy="busy"
        tabindex="-1"
      >
        <li
          v-for="row in rows"
          :key="row.key"
          :ref="(element) => rowRef(row.key, element)"
          :data-selectable="selection !== 'none' || undefined"
        >
          <div
            v-if="selection !== 'none'"
            class="vuetify-list-selection"
          >
            <VCheckboxBtn
              :aria-label="row.selectLabel"
              :model-value="row.context.selected"
              :disabled="!row.context.selectable"
              @update:model-value="row.context.requestSelected($event === true)"
            />
          </div>
          <div class="vuetify-list-content">
            <slot :row="row" />
            <p v-if="row.issue">{{ row.issue }}</p>
          </div>
        </li>
      </ul>
      <div
        v-if="infinite"
        ref="sentinel"
        aria-hidden="true"
        class="vuetify-collection-sentinel"
      />
      <div
        v-if="failed && failurePlacement === 'append' && !loading"
        ref="failure"
        class="vuetify-collection-failure"
        data-collection-failure="append"
      >
        <slot
          name="error"
          :placement="failurePlacement!"
          :error="error"
          :retry="retry"
          :can-retry="canRetry"
        />
      </div>
      <Status v-bind="props">
        <template
          v-if="$slots['infinity-loading']"
          #infinity-loading="values"
        >
          <slot
            name="infinity-loading"
            v-bind="values"
          />
        </template>
        <template
          v-if="$slots['infinity-complete']"
          #infinity-complete="values"
        >
          <slot
            name="infinity-complete"
            v-bind="values"
          />
        </template>

        <template
          v-if="$slots.empty"
          #empty
        >
          <slot name="empty" />
        </template>
      </Status>
    </div>
  </div>
  <LoadingRegion
    :surface="loadingSurface"
    :loading="loading"
    :label="message"
    :announce="false"
    :manage-busy="false"
  />
</template>
