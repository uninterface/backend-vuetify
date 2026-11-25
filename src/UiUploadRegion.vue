<script setup lang="ts">
  import { useUiZView } from '@uninterface/uninterface/backend'
  useUiZView()

  import {
    useUiUploadRegionView,
    useUiFieldFailure,
    type UiUploadRegionViewProps,
  } from '@uninterface/uninterface/backend'
  import Preview from './UiFilePreview.vue'
  import Progress from './UiUploadProgress.vue'
  import { VBtn } from 'vuetify/components/VBtn'
  import { VIcon } from 'vuetify/components/VIcon'
  import { VInput } from 'vuetify/components/VInput'
  import { VField } from 'vuetify/components/VField'
  import { provide, ref } from 'vue'
  import { fieldLayoutKey, useFieldPresentation } from './fieldLayout'
  import { useControlSize } from './controlSize'
  import RemoveIcon from './icons/delete.vue'
  defineOptions({ inheritAttrs: false })
  const props = defineProps<UiUploadRegionViewProps>()
  const {
    root,
    input,
    dragging,
    labelled,
    choose,
    changed,
    dragover,
    dragleave,
    drop,
    focus,
  } = useUiUploadRegionView(props)
  const density = useControlSize('UiUploadRegion')
  const invalid = useUiFieldFailure(() => props.binding)
  const focused = ref(false)
  const { field, presentation, requiredMarker, requiredPrefix } =
    useFieldPresentation(true, true)
  provide(fieldLayoutKey, undefined)
  defineExpose({ focus })
</script>
<template>
  <VInput
    class="vuetify-upload-host"
    :density="density"
    :disabled="binding.disabled"
    :error="invalid || !!issue"
    :rules="[]"
    hide-details
  >
    <VField
      :ref="
        (element: any) => {
          root = element?.$el
        }
      "
      :disabled="binding.disabled"
      :error="invalid || !!issue"
      v-bind="$attrs"
      :id="binding.id"
      :label="presentation.label"
      :label-id="field ? `${field.id}-label` : undefined"
      :single-line="presentation.singleLine"
      :active="true"
      :focused="!binding.disabled && (focused || (dragging && canAcquire))"
      :color="dragging && canAcquire ? 'primary' : undefined"
      @focusin="focused = true"
      @focusout="
        focused = !!root?.contains($event.relatedTarget as Node | null)
      "
      @click="focus"
      role="group"
      :aria-label="label || chooseLabel"
      :aria-busy="busy || undefined"
      :aria-invalid="binding.invalid || !!issue || undefined"
      :aria-disabled="binding.disabled || undefined"
      :aria-describedby="labelled['aria-describedby']"
      :tabindex="binding.disabled ? undefined : -1"
      data-ui-upload-region
      :data-upload-phase="phase"
      :data-upload-error="!!issue || undefined"
      :data-upload-recovery="!!issue || !!progress?.canRetry || undefined"
      class="vuetify-upload-region"
      :class="{
        'vuetify-required-control': requiredMarker,
        'vuetify-required-prefix': requiredPrefix,
      }"
      :data-extent="extent"
      :style="
        allocatedHeight === undefined
          ? undefined
          : { blockSize: allocatedHeight + 'px' }
      "
      :data-drop-ready="canAcquire || undefined"
      :data-dragging="(dragging && canAcquire) || undefined"
      :data-invalid="binding.invalid || !!issue || undefined"
      @dragover.capture="dragover"
      @dragleave.capture="dragleave"
      @drop.capture="(event: any) => drop(event)"
    >
      <template #default="{ props: contentProps }">
        <!-- Independent actions must not trigger VField's single-input click handling. -->
        <div
          :class="contentProps.class"
          class="vuetify-upload-content"
          :data-upload-phase="phase"
          :data-upload-error="!!issue || undefined"
          :data-upload-recovery="!!issue || !!progress?.canRetry || undefined"
          :data-extent="extent"
          @click.stop
        >
          <span
            v-if="requiredLabel"
            :id="binding.id + '-upload-required'"
            class="upload-required-description"
          >
            {{ requiredLabel }}
          </span>
          <input
            ref="input"
            type="file"
            hidden
            :accept="accept"
            :capture="capture"
            :disabled="!canAcquire"
            @change="changed"
          />
          <div
            v-if="phase === 'ready' && !issue && !progress?.canRetry"
            class="vuetify-upload-icon"
            aria-hidden="true"
          >
            <VIcon
              icon="$upload"
              size="1em"
            />
          </div>
          <VBtn
            v-bind="labelled"
            type="button"
            variant="tonal"
            size="large"
            data-upload-choose
            v-if="phase === 'ready'"
            :disabled="!canAcquire"
            @click="choose"
          >
            {{ chooseLabel }}
          </VBtn>
          <span
            v-if="
              fileName &&
              !preview &&
              !(
                progress?.fileName &&
                (progress.active || progress.issue || progress.canRetry)
              )
            "
            data-ui-file-name
            :title="fileName ?? undefined"
            class="vuetify-upload-name"
          >
            {{ fileName }}
          </span>
          <div
            v-if="!progress?.issue"
            :id="binding.id + '-upload-issue'"
            role="status"
            class="vuetify-upload-feedback"
            :title="issue ?? undefined"
          >
            {{ issue }}
          </div>
          <Progress
            v-if="progress"
            v-bind="progress"
          />
          <div
            v-if="preview"
            data-upload-preview
            class="vuetify-upload-preview"
          >
            <Preview
              v-bind="preview"
              :presentation="issue ? 'row' : preview.presentation"
            />
          </div>
          <div
            v-if="actions.length"
            class="vuetify-upload-actions"
          >
            <VBtn
              v-for="action in actions"
              :key="action.name"
              type="button"
              :variant="action.name === 'remove' ? 'text' : 'outlined'"
              :icon="action.name === 'remove'"
              :data-upload-action="action.name"
              :aria-label="
                action.accessibleLabel ??
                (action.name === 'remove' ? action.label : undefined)
              "
              :title="action.name === 'remove' ? action.label : undefined"
              :disabled="action.disabled"
              @click="action.invoke"
            >
              <RemoveIcon
                v-if="action.name === 'remove'"
                aria-hidden="true"
                class="upload-remove-icon"
              />
              <template v-if="action.name !== 'remove'">
                {{ action.label }}
              </template>
            </VBtn>
          </div>
        </div>
      </template>
    </VField>
  </VInput>
</template>
