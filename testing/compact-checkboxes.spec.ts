import { test, expect } from '@playwright/test'
import { buildCompactCheckboxes } from './compact-checkboxes-build.mjs'

for (const width of [1100, 390]) {
  test(`compact checkbox fields keep native hit areas and group-like rows at ${width}px`, async ({
    page,
  }) => {
    const fixture = await buildCompactCheckboxes()
    await page.setViewportSize({ width, height: 900 })
    await page.goto('about:blank')
    await page.addStyleTag({ content: fixture.styles })
    await page.addScriptTag({ content: fixture.script })
    await page.evaluate(async () => {
      const host = window as any
      host.compactExample =
        await host.CompactCheckboxes.mountCompactCheckboxes()
    })
    const geometry = () =>
      page.evaluate(() => {
        const root = document.querySelector('[data-case=linear]')!
        const rows = [...root.querySelectorAll('.v-selection-control')]
        const row = rows[0] as HTMLElement
        const input = row.querySelector('input')!
        const second = rows[1].getBoundingClientRect()
        const reference = document.querySelector(
          '[data-case=reference] .v-selection-control',
        )!
        return {
          row: row.getBoundingClientRect().height,
          input: input.getBoundingClientRect().height,
          gap: second.top - row.getBoundingClientRect().bottom,
          reference: reference.getBoundingClientRect().height,
          nested: document
            .querySelector('[data-case=depth-stopped] .v-selection-control')!
            .getBoundingClientRect().height,
        }
      })
    const compact = await geometry()
    expect(compact.row).toBe(compact.reference)
    expect(compact.input).toBe(40)
    expect(compact.gap).toBe(8)
    expect(compact.nested).toBe(56)
    const first = page
      .locator('[data-case=linear]')
      .getByRole('checkbox', { name: 'Disabled', exact: true })
    await first.focus()
    await first.press('Space')
    await expect(first).toBeChecked()
    await page.evaluate(async () => {
      await (window as any).compactExample.update(0)
    })
    const ordinary = await geometry()
    expect(ordinary.row).toBe(56)
    expect(ordinary.input).toBe(compact.input)
    expect(ordinary.gap).toBe(16)
    await expect(first).toBeFocused()
    await page.evaluate(async () => {
      await (window as any).compactExample.update(-1)
      await (window as any).compactExample.validate()
    })
    await expect(
      page.locator('[data-case=linear]').getByText('Enable this setting'),
    ).toBeVisible()
    expect((await geometry()).row).toBe(compact.row)
    await expect(first).toBeChecked()
  })
}
