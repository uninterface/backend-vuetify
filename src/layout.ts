import type { UiLayoutPresentation } from '@uninterface/uninterface/backend'

export const uiLayoutPresentation: UiLayoutPresentation = {
  scrollFocus: { class: 'vuetify-scroll-focus' },
  peerSpacing: {
    class: 'ga-4',
  },
  peerSpacingLevels: {
    [-1]: { class: 'ga-2 vuetify-compact-layout' },
    1: { class: 'ga-6' },
  },
}
