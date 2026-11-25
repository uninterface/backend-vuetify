import { test, expect, type Page } from '@playwright/test'
import {
  clickUiFieldLabel,
  createUiTest,
} from '@uninterface/testing/playwright'
import { uiTestAdapter } from './index'
import { buildSegmentedField } from './segmented-field-build.mjs'

async function mountSegmentedField(page: Page, width: number, locale = 'en') {
  const fixture = await buildSegmentedField()
  await page.setViewportSize({ width, height: 900 })
  await page.setContent('<!doctype html><html lang="en"><body></body></html>')
  expect(await page.evaluate(() => document.compatMode)).toBe('CSS1Compat')
  await page.addStyleTag({ content: fixture.styles })
  await page.addScriptTag({ content: fixture.script })
  await page.evaluate(async (locale) => {
    const host = window as any
    host.segmentedExample =
      await host.SegmentedField.mountSegmentedField(locale)
  }, locale)
  return page.locator('[data-case=segmented]')
}

for (const width of [1100, 390]) {
  test(`segmented field labels clear native choices and focus stays usable at ${width}px`, async ({
    page,
  }) => {
    const field = await mountSegmentedField(page, width)
    const group = field.getByRole('radiogroup', { name: 'Period', exact: true })
    const today = group.getByRole('radio', { name: 'Today', exact: true })
    const label = field.locator('.v-field-label--floating')
    for (const variant of ['filled', 'outlined']) {
      await page.evaluate(async (value) => {
        const example = (window as any).segmentedExample
        example.state.variant = value
        example.field.reset()
        await example.tick()
      }, variant)
      await expect(label).toBeVisible()
      const labelBox = await label.boundingBox()
      const optionBox = await today.boundingBox()
      expect(labelBox && optionBox).toBeTruthy()
      expect(labelBox!.y + labelBox!.height).toBeLessThanOrEqual(
        optionBox!.y + 1,
      )
      await clickUiFieldLabel(
        await createUiTest(page, uiTestAdapter).field(today),
      )
      await expect(today).toBeFocused()
      await today.press('Space')
      await expect(today).toBeChecked()
      await today.press('ArrowRight')
      await expect(
        group.getByRole('radio', { name: 'This week', exact: true }),
      ).toBeFocused()
      await expect(field.locator('.segmented-field')).toHaveClass(
        /v-field--focused/,
      )
      await expect(label).toBeVisible()
      await page.getByRole('button', { name: 'Outside', exact: true }).focus()
      await expect(field.locator('.segmented-field')).not.toHaveClass(
        /v-field--focused/,
      )
    }
    for (const variant of ['filled', 'outlined']) {
      await page.evaluate(async (value) => {
        const example = (window as any).segmentedExample
        example.state.variant = value
        await example.tick()
      }, variant)
      for (const size of [-2, -1, 0, 1, 2, undefined]) {
        await page.evaluate(async (value) => {
          const example = (window as any).segmentedExample
          example.state.size = value
          await example.tick()
        }, size)
        const segmentedBox = (await field
          .locator('.segmented-field')
          .boundingBox())!
        const textBox = await page
          .locator('[data-case=text] .v-field')
          .boundingBox()
        expect(textBox).toBeTruthy()
        expect(
          Math.abs(segmentedBox.height - textBox!.height),
        ).toBeLessThanOrEqual(1)
        const valueFontSize = await page
          .locator('[data-case=text] input')
          .evaluate((input) => getComputedStyle(input).fontSize)
        await expect(today.locator('.v-btn__content > span')).toHaveCSS(
          'font-size',
          valueFontSize,
        )
        const labelBox = (await label.boundingBox())!
        const optionBox = (await today.boundingBox())!
        expect(labelBox.y + labelBox.height).toBeLessThanOrEqual(
          optionBox.y + 1,
        )
        expect(optionBox.height).toBeGreaterThanOrEqual(24)
      }
    }
    await group.evaluate((element) => {
      ;(element as HTMLElement).style.width = '180px'
    })
    expect(
      await group
        .locator('.segmented-scroll')
        .evaluate((element) => element.scrollWidth > element.clientWidth),
    ).toBe(true)
    const month = group.getByRole('radio', { name: 'This month', exact: true })
    await month.focus()
    await month.press('Space')
    await expect(month).toBeChecked()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
    await page.evaluate(async () => {
      const example = (window as any).segmentedExample
      example.field.reset()
      await example.field.validate()
      await example.tick()
    })
    await expect(
      field.getByText('Choose a period', { exact: true }),
    ).toBeVisible()
    await expect(field.locator('.segmented-field')).toHaveClass(
      /v-field--error/,
    )
    await expect(label).toBeVisible()
  })
}

