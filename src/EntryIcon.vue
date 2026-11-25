<script setup lang="ts">
  import { VIcon } from 'vuetify/components/VIcon'
</script>
<template>
  <!-- A direct native icon child enables VListItem's themed prepend spacer.
       The same native square remains present when a sibling has no artwork. -->
  <VIcon
    class="vuetify-entry-icon"
    aria-hidden="true"
  >
    <slot />
  </VIcon>
</template>
