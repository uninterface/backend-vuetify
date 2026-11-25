import { expect, test, type Locator } from '@playwright/test'
import { createBrowserFixture } from '@uninterface/testing/fixture-build'
import { createUiTest } from '@uninterface/testing/playwright'
import { build } from './fixture-build.mjs'
import { uiTestAdapter } from './index'

const openFixture = createBrowserFixture(
  build,
  new URL('./fixtures/collection-browser.ts', import.meta.url),
)

async function headerGeometry(table: Locator) {
  return table.locator('thead th').evaluateAll((cells) =>
    cells
      .filter((cell) => cell.querySelector('.v-data-table-header__content'))
      .map((cell) => {
        const content = cell.querySelector<HTMLElement>(
          '.v-data-table-header__content',
        )!
        const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT)
        let text: DOMRect | undefined
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.textContent?.trim()) continue
          const range = document.createRange()
          range.selectNodeContents(node)
          text = range.getBoundingClientRect()
          break
        }
        const controls = [
          ...content.querySelectorAll<HTMLElement>(
            '.v-data-table-header__sort-icon, [data-ui-sort-priority], button',
          ),
        ]
        const contentStyle = getComputedStyle(content)
        const cellStyle = getComputedStyle(cell)
        const contentBox = content.getBoundingClientRect()
        const cellBox = cell.getBoundingClientRect()
        return {
          label: cell.textContent?.trim(),
          display: contentStyle.display,
          flexDirection: contentStyle.flexDirection,
          direction: contentStyle.direction,
          textX: text!.left + text!.width / 2,
          alignment: cellStyle.textAlign,
          rightGap:
            cellBox.right -
            parseFloat(cellStyle.paddingRight) -
            contentBox.right,
          height: cell.getBoundingClientRect().height,
          textY: text!.top + text!.height / 2,
          controls: controls.map((node) => {
            const r = node.getBoundingClientRect()
            const parent = cell.getBoundingClientRect()
            return {
              x: r.left + r.width / 2,
              y: r.top + r.height / 2,
              inside: r.left >= parent.left && r.right <= parent.right,
            }
          }),
        }
      }),
  )
}