for (const [labels, direction] of [
  ['above', 'ltr'],
  ['floating', 'rtl'],
] as const) {
  test(`segmented fields with ${labels} labels keep their height and visible focus on resize in ${direction}`, async ({
    page,
  }) => {
    const field = await mountSegmentedField(
      page,
      520,
      direction === 'rtl' ? 'ar' : 'en',
    )
    await page.evaluate(
      async ({ labels, direction }) => {
        document.documentElement.dir = direction
        const example = (window as any).segmentedExample
        example.state.labels = labels
        await example.tick()
      },
      { labels, direction },
    )
    const group = field.getByRole('radiogroup', { name: 'Period', exact: true })
    const scroll = group.locator('.segmented-scroll')
    const today = group.getByRole('radio', { name: 'Today', exact: true })
    const month = group.getByRole('radio', { name: 'This month', exact: true })
    const setWidth = (width: number) =>
      group.evaluate((element, width) => {
        element.style.width = `${width}px`
      }, width)
    const scrollGeometry = () =>
      scroll.evaluate((element) => {
        const overflow = element.scrollWidth > element.clientWidth
        const reservedSpace =
          (element as HTMLElement).offsetHeight - element.clientHeight
        const padding = parseFloat(getComputedStyle(element).paddingBlockEnd)
        const content = element.parentElement!
        const surface = content.closest('.segmented-field')!
        const { left, right, bottom } = element.getBoundingClientRect()
        const fieldBounds = surface.getBoundingClientRect()
        const option = element.querySelector('[role=radio]')!
        const caption = option.querySelector('.v-btn__content > span')!
        const value = document.querySelector(
          '[data-case=select] .v-select__selection',
        )!
        const peerSurface = value.closest('.v-field')!
        const textCenter = (node: Element, field: Element) => {
          const range = document.createRange()
          range.selectNodeContents(node)
          const box = range.getBoundingClientRect()
          return box.top + box.height / 2 - field.getBoundingClientRect().top
        }
        return {
          overflow,
          clearance: reservedSpace > 0 || padding >= 12,
          reservedSpace,
          edges: Math.max(
            Math.abs(left - fieldBounds.left),
            Math.abs(right - fieldBounds.right),
          ),
          height: fieldBounds.height,
          totalHeight: surface.parentElement!.getBoundingClientRect().height,
          optionInsideSurface:
            option.getBoundingClientRect().bottom <= fieldBounds.bottom + 1,
          trackStartsBelowCaption:
            bottom - (reservedSpace || 12) >=
            option.getBoundingClientRect().bottom - 1,
          captionAligned:
            Math.abs(
              textCenter(caption, surface) - textCenter(value, peerSurface),
            ) <= 1,
          captionSpacing:
            getComputedStyle(caption).letterSpacing ===
              getComputedStyle(value).letterSpacing &&
            getComputedStyle(caption).lineHeight ===
              getComputedStyle(value).lineHeight,
          optionTop: option.getBoundingClientRect().top - fieldBounds.top,
          optionHeight: option.getBoundingClientRect().height,
        }
      })
    const choiceVisible = () =>
      month.evaluate((element) => {
        const scrollport = element.closest<HTMLElement>('.segmented-scroll')!
        const left =
          scrollport.getBoundingClientRect().left + scrollport.clientLeft
        const right = left + scrollport.clientWidth
        const option = element.getBoundingClientRect()
        return option.left >= left - 1 && option.right <= right + 1
      })

    await expect(scroll).toHaveCSS('direction', direction)
    for (const [size, height] of [
      [-2, 40],
      [-1, 48],
      [0, 56],
      [1, 56],
      [2, 56],
      [undefined, 56],
    ] as const) {
      await page.evaluate(async (size) => {
        const example = (window as any).segmentedExample
        example.state.size = size
        await example.tick()
      }, size)
      await setWidth(480)
      await expect.poll(scrollGeometry).toMatchObject({
        height,
        overflow: false,
        reservedSpace: 0,
        edges: 0,
        optionInsideSurface: true,
        captionAligned: true,
        captionSpacing: true,
      })
      const { totalHeight, optionTop, optionHeight } = await scrollGeometry()
      await setWidth(180)
      await expect.poll(scrollGeometry).toMatchObject({
        height,
        totalHeight,
        optionTop,
        optionHeight,
        overflow: true,
        clearance: true,
        edges: 0,
        optionInsideSurface: true,
        trackStartsBelowCaption: true,
        captionAligned: true,
        captionSpacing: true,
      })
    }
    await setWidth(480)
    await expect
      .poll(scrollGeometry)
      .toMatchObject({ overflow: false, reservedSpace: 0, edges: 0 })
    const { height, optionTop, optionHeight } = await scrollGeometry()
    expect(height).toBe(56)
    const originalGeometry = { height, optionTop, optionHeight }
    await setWidth(180)
    await expect.poll(scrollGeometry).toMatchObject({
      ...originalGeometry,
      overflow: true,
      clearance: true,
      edges: 0,
    })
    await today.press(direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft')
    await expect(month).toBeFocused()
    await expect(month).toBeChecked()
    await expect.poll(choiceVisible).toBe(true)
    await setWidth(155)
    await expect.poll(choiceVisible).toBe(true)
    await expect(month).toBeFocused()
    await expect(month).toBeChecked()

    await scroll.evaluate((element) => {
      element.scrollLeft = 0
    })
    await expect.poll(choiceVisible).toBe(false)
    await expect(month).toBeFocused()
    await setWidth(480)
    await expect.poll(scrollGeometry).toMatchObject({
      ...originalGeometry,
      overflow: false,
      reservedSpace: 0,
    })

    await page.evaluate(() => {
      ;(window as any).segmentedExample.state.monthLabel =
        'Choose all transactions entered during this calendar month'
    })
    await expect.poll(scrollGeometry).toMatchObject({
      ...originalGeometry,
      overflow: true,
      clearance: true,
    })
    await expect(
      group.getByRole('radio', {
        name: 'Choose all transactions entered during this calendar month',
      }),
    ).toBeChecked()
  })
}
