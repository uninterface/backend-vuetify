<script setup lang="ts">
  import { computed } from 'vue'
  import { VList } from 'vuetify/components/VList'
  import type {
    UiEntryViewNode,
    UiEntryStatusViewBinding,
  } from '@uninterface/uninterface/backend'
  import NavigationTreeBranch from './NavigationTreeBranch.vue'
  const props = defineProps<{
    entries: readonly UiEntryViewNode[]
    status?: UiEntryStatusViewBinding
    label: string
  }>()
  const emit = defineEmits<{
    activate: [key: string]
    expand: [key: string, open: boolean]
    retry: [key?: string]
  }>()
  // One native list owns all nested groups, including groups revealed lazily.
  // Core still owns expansion; the native opened model mirrors the whole tree.
  const branches = computed(() => {
    const result: UiEntryViewNode[] = []
    function visit(nodes: readonly UiEntryViewNode[]) {
      for (const node of nodes) {
        if (node.entry.kind === 'submenu') result.push(node)
        if (node.children) visit(node.children)
      }
    }
    visit(props.entries)
    return result
  })
  const opened = computed(() =>
    branches.value
      .filter((node) => node.expanded)
      .map((node) => node.entry.key),
  )
  function expand(keys: unknown[]) {
    for (const node of branches.value)
      if (Boolean(node.expanded) !== keys.includes(node.entry.key))
        emit('expand', node.entry.key, keys.includes(node.entry.key))
  }
</script>
<template>
  <VList
    class="vuetify-navigation-tree"
    :opened="opened"
    open-strategy="multiple"
    nav
    slim
    density="comfortable"
    :aria-label="label"
    :aria-busy="status?.pending || undefined"
    @update:opened="expand"
  >
    <NavigationTreeBranch
      :entries="entries"
      :status="status"
      :label="label"
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
  </VList>
</template>