for (const scenario of [
  { direction: 'ltr', theme: 'light' },
  { direction: 'rtl', theme: 'dark' },
]) {
  test(`Vuetify KI-050 header alignment and height ${scenario.direction}/${scenario.theme}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 1600, height: 1100 })
    await openFixture(page, { dir: scenario.direction, theme: scenario.theme })
    const table = page.getByRole('table', { name: 'Orders', exact: true })
    const ui = createUiTest(page, uiTestAdapter)
    const headers = ui.columnHeaders(table)
    const amount = headers.filter({ hasText: 'Amount (USD)' })
    const customer = headers.filter({ hasText: 'Customer' })
    const { sortTarget: amountSort } = await ui.columnHeader(amount).parts()
    const { sortTarget: customerSort } = await ui.columnHeader(customer).parts()
    const initialHeight = (await table.locator('thead').boundingBox())!.height
    await amountSort.focus()
    await page.keyboard.press('Enter')
    await expect(table).toHaveAttribute('aria-busy', 'false')
    await customerSort.focus()
    await page.keyboard.press('Enter')
    await expect(table).toHaveAttribute('aria-busy', 'false')
    await expect(table.locator('[data-ui-sort-priority]')).toHaveText([
      '2',
      '1',
    ])
    await table
      .locator('thead')
      .screenshot({ path: info.outputPath('multisort.png') })
    await info.attach('header-geometry.json', {
      contentType: 'application/json',
      body: JSON.stringify(await headerGeometry(table), null, 2),
    })
    const check = async () => {
      const geometry = await headerGeometry(table)
      for (const cell of geometry) {
        expect(cell.flexDirection, cell.label).toBe('row')
        const positions = [
          cell.textX,
          ...cell.controls.map((control) => control.x),
        ]
        const sign = cell.direction === 'rtl' ? -1 : 1
        for (let i = 1; i < positions.length; i++)
          expect(
            sign * (positions[i] - positions[i - 1]),
            cell.label,
          ).toBeGreaterThan(0)
        // Explicit physical right alignment still positions the complete group.
        if (cell.alignment === 'right')
          expect(Math.abs(cell.rightGap), cell.label).toBeLessThan(1)
        for (const control of cell.controls) {
          expect(Math.abs(control.y - cell.textY), cell.label).toBeLessThan(4)
          expect(control.inside, cell.label).toBe(true)
        }
      }
      expect(
        Math.max(...geometry.map((c) => c.textY)) -
          Math.min(...geometry.map((c) => c.textY)),
      ).toBeLessThan(1)
      expect(
        Math.abs(
          (await table.locator('thead').boundingBox())!.height - initialHeight,
        ),
      ).toBeLessThan(1)
    }
    await check()
    const priority = amount.getByRole('button', {
      name: 'Amount (USD): Sort priority',
      exact: true,
    })
    const filter = amount.locator('[data-ui-column-filter]')
    const amountResize = amount.locator('[data-column-resize="amount"]')
    await amountSort.focus()
    await page.keyboard.press('Tab')
    await expect(priority).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(filter).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(amountResize).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(filter).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(priority).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(amountSort).toBeFocused()
    await priority.click()
    await page
      .getByRole('menuitem', { name: 'Move later', exact: true })
      .click()
    await expect(table).toHaveAttribute('aria-busy', 'false')
    await expect(priority).toHaveAttribute('aria-expanded', 'false')
    await expect(priority).toBeFocused()
    await check()
    await filter.focus()
    await expect(filter).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(
      page.getByRole('textbox', { name: 'Minimum amount (USD)', exact: true }),
    ).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(filter).toBeFocused()
    await page.setViewportSize({ width: 600, height: 800 })
    await customer.scrollIntoViewIfNeeded()
    const resize = customer.locator('[data-column-resize="customer"]')
    await resize.focus()
    await page.keyboard.press('End')
    await page.keyboard.press('Home')
    await check()
    await page.locator('[data-ui-collection-reset]').click()
    await expect(table.locator('[data-ui-sort-priority]')).toHaveCount(0)
    await check()
    await table
      .locator('thead')
      .screenshot({ path: info.outputPath('narrow-reset.png') })
  })

  test(`Vuetify KI-051 visible drop boundaries ${scenario.direction}/${scenario.theme}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 1600, height: 1100 })
    await openFixture(page, { dir: scenario.direction, theme: scenario.theme })
    const table = page.getByRole('table', { name: 'Orders', exact: true })
    await table
      .locator('[data-ui-column-filter][aria-label^="Filter Amount"]')
      .click()
    await page
      .getByRole('textbox', { name: 'Minimum amount (USD)', exact: true })
      .fill('125')
    await page
      .getByRole('textbox', { name: 'Maximum amount (USD)', exact: true })
      .fill('250')
    await page
      .getByRole('button', { name: 'Apply amount range', exact: true })
      .click()
    await page.getByRole('button', { name: 'Show cards' }).click()
    await page.setViewportSize({ width: 390, height: 1000 })
    const header = page.locator('[data-ui-collection-header]')
    await header.locator('[data-ui-collection-query-toggle="sort"]').click()
    for (const name of ['Customer', 'Amount (USD)', 'Order']) {
      await header
        .getByRole('button', { name: 'Add sort', exact: true })
        .click()
      await page.getByRole('menuitem', { name, exact: true }).click()
    }
    await header
      .locator(
        '[data-ui-collection-sort-rule="amount"] [data-ui-sort-direction]',
      )
      .click()
    await page.setViewportSize({ width: 1600, height: 1100 })
    const group = header.locator('[data-ui-collection-sort-badges]')
    const badge = (key: string) =>
      group.locator(`[data-ui-sort-badge="${key}"]`)
    const body = (key: string) => badge(key).locator('[data-ui-sort-reorder]')
    const order = () =>
      group
        .locator('[data-ui-sort-badge]')
        .evaluateAll((nodes) =>
          nodes.map((n) => n.getAttribute('data-ui-sort-badge')),
        )
    const drag = async (
      from: string,
      target: string,
      side: 'before' | 'after',
    ) => {
      await group.scrollIntoViewIfNeeded()
      const scrollOverflow = () =>
        group.evaluate((node) => {
          const extents = []
          for (
            let parent: HTMLElement | null =
              node instanceof HTMLElement ? node : node.parentElement;
            parent;
            parent = parent.parentElement
          ) {
            const style = getComputedStyle(parent)
            if (
              parent !== document.scrollingElement &&
              ![style.overflowX, style.overflowY].some((value) =>
                ['auto', 'scroll'].includes(value),
              )
            )
              continue
            extents.push([
              Math.max(0, parent.scrollWidth - parent.clientWidth),
              Math.max(0, parent.scrollHeight - parent.clientHeight),
            ])
          }
          return extents
        })
      const beforeOverflow = await scrollOverflow()
      const a = (await body(from).boundingBox())!,
        b = (await badge(target).boundingBox())!
      const left = (side === 'before') === (scenario.direction === 'ltr')
      await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
      await page.mouse.down()
      await page.mouse.move(
        left ? b.x + 5 : b.x + b.width - 5,
        b.y + b.height / 2,
        { steps: 12 },
      )
      await expect(badge(target)).toHaveAttribute('data-ui-sort-drop', side)
      const marker = await badge(target).evaluate((node) => {
        const host = node.parentElement!
        const pseudo = getComputedStyle(host, '::after'),
          root = getComputedStyle(node),
          r = host.getBoundingClientRect(),
          chip = node.getBoundingClientRect()
        const x = r.left + parseFloat(pseudo.left),
          width = parseFloat(pseudo.width),
          top = r.top + parseFloat(pseudo.top),
          bottom = r.bottom - parseFloat(pseudo.bottom)
        // Accumulate actual ancestor clipping: an external marker must survive
        // every scroll/clip boundary above its owner, including wrapped rows.
        let left = x,
          right = x + width
        for (
          let ancestor: HTMLElement | null = host;
          ancestor;
          ancestor = ancestor.parentElement
        ) {
          if (getComputedStyle(ancestor).overflowX === 'visible') continue
          const bounds = ancestor.getBoundingClientRect()
          left = Math.max(left, bounds.left)
          right = Math.min(right, bounds.right)
        }
        return {
          width,
          visibleWidth: Math.max(0, right - left),
          outsideChip: x + width <= chip.left || x >= chip.right,
          onLeft: x + width <= chip.left,
          chipClipping: root.overflowX,
          targetShadow: root.boxShadow,
          targetOutline: root.outlineStyle,
          rect: { x, y: top, width, height: bottom - top },
          color: pseudo.backgroundColor,
          opacity: pseudo.opacity,
        }
      })
      await info.attach(`${from}-${target}-${side}-marker.json`, {
        contentType: 'application/json',
        body: JSON.stringify(marker),
      })
      await page.screenshot({
        path: info.outputPath(`${from}-${target}-${side}.png`),
      })
      expect(marker.visibleWidth).toBeGreaterThanOrEqual(3)
      expect(marker.outsideChip).toBe(true)
      expect(marker.onLeft).toBe(left)
      expect(marker.chipClipping).toBe('hidden')
      expect(marker.targetShadow).toBe('none')
      expect(marker.targetOutline).toBe('none')
      expect(marker.color).not.toBe('rgba(0, 0, 0, 0)')
      expect(marker.opacity).toBe('1')
      expect(marker.rect.height).toBeGreaterThan(0)
      // Drag preview must not move or resize any badge.
      const unchanged = (await badge(target).boundingBox())!
      expect(unchanged).toEqual(b)
      expect(await scrollOverflow()).toEqual(beforeOverflow)
    }
    await drag('id', 'customer', 'before')
    expect(await order()).toEqual(['customer', 'amount', 'id'])
    await page.keyboard.press('Escape')
    await page.mouse.up()
    await expect(group.locator('[data-ui-sort-drop]')).toHaveCount(0)
    await drag('customer', 'id', 'after')
    await page.mouse.up()
    await expect.poll(order).toEqual(['amount', 'id', 'customer'])
    await expect(body('customer')).toBeFocused()
    await expect(badge('amount')).toHaveAttribute(
      'data-ui-sort-direction',
      'desc',
    )
    await expect(
      header.locator('[data-ui-filter-badge="amount"]'),
    ).toBeVisible()
    await expect(group.locator('[data-ui-sort-drop]')).toHaveCount(0)
    await header.evaluate((node) => {
      node.style.width = '280px'
    })
    await expect
      .poll(async () => (await group.boundingBox())!.width)
      .toBeLessThan(300)
    await drag('customer', 'amount', 'before')
    await page.mouse.up()
    await expect.poll(order).toEqual(['customer', 'amount', 'id'])
    const a = (await body('customer').boundingBox())!
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
    await page.mouse.down()
    await page.mouse.move(5, 5, { steps: 10 })
    await expect(group.locator('[data-ui-sort-drop]')).toHaveCount(0)
    await page.mouse.up()
    expect(await order()).toEqual(['customer', 'amount', 'id'])
  })
}
