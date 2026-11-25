<script setup lang="ts">
  import FilterButton from './TableFilterButton.vue'
  import AddRow from './TableAddRow.vue'
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  defineOptions({ inheritAttrs: false })
  import { useUiLoadingSurface } from '@uninterface/uninterface/backend'
  import Empty from './UiEmpty.vue'
  import LoadingRegion from './UiLoadingRegion.vue'
  import { computed, onMounted, onUpdated, watchPostEffect, ref } from 'vue'
  import { VDataTableServer } from 'vuetify/components/VDataTable'
  import { VIcon } from 'vuetify/components/VIcon'
  import { VCheckboxBtn } from 'vuetify/components/VCheckbox'

  import {
    useUiCollectionView,
    useUiTableSizing,
    useUiTableAddRow,
    type UiTableViewProps,
  } from '@uninterface/uninterface/backend'
  import Status from './CollectionStatus.vue'
  const props = defineProps<UiTableViewProps>()
  const { root, target, sentinel, rowRef, id, failure } =
    useUiCollectionView(props)
  const sizing = useUiTableSizing(props, root, id, { minimumHeader: true })
  const addGeometry = useUiTableAddRow({
    enabled: () => Boolean(props.addRow),
    bounded: () => props.height === 'full',
    host: () => root.value,
    summary: () =>
      target.value?.querySelector<HTMLElement>('[data-collection-summary]'),
    header: () => target.value?.querySelector<HTMLElement>('thead'),
    row: () =>
      target.value?.querySelector<HTMLElement>(
        'tbody tr:not([data-collection-add-track])',
      ),
  })
  const addTracks = computed(() => [
    ...(props.selection === 'none' ? [] : [sizing.selectionWidth.value]),
    ...props.columns.map((column) => sizing.width(column.key)),
  ])
  const addKeys = computed(() => [
    ...(props.selection === 'none' ? [] : ['selection']),
    ...props.columns.map((column) => column.key),
  ])
  const native = ref<{ $el: HTMLElement }>()
  const nativeKey = (key: string) => `column:${key}`
  const sortBy = computed(() =>
    props.columns
      .filter((column) => column.sort)
      .sort((a, b) => (a.sortPriority ?? 0) - (b.sortPriority ?? 0))
      .map((column) => ({
        key: nativeKey(column.key),
        order:
          column.sort === 'ascending' ? ('asc' as const) : ('desc' as const),
      })),
  )
  const headers = computed(() => [
    ...(props.selection === 'none'
      ? []
      : [
          {
            key: 'selection',
            title: props.selectPageLabel,
            sortable: false,
            width: sizing.selectionWidth.value,
          },
        ]),
    ...props.columns.map((column, index) => ({
      key: nativeKey(column.key),
      title: column.label,
      sortable: column.sortable && !props.disabled,
      width: sizing.width(column.key),
      align:
        column.align === 'right'
          ? ('end' as const)
          : column.align === 'center'
            ? ('center' as const)
            : ('start' as const),
      headerProps: {
        id: sizing.columnId(column.key),
        style: sizing.cellStyle(column.key),
        'aria-sort': column.primary ? column.sort : undefined,
        'aria-describedby': column.sortDescription
          ? `${id}-sort-${index}`
          : undefined,
        'aria-disabled': props.disabled && column.sortable ? 'true' : undefined,
      },
    })),
  ])
  function sortChanged(
    next: readonly { key: string; order?: boolean | 'asc' | 'desc' }[],
  ) {
    if (props.disabled) return
    // Native multi-sort changes one clause per header activation. Submit only
    // that intent so clauses absent from this table remain in the shared query.
    for (const column of props.columns) {
      const clause = next.find((value) => value.key === nativeKey(column.key))
      const order = clause
        ? clause.order === 'desc'
          ? 'descending'
          : 'ascending'
        : undefined
      if (order !== column.sort) {
        void column.requestSort(order ?? null)
        return
      }
    }
  }
  function sync() {
    target.value = native.value?.$el.querySelector('table') ?? undefined
    target.value?.setAttribute('tabindex', '-1')
    target.value?.setAttribute('aria-busy', String(props.busy))
    target.value?.setAttribute('aria-label', props.label)
    if (target.value) Object.assign(target.value.style, sizing.tableStyle.value)
  }
  watchPostEffect(sync)
  onMounted(sync)
  onUpdated(sync)
  const loadingSurface = {
    ...useUiLoadingSurface(() => root.value),
    // Keep header filter anchors available while a live query refreshes rows.
    interactionTarget: computed(
      () => target.value?.querySelector<HTMLElement>('tbody') ?? root.value,
    ),
  }
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
      :data-column-fit="sizing.fits.value"
      :data-add-row-compact="addGeometry.compact.value || undefined"
      :role="scroll !== 'none' ? 'region' : undefined"
      :aria-label="scroll !== 'none' ? label : undefined"
      :tabindex="scroll !== 'none' ? 0 : undefined"
    >
      <VDataTableServer
        v-show="sizing.fits.value"
        ref="native"
        class="vuetify-table"
        :headers="headers"
        :items="[]"
        :items-length="rows.length"
        :sort-by="sortBy"
        :mobile="false"
        multi-sort
        hide-default-footer
        @update:sort-by="sortChanged"
        :fixed-header="height === 'full' && !addGeometry.compact.value"
        :fixed-footer="height === 'full' && Boolean(dataSummary)"
        :aria-label="label"
      >
        <template #colgroup>
          <colgroup>
            <col
              v-if="selection !== 'none'"
              :style="{ width: `${sizing.selectionWidth.value}px` }"
            />
            <col
              v-for="column in columns"
              :key="column.key"
              :style="{ width: `${sizing.width(column.key)}px` }"
            />
          </colgroup>
        </template>
        <template #header.selection>
          <VCheckboxBtn
            v-if="selection === 'multiple'"
            :aria-label="selectPageLabel"
            :model-value="pageSelected"
            :indeterminate="pageMixed"
            :disabled="!canSelectPage"
            @update:model-value="selectPage($event === true)"
          />
          <span v-else>{{ selectPageLabel }}</span>
        </template>
        <template
          v-for="(column, index) in columns"
          :key="column.key"
          #[`header.${nativeKey(column.key)}`]="{
            column: nativeColumn,
            getSortIcon,
          }"
        >
          <div
            :ref="sizing.contentRef(column.key)"
            :style="[
              sizing.contentStyle(column.key),
              { display: 'inline-flex', flexDirection: 'row' },
            ]"
            class="v-data-table-header__content"
          >
            <slot
              name="label"
              :column="column"
            />
            <VIcon
              v-if="column.sortable"
              class="v-data-table-header__sort-icon"
              :icon="getSortIcon(nativeColumn)"
              aria-hidden="true"
            />
            <span
              v-if="showSortPriority && column.sort"
              class="v-data-table-header__sort-badge"
              data-ui-sort-priority
              aria-hidden="true"
            >
              {{ column.sortPriority }}
            </span>
            <span
              v-if="showSortPriority && column.sort"
              @click.stop
              @keydown.stop
            >
              <slot
                name="sort-actions"
                :column="column"
              />
            </span>
            <span
              v-if="column.sortDescription"
              :id="`${id}-sort-${index}`"
              class="vuetify-collection-announcement"
            >
              {{ column.sortDescription }}
            </span>
            <div
              v-if="column.filter"
              @click.stop
              @keydown="
                ($event as KeyboardEvent).key !== 'Escape' &&
                $event.stopPropagation()
              "
            >
              <slot
                name="filter"
                :trigger="FilterButton"
                :column="column"
              />
            </div>
          </div>
          <span
            v-if="sizing.handle(column.key)"
            v-bind="sizing.handle(column.key)"
            class="vuetify-column-resizer"
            @click.stop
            @keydown.stop
          />
        </template>
        <template
          v-if="dataSummary"
          #tfoot
        >
          <tfoot
            data-collection-summary
            :data-summary-status="dataSummary.status"
            :aria-label="dataSummary.label"
          >
            <tr>
              <td v-if="selection !== 'none'" />
              <td
                v-for="(column, index) in columns"
                v-show="
                  index === 0 || index >= (dataSummary.labelColumnSpan ?? 1)
                "
                :colspan="index === 0 ? dataSummary.labelColumnSpan : undefined"
                :key="column.key"
                :headers="
                  index === 0
                    ? columns
                        .slice(0, dataSummary.labelColumnSpan ?? 1)
                        .map((column) => sizing.columnId(column.key))
                        .join(' ')
                    : sizing.columnId(column.key)
                "
                :style="
                  index === 0 && (dataSummary.labelColumnSpan ?? 1) > 1
                    ? { textAlign: 'start' }
                    : sizing.cellStyle(column.key)
                "
              >
                <div
                  :ref="
                    index === 0 && (dataSummary.labelColumnSpan ?? 1) > 1
                      ? undefined
                      : sizing.summaryRef(column.key)
                  "
                  :style="
                    index === 0 && (dataSummary.labelColumnSpan ?? 1) > 1
                      ? { minWidth: '0' }
                      : sizing.contentStyle(column.key)
                  "
                >
                  <slot
                    name="summary-cell"
                    :column="column"
                  />
                </div>
              </td>
            </tr>
          </tfoot>
        </template>
        <template #body>
          <tr
            v-for="row in rows"
            :key="row.key"
            :ref="(element) => rowRef(row.key, element)"
          >
            <td v-if="selection !== 'none'">
              <VCheckboxBtn
                :aria-label="row.selectLabel"
                :model-value="row.context.selected"
                :disabled="!row.context.selectable"
                @update:model-value="
                  row.context.requestSelected($event === true)
                "
              />
            </td>
            <td
              v-for="column in columns"
              :key="column.key"
              :style="sizing.cellStyle(column.key)"
            >
              <div
                :ref="sizing.contentRef(column.key, row.key)"
                class="vuetify-table-cell-content"
                :style="sizing.contentStyle(column.key)"
              >
                <slot
                  name="cell"
                  :row="row"
                  :column="column"
                />
              </div>
              <p
                v-if="
                  row.issue && column.key === columns[columns.length - 1]?.key
                "
              >
                {{ row.issue }}
              </p>
            </td>
          </tr>
          <tr
            v-if="
              empty || (failed && failurePlacement === 'initial' && !loading)
            "
          >
            <td
              :colspan="
                Math.max(1, columns.length + (selection === 'none' ? 0 : 1))
              "
            >
              <template v-if="failed">
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
              </template>
              <slot
                v-else
                name="empty"
              >
                <Empty :label="message" />
              </slot>
            </td>
          </tr>
          <tr
            v-if="infinite"
            data-collection-continuation
          >
            <td
              :colspan="
                Math.max(1, columns.length + (selection === 'none' ? 0 : 1))
              "
            >
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
              <div
                ref="sentinel"
                aria-hidden="true"
                class="vuetify-collection-sentinel"
              />
              <Status
                v-bind="props"
                suppress-announcement
                empty-in-body
              >
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
              </Status>
            </td>
          </tr>
          <tr
            v-if="addRow"
            data-collection-add-track
            class="vuetify-table-add-track"
          >
            <td
              :colspan="
                Math.max(1, columns.length + (selection === 'none' ? 0 : 1))
              "
            >
              <AddRow
                :tracks="addTracks"
                :keys="addKeys"
                :viewport="addGeometry.viewportWidth.value"
              >
                <slot name="add-row-action" />
              </AddRow>
            </td>
          </tr>
        </template>
      </VDataTableServer>
      <p
        v-if="!sizing.fits.value"
        role="status"
      >
        {{ sizeConstraintLabel }}
      </p>
      <div
        v-if="!infinite && failed && failurePlacement === 'append' && !loading"
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
      <Status
        v-if="!infinite"
        v-bind="props"
        empty-in-body
      >
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
      </Status>
      <div
        v-else
        class="vuetify-collection-status"
      >
        <span
          class="vuetify-collection-announcement"
          data-ui-loading-status
          role="status"
          aria-atomic="true"
        >
          {{ announcement }}
        </span>
      </div>
    </div>
    <div
      v-if="$slots.footer"
      class="vuetify-table-footer"
    >
      <slot name="footer" />
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
