import {
  browserFieldFeedbackParts,
  type UiTestAdapter,
} from '@uninterface/testing/playwright'
import {
  fieldSelectors,
  temporalPickerParts,
  entryIconColumn,
} from './presentation-parts.mjs'

export const presentationParts = {
  fieldFeedback: (editor) =>
    browserFieldFeedbackParts(editor, fieldSelectors.invalid),
  tableBody(table) {
    const scope = table.locator('xpath=ancestor-or-self::*[@data-scroll][1]')
    return {
      body: table.locator('tbody'),
      scrollSurface: scope.locator('.v-table__wrapper'),
      emptyState: scope.locator('.vuetify-empty'),
      errorState: scope.locator('[data-collection-failure="initial"]'),
    }
  },
  feedbackItem(item) {
    return {
      content: item.locator('.vuetify-feedback-content'),
      surface: item.locator('.vuetify-feedback-surface'),
    }
  },
  progressBar(bar) {
    return {
      track: bar,
      fill: bar.locator(
        '.v-progress-linear__determinate,.v-progress-linear__indeterminate.long',
      ),
    }
  },
  uploadRegion(region) {
    const surface = region
    const chooser = region.locator('[data-upload-choose]')
    return {
      surface,
      chooser,
      chooserFocus: { target: chooser, kind: 'border', pseudo: '::after' },
    }
  },
  temporalPicker: (picker) =>
    temporalPickerParts((selector) => picker.locator(selector)),
  menuEntryIcon(entry) {
    const column = entry.locator(
      `:is(${entryIconColumn}):not(:scope [data-entry-key] *)`,
    )
    return {
      column,
      icon: column.locator(':scope > *'),
    }
  },
} satisfies Partial<UiTestAdapter>
