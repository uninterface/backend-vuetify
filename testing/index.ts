import {
  uiNativeTestAdapter,
  type UiTestAdapter,
} from '@uninterface/testing/playwright'

/** Toolkit part mapping; browser actions remain in the shared harness. */
import {
  cardParts,
  fieldGroupParts,
  fieldSelectors,
} from './presentation-parts.mjs'
import { presentationParts } from './presentation-mapping'

export const uiTestAdapter: UiTestAdapter = {
  ...presentationParts,
  card: (card) => cardParts((selector) => card.locator(selector)),
  fieldGroup(group) {
    const parts = fieldGroupParts((selector) => group.locator(selector))
    const { label } = parts
    const generated = label
      .and(group.page().locator(fieldSelectors.required))
      .or(label.locator(fieldSelectors.required))
    return {
      ...parts,
      required: {
        elements: label.locator(':not(*)'),
        before: generated,
        after: generated,
      },
    }
  },
  inputFrame: (frame) => ({
    surface: frame
      .locator('xpath=ancestor-or-self::*')
      .and(frame.page().locator('.vuetify-input-frame'))
      .last(),
  }),
  buttonFocus: (button) => ({
    target: button,
    kind: 'border',
    pseudo: '::after',
  }),
  async checkable(control) {
    const parts = await uiNativeTestAdapter.checkable!(control)
    const container = control
      .locator('xpath=ancestor::*')
      .and(control.page().locator('.v-selection-control'))
      .last()
    const surface = container.locator('.v-selection-control__wrapper')
    return { ...parts, surface: (await surface.count()) ? surface : control }
  },
  version: 1,
  menuPopup(menu) {
    // The sheet inside the overlay owns the menu's background.
    return menu
      .locator(
        'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " v-overlay__content ")][1]',
      )
      .and(menu.page().locator('.v-menu > .v-overlay__content'))
      .locator(':scope > .v-sheet')
  },
  async multiSelect(control) {
    const parts = uiTestAdapter.select(control)
    return {
      ...parts,
      clear: parts.trigger.locator('.v-field__clearable [role="button"]'),
    }
  },
  choice: uiNativeTestAdapter.choice,

  navigationEntry: uiNativeTestAdapter.navigationEntry,
  columnHeaders(table) {
    // Playwright 1.56 infers cell for these native th elements without scope.
    // Chromium exposes them as columnheader in the browser accessibility tree.
    return table.locator(':scope > thead > tr > th')
  },
  modal(dialog) {
    // VCardText owns the named body scroll region around the slot content.
    return {
      body: dialog.locator(
        ':scope > .vuetify-modal-surface > .vuetify-modal-scroll',
      ),
      actions: dialog.locator(
        ':scope > .vuetify-modal-surface > .vuetify-modal-footer',
      ),
    }
  },
  tableHeaderSeparator: uiNativeTestAdapter.tableHeaderSeparator,
  columnHeaderParts(header) {
    return {
      caption: header.locator('.v-data-table-header__content'),
      sortTarget: header.and(
        header.page().locator('.v-data-table__th--sortable'),
      ),
      sortIndicator: header.locator('.v-data-table-header__sort-icon'),
    }
  },
  popoverSurface(dialog) {
    return dialog.locator(
      ':scope[data-ui-overlay="popover"] > .vuetify-modal-surface',
    )
  },
  async field(control) {
    const field = control.locator(
      'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " vuetify-field ")][1]',
    )
    const external = field.locator(':scope > label')
    const label = (await external.count())
      ? external
      : field.locator(
          '.v-field--active .v-field-label--floating, .v-field:not(.v-field--active) .v-field-label:not(.v-field-label--floating)',
        )
    // A shared input frame contains an editor's delegated native field too.
    // Inspect the owning outer surface, not both layers of that composition.
    const surface = field.locator('.v-field:not(.v-field .v-field)')
    return {
      label,
      // Native integrated labels deliberately pass pointer events through to
      // the field/input. Keep the painted label distinct from its hit target.
      labelTarget: (await external.count()) ? external : surface,
      surface: (await surface.count()) ? surface : control,
      required: {
        elements: label.locator(':scope > :not(*)'),
        before: label,
        after: label,
      },
    }
  },
  checkbox: (control) => control,
  select(control) {
    return {
      kind: 'composite',
      trigger: control.locator(
        'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " v-field ")][1]',
      ),
      selection: control
        .locator(
          'xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " v-select ")][1]',
        )
        .locator('.v-select__selection'),
      async popup() {
        const id = await control.getAttribute('aria-controls')
        if (!id || /\s/.test(id))
          throw new Error(
            'UiSelect must identify exactly one owned popup through aria-controls.',
          )
        const owned = control.page().locator(`[id=${JSON.stringify(id)}]`)
        return owned.locator('.v-overlay__content > .v-sheet')
      },
    }
  },
}

export { browserControlParts } from './browser-control-parts'
