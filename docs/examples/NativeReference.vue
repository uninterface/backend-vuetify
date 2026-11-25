<script setup lang="ts">
  import {
    VExpansionPanels,
    VExpansionPanel,
  } from 'vuetify/components/VExpansionPanel'
  const nativeExpanded = ref<string[]>([])
  import { ref, computed } from 'vue'
  import { VDialog } from 'vuetify/components/VDialog'
  import {
    VCard,
    VCardItem,
    VCardText,
    VCardActions,
  } from 'vuetify/components/VCard'
  const nativeModal = ref(false)
  import { VTextField } from 'vuetify/components/VTextField'
  import { VSelect } from 'vuetify/components/VSelect'
  import { VCheckbox } from 'vuetify/components/VCheckbox'
  import { VBtn } from 'vuetify/components/VBtn'
  import { VMenu } from 'vuetify/components/VMenu'
  import { VList, VListItem } from 'vuetify/components/VList'
  const props = defineProps<{
    invalid: boolean
    loading: boolean
    disabled: boolean
    sourceState: string
  }>()
  const status = computed(
    () =>
      ({
        idle: 'Entries not loaded.',
        loading: 'Loading entries…',
        error: 'Entries could not be loaded.',
        empty: 'No entries available.',
      })[props.sourceState],
  )
  const name = ref('Ada')
  const location = ref('Shanghai')
  const active = ref(true)
</script>
<template>
  <VExpansionPanels
    v-model="nativeExpanded"
    multiple
    data-native-collapsible
  >
    <VExpansionPanel
      value="details"
      title="Additional information"
      :disabled="disabled"
      eager
    >
      <template #text><p>Retained detail content.</p></template>
    </VExpansionPanel>
  </VExpansionPanels>
  <VBtn @click="nativeModal = true">Open native modal</VBtn>
  <VDialog
    v-model="nativeModal"
    scrollable
  >
    <VCard>
      <VCardItem>
        <template #title>
          <span
            role="heading"
            aria-level="2"
          >
            Modal presentation
          </span>
        </template>
        <template #append>
          <VBtn
            icon="$close"
            variant="text"
            aria-label="Close"
            @click="nativeModal = false"
          />
        </template>
      </VCardItem>
      <VCardText><p>Review the operation before continuing.</p></VCardText>
      <VCardActions>
        <VBtn @click="nativeModal = false">Cancel</VBtn>
        <VBtn @click="nativeModal = false">OK</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
  <nav aria-label="Native destinations">
    <VBtn
      variant="text"
      active
    >
      Editor
    </VBtn>
    <VMenu>
      <template #activator="{ props }">
        <VBtn
          variant="text"
          append-icon="$dropdown"
          v-bind="props"
        >
          Examples
        </VBtn>
      </template>
      <VList>
        <VListItem
          title="Buttons"
          link
        />
        <VListItem
          title="More"
          append-icon="$next"
          link
        >
          <VMenu
            activator="parent"
            submenu
          >
            <VList>
              <VListItem
                title="Forms"
                link
              />
            </VList>
          </VMenu>
        </VListItem>
      </VList>
    </VMenu>
  </nav>
  <VTextField
    v-model="name"
    label="Name"
    :error-messages="invalid ? 'Enter a name.' : undefined"
    messages="Use a recognizable name."
    :disabled="disabled"
  />
  <VSelect
    v-model="location"
    label="Location"
    :items="sourceState === 'ready' ? ['Shanghai'] : []"
    :loading="sourceState === 'loading'"
    :no-data-text="status"
    :disabled="disabled"
  />
  <VCheckbox
    v-model="active"
    label="Active"
    :disabled="disabled"
    :error="invalid"
  />
  <VBtn
    color="primary"
    variant="flat"
    :loading="loading"
    :disabled="disabled"
  >
    Save
  </VBtn>
  <VBtn
    color="secondary"
    variant="flat"
    :disabled="disabled"
  >
    Reset
  </VBtn>
  <VBtn
    color="primary"
    variant="outlined"
  >
    Outline
  </VBtn>
  <VMenu>
    <template #activator="{ props }">
      <VBtn v-bind="props">Commands</VBtn>
    </template>
    <VList>
      <VListItem
        title="Refresh"
        link
      />
      <VListItem
        title="More"
        append-icon="$next"
        link
      >
        <VMenu
          activator="parent"
          submenu
        >
          <VList>
            <VListItem
              title="Inspect"
              link
            />
            <VListItem
              title="Delete"
              disabled
            />
          </VList>
        </VMenu>
      </VListItem>
    </VList>
  </VMenu>
</template>
