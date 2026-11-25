<script setup lang="ts">
  // Recursive fragments retain VListGroup's indentation and nested-item scope.
  defineOptions({ inheritAttrs: false })
  import EntryIcon from './EntryIcon.vue'
  import {
    VListGroup,
    VListItem,
    VListSubheader,
  } from 'vuetify/components/VList'
  import { VDivider } from 'vuetify/components/VDivider'
  import { VBtn } from 'vuetify/components/VBtn'
  import { useUiMenuIconColumn } from '@uninterface/uninterface/backend'
  import type {
    UiEntryViewNode,
    UiEntryStatusViewBinding,
  } from '@uninterface/uninterface/backend'
  const props = defineProps<{
    entries: readonly UiEntryViewNode[]
    status?: UiEntryStatusViewBinding
    label: string
    parentKey?: string
    group?: boolean
  }>()
  const emit = defineEmits<{
    activate: [key: string]
    expand: [key: string, open: boolean]
    retry: [key?: string]
  }>()
  const iconColumn = useUiMenuIconColumn(() => props.entries, {
    group: () => Boolean(props.group),
    reserve: () => true,
  })
  function activate(node: UiEntryViewNode, event: MouseEvent) {
    if ('disabled' in node.entry && node.entry.disabled) {
      event.preventDefault()
      return
    }
    if (
      event.button ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    if (node.request) node.request(event)
    else emit('activate', node.entry.key)
  }
  defineSlots<{
    entry(props: {
      entry: Exclude<UiEntryViewNode['entry'], { kind: 'separator' }>
    }): any
    icon(props: {
      entry: Exclude<UiEntryViewNode['entry'], { kind: 'separator' }>
      icon?: unknown
    }): any
  }>()
</script>
<template>
  <template
    v-for="node in entries"
    :key="node.entry.key"
  >
    <VDivider v-if="node.entry.kind === 'separator'" />
    <template v-else-if="node.entry.kind === 'group'">
      <VListSubheader>
        <EntryIcon
          v-if="node.entry.icon || iconColumn"
          start
          class="vuetify-entry-icon"
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
      <NavigationTreeBranch
        :entries="node.children ?? []"
        :label="node.entry.label"
        :parent-key="parentKey"
        group
        @activate="emit('activate', $event)"
        @expand="(key, open) => emit('expand', key, open)"
        @retry="emit('retry', $event)"
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
      </NavigationTreeBranch>
    </template>
    <VListGroup
      v-else-if="node.entry.kind === 'submenu'"
      :value="node.entry.key"
      :aria-busy="node.status?.pending || undefined"
    >
      <template #activator="{ props: native }">
        <VListItem
          class="vuetify-entry-item"
          v-bind="{
            ...native,
            onClick: () => emit('expand', node.entry.key, !node.expanded),
          }"
          :aria-expanded="Boolean(node.expanded)"
          tag="button"
          type="button"
          role="button"
          :aria-selected="undefined"
          :disabled="node.entry.disabled"
          :active="Boolean(node.containsCurrent)"
          :data-entry-key="node.entry.key"
          :aria-label="node.entry.label"
        >
          <template
            v-if="node.entry.icon || iconColumn"
            #prepend
          >
            <EntryIcon
              aria-hidden="true"
              class="vuetify-entry-icon"
            >
              <slot
                v-if="node.entry.icon"
                name="icon"
                :entry="node.entry"
                :icon="node.entry.icon"
              />
            </EntryIcon>
          </template>
          <template #title>
            <slot
              name="entry"
              :entry="node.entry"
            >
              {{ node.entry.label }}
            </slot>
          </template>
        </VListItem>
      </template>
      <NavigationTreeBranch
        v-if="node.expanded"
        :entries="node.children ?? []"
        :status="node.status"
        :label="node.entry.label"
        :parent-key="node.entry.key"
        @activate="emit('activate', $event)"
        @expand="(key, open) => emit('expand', key, open)"
        @retry="emit('retry', $event)"
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
      </NavigationTreeBranch>
    </VListGroup>
    <VListItem
      class="vuetify-entry-item"
      v-else
      :tag="node.entry.href ? 'a' : 'button'"
      :type="node.entry.href ? undefined : 'button'"
      :href="node.entry.disabled ? undefined : node.entry.href"
      :disabled="node.entry.disabled"
      :active="Boolean(node.current)"
      :aria-current="node.current ? 'page' : undefined"
      :data-entry-key="node.entry.key"
      :aria-label="node.entry.label"
      @click="activate(node, $event as MouseEvent)"
    >
      <template
        v-if="node.entry.icon || iconColumn"
        #prepend
      >
        <EntryIcon
          aria-hidden="true"
          class="vuetify-entry-icon"
        >
          <slot
            v-if="node.entry.icon"
            name="icon"
            :entry="node.entry"
            :icon="node.entry.icon"
          />
        </EntryIcon>
      </template>
      <template #title>
        <slot
          name="entry"
          :entry="node.entry"
        >
          {{ node.entry.label }}
        </slot>
      </template>
    </VListItem>
  </template>
  <div
    v-if="status?.message"
    role="status"
  >
    {{ status.message }}
    <VBtn
      v-if="status.failed"
      @click="emit('retry', parentKey)"
    >
      {{ status.retryLabel }}
    </VBtn>
  </div>
</template>
