import {
  computed,
  inject,
  onScopeDispose,
  onMounted,
  ref,
  type ComputedRef,
  type InjectionKey,
} from 'vue'
import { useUiFieldStrategyContext } from '@uninterface/uninterface/backend'
import type { UiFieldViewBinding } from '@uninterface/uninterface/backend'

export const fieldLayoutKey: InjectionKey<
  | {
      binding: ComputedRef<UiFieldViewBinding>
      frameLabel: ComputedRef<boolean>
      deferredIssue: ComputedRef<string | null>
      registerControl(
        floating: boolean,
        frame?: boolean,
        checkable?: boolean,
      ): () => void
    }
  | undefined
> = Symbol('vuetify-field-layout')

/** Native details replace help with errors; coexistence needs external feedback. */
export function needsCustomFeedback(policy: {
  help: string
  failure?: string
}) {
  return policy.help === 'together' || policy.failure === 'show-tooltip'
}

/** Integrated VInput controls own label and feedback for a single-value field. */
export function useFieldPresentation(
  floating = true,
  frame = false,
  checkable = false,
) {
  const policy = useUiFieldStrategyContext()
  const field = inject(fieldLayoutKey, undefined)
  let release: (() => void) | undefined
  const registered = ref(false)
  onMounted(() => {
    if (field) {
      release = field.registerControl(floating, frame, checkable)
      registered.value = true
    }
  })
  onScopeDispose(() => release?.())
  const binding = computed(() =>
    field?.binding.value.group && !frame ? undefined : field?.binding.value,
  )
  const presentation = computed(() => ({
    ...(policy?.value.labels === 'floating' ? { singleLine: false } : {}),
    label:
      !registered.value ||
      (frame && !field?.frameLabel.value) ||
      (policy &&
        policy.value.labels !== 'floating' &&
        policy.value.labels !== 'integrated' &&
        policy.value.labels !== 'adjacent')
        ? undefined
        : binding.value
          ? binding.value.label
          : undefined,
    messages:
      !registered.value || (policy && needsCustomFeedback(policy.value))
        ? undefined
        : binding.value?.help,
    errorMessages:
      !registered.value ||
      field?.deferredIssue.value ||
      (policy && needsCustomFeedback(policy.value))
        ? undefined
        : binding.value
          ? ((policy ? policy.value.issue : binding.value.issue) ?? undefined)
          : undefined,
    hideDetails:
      !registered.value || (policy && needsCustomFeedback(policy.value))
        ? true
        : binding.value
          ? ('auto' as const)
          : true,
  }))
  const messageId = computed(() =>
    binding.value
      ? `${binding.value.id}-${!field?.deferredIssue.value && (policy ? policy.value.issue : binding.value.issue) ? 'issue' : 'help'}`
      : undefined,
  )
  const requiredMarker = computed(() =>
    Boolean(
      binding.value?.requiredLabel &&
        (!frame || presentation.value.label !== undefined) &&
        (!policy || policy.value.marker === 'required') &&
        (!policy ||
          policy.value.labels === 'floating' ||
          policy.value.labels === 'integrated' ||
          policy.value.labels === 'adjacent'),
    ),
  )
  const requiredPrefix = computed(
    () => requiredMarker.value && policy?.value.markerPosition === 'prefix',
  )
  return {
    field: binding,
    presentation,
    messageId,
    requiredMarker,
    requiredPrefix,
  }
}
