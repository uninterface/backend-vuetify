<script setup lang="ts">
  import EntryIcon from './EntryIcon.vue'
  import { useId, computed } from 'vue'
  import { VIcon } from 'vuetify/components/VIcon'
  import { VList } from 'vuetify/components/VList'
  import { VBtn } from 'vuetify/components/VBtn'
  import {
    VListItem,
    VListItemAction,
    VListSubheader,
  } from 'vuetify/components/VList'
  import { VDivider } from 'vuetify/components/VDivider'
  import EntryPopup from './EntryPopup.vue'
  import { useUiMenuIconColumn } from '@uninterface/uninterface/backend'
  import type {
    UiEntryViewNode,
    UiEntryStatusViewBinding,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<{
    entries: readonly UiEntryViewNode[]
    status?: UiEntryStatusViewBinding
    label: string
    navigation?: boolean
    presentation?: import('@uninterface/uninterface').UiNavMenuPresentation
    group?: boolean
    reserveChecks?: boolean
    parentKey?: string
  }>()
  defineEmits<{
    activate: [key: string]
    expand: [key: string, open: boolean]
    retry: [key?: string]
  }>()
  defineSlots<{
    entry(props: {
      entry: Exclude<UiEntryViewNode['entry'], { kind: 'separator' }>
    }): any
    icon(props: {
      entry: Exclude<UiEntryViewNode['entry'], { kind: 'separator' }>
      icon?: unknown
    }): any
  }>()
  const horizontal = computed(
    () =>
      props.navigation &&
      props.parentKey === undefined &&
      (!props.presentation || props.presentation === 'horizontal'),
  )
  const rail = computed(
    () => props.presentation === 'icon-popup' && props.parentKey === undefined,
  )
  const subtitleSlot: string = 'subtitle'
  const copySlot = computed(() => (horizontal.value ? 'default' : 'title'))
  // Groups share their popup's columns; submenu popups start a fresh scope.
  function hasChecks(entries: readonly UiEntryViewNode[]): boolean {
    return entries.some((node) =>
      node.entry.kind === 'group'
        ? hasChecks(node.children ?? [])
        : Boolean(node.selectionMode),
    )
  }
  const checkColumn = computed(
    () =>
      !props.navigation &&
      (props.group ? props.reserveChecks : hasChecks(props.entries)),
  )
  const iconColumn = useUiMenuIconColumn(() => props.entries, {
    group: () => Boolean(props.group),
    reserve: () =>
      Boolean(
        props.navigation &&
          (props.presentation === 'vertical-tree' ||
            (props.parentKey === undefined &&
              props.presentation !== 'horizontal')),
      ),
    enabled: () =>
      !(
        props.navigation &&
        props.parentKey === undefined &&
        (!props.presentation || props.presentation === 'horizontal')
      ),
  })
  const id = useId()
  const anchors = new Map<string, HTMLElement>()
</script>
<template>
  <component
    :is="group || horizontal ? 'ul' : VList"
    tag="ul"
    :nav="navigation && parentKey === undefined && !horizontal"
    :slim="navigation && parentKey === undefined && !horizontal"
    :density="
      navigation && parentKey === undefined && !horizontal
        ? 'comfortable'
        : undefined
    "
    @keydown="
      (event: KeyboardEvent) => {
        if (event.defaultPrevented) event.stopPropagation()
      }
    "
    class="vuetify-entry-list"
    :class="{ 'vuetify-navigation-rail': rail }"
    :role="navigation ? undefined : group ? 'group' : 'menu'"
    :aria-label="label"
    :aria-busy="status?.pending || undefined"
    :data-parent="parentKey"
    :tabindex="!navigation && !group ? -1 : undefined"
  >
    <li
      v-for="(node, index) in entries"
      :key="node.entry.key"
      :role="navigation ? undefined : 'none'"
    >
      <VDivider
        v-if="node.entry.kind === 'separator'"
        class="vuetify-entry-separator"
      />
      <template v-else-if="node.entry.kind === 'group'">
        <VListSubheader
          :id="`${id}-${index}`"
          class="vuetify-entry-group-label"
          :data-rail-heading="rail || undefined"
        >
          <EntryIcon
            v-if="node.entry.icon || iconColumn"
            start
            aria-hidden="true"
          >
            <slot
              v-if="node.entry.icon"
              name="icon"
              :entry="node.entry"
              :icon="node.entry.icon"
            />
          </EntryIcon>
          <slot
            name="entry"
            :entry="node.entry"
          >
            {{ node.entry.label }}
          </slot>
        </VListSubheader>
        <small v-if="node.entry.description">
          {{ node.entry.description }}
        </small>
        <EntryBranch
          :entries="node.children ?? []"
          :label="node.entry.label"
          :aria-labelledby="`${id}-${index}`"
          :navigation="navigation"
          :presentation="presentation"
          :parent-key="parentKey"
          :reserve-checks="checkColumn"
          group
          @activate="$emit('activate', $event)"
          @expand="(key, open) => $emit('expand', key, open)"
          @retry="$emit('retry', $event)"
        >
          <template #entry="scope">
            <slot
              name="entry"
              v-bind="scope"
            />
          </template>
          <template #icon="scope">
            <slot
              name="icon"
              v-bind="scope"
            />
          </template>
        </EntryBranch>
      </template>
      <template v-else>
        <component
          :ref="
            (element: any) => {
              if (element) anchors.set(node.entry.key, element.$el ?? element)
              else anchors.delete(node.entry.key)
            }
          "
          :is="horizontal ? VBtn : VListItem"
          :tag="
            navigation && node.entry.kind !== 'submenu' && node.entry.href
              ? 'a'
              : 'button'
          "
          :variant="navigation ? 'text' : undefined"
          :prepend-gap="!navigation && iconColumn ? 8 : undefined"
          :active="
            node.current || node.containsCurrent || node.selected || false
          "
          :disabled="node.entry.disabled"
          class="vuetify-entry-item"
          :class="{ 'vuetify-entry-item-rail': rail }"
          :type="
            navigation && node.entry.kind !== 'submenu' && node.entry.href
              ? undefined
              : 'button'
          "
          :role="
            navigation
              ? node.entry.kind !== 'submenu' &&
                node.entry.href &&
                node.entry.disabled
                ? 'link'
                : undefined
              : node.selectionMode === 'multiple'
                ? 'menuitemcheckbox'
                : node.selectionMode === 'single'
                  ? 'menuitemradio'
                  : 'menuitem'
          "
          :href="
            navigation && node.entry.kind !== 'submenu' && !node.entry.disabled
              ? node.entry.href
              : undefined
          "
          :tabindex="node.entry.disabled ? -1 : undefined"
          :data-entry-key="node.entry.key"
          :aria-disabled="node.entry.disabled || undefined"
          :aria-current="node.current ? 'page' : undefined"
          :aria-checked="
            node.selectionMode ? Boolean(node.selected) : undefined
          "
          :aria-haspopup="
            !navigation && node.entry.kind === 'submenu' ? 'menu' : undefined
          "
          :aria-expanded="
            node.entry.kind === 'submenu' ? Boolean(node.expanded) : undefined
          "
          :aria-controls="
            node.entry.kind === 'submenu' && node.expanded
              ? `${id}-sub-${index}`
              : undefined
          "
          :aria-label="node.entry.label"
          :aria-describedby="
            node.entry.description ? `${id}-description-${index}` : undefined
          "
          @click="
            (event: MouseEvent) => {
              if ('disabled' in node.entry && node.entry.disabled) {
                event.preventDefault()
                return
              }
              if (
                navigation &&
                'href' in node.entry &&
                node.entry.href &&
                (event.ctrlKey ||
                  event.metaKey ||
                  event.shiftKey ||
                  event.altKey ||
                  event.button !== 0)
              )
                return
              if (node.entry.kind === 'submenu')
                $emit('expand', node.entry.key, !node.expanded)
              else if (node.request) node.request(event)
              else $emit('activate', node.entry.key)
            }
          "
        >
          <template
            v-if="checkColumn || node.entry.icon || iconColumn"
            #prepend
          >
            <VIcon
              v-if="checkColumn"
              aria-hidden="true"
              class="vuetify-entry-check"
              :icon="
                node.selectionMode && node.selected
                  ? node.selectionMode === 'single'
                    ? '$radioOn'
                    : '$checkboxOn'
                  : undefined
              "
            />
            <EntryIcon
              v-if="node.entry.icon || iconColumn"
              aria-hidden="true"
              class="vuetify-entry-icon"
              :class="{ 'ms-2': checkColumn }"
            >
              <slot
                v-if="node.entry.icon"
                name="icon"
                :entry="node.entry"
                :icon="node.entry.icon"
              />
            </EntryIcon>
          </template>
          <template #[copySlot]>
            <span
              class="vuetify-entry-copy"
              :class="{ 'vuetify-navigation-rail-label': rail }"
            >
              <slot
                name="entry"
                :entry="node.entry"
              >
                {{ node.entry.label }}
              </slot>
            </span>
          </template>
          <template
            v-if="node.entry.description"
            #[subtitleSlot]
          >
            <span
              :id="`${id}-description-${index}`"
              :class="{ 'vuetify-navigation-rail-label': rail }"
            >
              {{ node.entry.description }}
            </span>
          </template>
          <template
            v-if="
              !rail && (node.entry.kind === 'submenu' || node.entry.shortcut)
            "
            #append
          >
            <VListItemAction
              v-if="node.entry.kind !== 'submenu' && node.entry.shortcut"
            >
              <kbd>{{ node.entry.shortcut }}</kbd>
            </VListItemAction>
            <span
              v-if="navigation && node.entry.kind === 'submenu' && !rail"
              aria-hidden="true"
            >
              <VIcon :icon="horizontal ? '$dropdown' : '$next'" />
            </span>
            <VIcon
              v-else-if="node.entry.kind === 'submenu' && !rail"
              aria-hidden="true"
              icon="$next"
            />
          </template>
        </component>
        <EntryPopup
          v-if="node.entry.kind === 'submenu' && node.expanded"
          :anchor="anchors.get(node.entry.key)"
          :side="!horizontal"
          :navigation="navigation"
          :presentation="presentation"
          @close="$emit('expand', node.entry.key, false)"
        >
          <EntryBranch
            :id="`${id}-sub-${index}`"
            :entries="node.children ?? []"
            :status="node.status"
            :label="node.entry.label"
            :navigation="navigation"
            :presentation="presentation"
            :parent-key="node.entry.key"
            @activate="$emit('activate', $event)"
            @expand="(key, open) => $emit('expand', key, open)"
            @retry="$emit('retry', $event)"
          >
            <template #entry="scope">
              <slot
                name="entry"
                v-bind="scope"
              />
            </template>
            <template #icon="scope">
              <slot
                name="icon"
                v-bind="scope"
              />
            </template>
          </EntryBranch>
        </EntryPopup>
      </template>
    </li>
    <li
      v-if="status?.message"
      :role="navigation ? undefined : 'none'"
      class="vuetify-entry-status"
    >
      <span role="status">{{ status.message }}</span>
      <VBtn
        v-if="status.failed"
        type="button"
        color="primary"
        variant="text"
        :role="navigation ? undefined : 'menuitem'"
        :tabindex="undefined"
        @click="$emit('retry', parentKey)"
      >
        {{ status.retryLabel }}
      </VBtn>
    </li>
  </component>
</template>

<style scoped>
  .vuetify-navigation-rail-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>

<style scoped>
  .vuetify-navigation-rail {
    inline-size: max-content;
  }
</style>
