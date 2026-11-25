<script setup lang="ts">
  import { useUiZPart } from '@uninterface/uninterface/backend'
  const vUiZPart = useUiZPart()
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import { computed } from 'vue'
  import type { UiRegionLayoutViewBinding } from '@uninterface/uninterface/backend'
  const props = defineProps<{ binding: UiRegionLayoutViewBinding }>()
  const before = computed(() =>
    props.binding.regions.filter(
      (name) => !props.binding.group.regions.includes(name) && name === 'start',
    ),
  )
  const after = computed(() =>
    props.binding.regions.filter(
      (name) => !props.binding.group.regions.includes(name) && name === 'end',
    ),
  )
  const grouped = computed(() =>
    props.binding.regions.filter((name) =>
      props.binding.group.regions.includes(name),
    ),
  )
  const rows = computed(() =>
    [
      ...before.value.map(() => 'auto'),
      'minmax(3rem, 1fr)',
      ...after.value.map(() => 'auto'),
    ].join(' '),
  )
</script>
<template>
  <div
    class="vuetify-region-host"
    :style="{ height: `${binding.height}px`, gridTemplateRows: rows }"
    role="group"
    :aria-label="binding['aria-label']"
    tabindex="0"
  >
    <div
      v-for="name in before"
      :key="name"
      v-ui-z-part="binding.zItems?.[name]"
      class="vuetify-region-retained"
    >
      <slot :name="name" />
    </div>
    <div
      :key="binding.group.id"
      class="vuetify-region-scroll"
      role="region"
      :aria-label="binding.group['aria-label']"
      tabindex="0"
    >
      <div
        v-for="name in grouped"
        :key="name"
        v-ui-z-part="binding.zItems?.[name]"
        class="vuetify-region-item"
      >
        <slot :name="name" />
      </div>
    </div>
    <div
      v-for="name in after"
      :key="name"
      v-ui-z-part="binding.zItems?.[name]"
      class="vuetify-region-retained"
    >
      <slot :name="name" />
    </div>
  </div>
</template>
