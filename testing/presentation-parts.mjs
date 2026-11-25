export function cardParts(find) {
  return {
    header: find(':scope > .vuetify-card-header'),
    body: find(':scope > .vuetify-card-body'),
    footer: find(':scope > .vuetify-card-footer'),
    topEnd: find(':scope > .vuetify-card-top-end'),
  }
}

export const fieldSelectors = {
  root: '.vuetify-field',
  surface: '.v-field',
  required:
    '.vuetify-required,.vuetify-required-control,.vuetify-required-checkbox',
  invalid: '.v-input--error',
}

export function fieldGroupParts(find) {
  return {
    label: find(':scope > .v-label'),
    controlArea: find(':scope > .vuetify-field-editor'),
  }
}

export function temporalPickerParts(find) {
  return {
    dateInput: find('input[type=date],input[type=datetime-local]'),
    timeInput: find('input[type=time],input[type=datetime-local]'),
    day(isoDate) {
      return find(
        'button.v-date-picker-month__day-btn[data-v-date="DATE"], button.v-date-picker-month__day-btn[id$="-day-DATE"]'.replaceAll(
          'DATE',
          isoDate,
        ),
      )
    },
    timeSegment(unit) {
      return find(
        '.v-time-picker-controls__time__field:nth-of-type(UNIT_INDEX) input'.replace(
          'UNIT_INDEX',
          String(['hour', 'minute', 'second'].indexOf(unit) + 1),
        ),
      )
    },
  }
}

export const entryIconColumn = '.vuetify-entry-icon'
