import type {
  UiCardTestParts,
  UiFieldGroupTestParts,
  UiTemporalPickerTestParts,
} from '@uninterface/testing/playwright'
import type { UiDomFieldSelectors } from '@uninterface/testing/dom'

export const fieldSelectors: UiDomFieldSelectors
export function cardParts<Part>(
  find: (selector: string) => Part,
): UiCardTestParts<Part>
export function fieldGroupParts<Part>(
  find: (selector: string) => Part,
): Pick<UiFieldGroupTestParts<Part>, 'label' | 'controlArea'>

export function temporalPickerParts<Part>(
  find: (selector: string) => Part,
): UiTemporalPickerTestParts<Part>

export const entryIconColumn: string
