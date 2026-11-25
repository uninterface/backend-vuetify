import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { build } from './fixture-build.mjs'
import { installDomEnvironment } from '@uninterface/testing/jsdom'

test('Vuetify date wishes and range modes preserve values, language and endpoint positions', async () => {
  const result = await build({
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('./temporal-presentation-fixture.ts', import.meta.url),
        ),
        formats: ['iife'],
        name: 'TemporalPresentation',
      },
    },
  })
  const code = (Array.isArray(result) ? result : [result])
    .flatMap((r) => r.output)
    .find((r) => r.type === 'chunk').code
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  let demo
  try {
    installDomEnvironment(dom.window)
    dom.window.eval(code)
    demo = await dom.window.TemporalPresentation.mount()
    const doc = dom.window.document
    const section = (name) => demo.host.querySelector(`[data-case=${name}]`)
    const input = (name) => section(name).querySelector('input')
    // JSDOM does not load package CSS imports. Exercise the actual adapter
    // selectors against native rendered fields; browser coverage loads all CSS.
    const stylesheet = doc.createElement('style')
    stylesheet.textContent = readFileSync(
      new URL('../src/style.css', import.meta.url),
      'utf8',
    ).replace(/^@import[^;]+;\s*/gm, '')
    doc.head.append(stylesheet)
    for (const name of ['range', 'datetimeRange', 'timeRange']) {
      const outer = section(name).querySelector('.vuetify-input-frame')
      const parts = section(name).querySelectorAll(
        '[data-ui-control-frame=parent] > .v-input__control > .v-field',
      )
      assert.equal(parts.length, 2)
      for (const part of parts) {
        assert.ok(part.classList.contains('v-field--variant-plain'))
        for (const selector of ['.v-field__overlay', '.v-field__outline']) {
          const decoration = part.querySelector(':scope > ' + selector)
          assert.ok(
            decoration.matches('.v-field--variant-filled ' + selector),
            'native ancestor decoration selector reaches the plain endpoint',
          )
          assert.equal(dom.window.getComputedStyle(decoration).display, 'none')
          assert.notEqual(
            dom.window.getComputedStyle(
              outer.querySelector(':scope > ' + selector),
            ).display,
            'none',
            'outer frame retains its native decoration',
          )
        }
      }
    }
    const edit = async (el, value) => {
      el.focus()
      el.value = value
      el.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
      await demo.tick()
    }
    const mode = async (name, value) => {
      const trigger = section(name).querySelector('[data-temporal-mode]')
      assert.equal(trigger.tagName, 'BUTTON')
      trigger.click()
      await demo.tick()
      const items = [...doc.querySelectorAll('[data-temporal-mode-value]')]
      assert.equal(items.length, 4)
      assert.ok(
        items.every((el) => el.querySelector('[data-temporal-mode-icon]')),
      )
      assert.ok(
        section(name).querySelector('[data-engaged]'),
        'menu retains shared frame engagement',
      )
      const target = items.find((el) => el.dataset.temporalModeValue === value)
      if (value === 'end') {
        target.focus()
        target.dispatchEvent(
          new dom.window.KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true,
            cancelable: true,
          }),
        )
      } else target.click()
      await demo.tick()
    }
    const formats = [
      [undefined, '2026-03-02'],
      ['DMY', '02/03/2026'],
      ['MDY', '03/02/2026'],
      ['YMD', '2026-03-02'],
    ]
    let calendarText
    for (const [format, date] of formats) {
      await demo.format(format)
      assert.equal(input('date').value, date)
      assert.equal(input('datetime').value, date + ' 09:05')
      assert.equal(input('range').value, date)
      assert.equal(input('datetimeRange').value, date + ' 09:05')
      assert.equal(input('time').value, '09:05')
      assert.equal(demo.controls.date.field.state.input, '2026-03-02')
      assert.equal(input('independent').value, '03/02/2026')
      assert.equal(
        demo.host.querySelector('[date-format-wish], [dateformatwish]'),
        null,
      )
      section('datetime').querySelector('[data-temporal-trigger]').click()
      await demo.tick()
      const popup = doc.querySelector('[data-temporal-popup]')
      assert.ok(popup)
      assert.equal(
        popup.querySelector('.v-card-actions'),
        null,
        'no added Close footer',
      )
      const text = popup.querySelector('.v-date-picker-controls').textContent
      if (calendarText)
        assert.equal(
          text,
          calendarText,
          'date order does not change calendar language',
        )
      calendarText = text
      popup.dispatchEvent(
        new dom.window.KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
        }),
      )
      await demo.tick()
      doc.activeElement.blur()
      await demo.tick()
    }
    assert.match(calendarText, /年|月/)
    // Ordinary keyboard text must work for scalar and both range endpoints.
    for (const [format, date, endDate] of [
      ['YMD', '2026-03-02', '2026-03-04'],
      ['DMY', '02/03/2026', '04/03/2026'],
      ['MDY', '03/02/2026', '03/04/2026'],
    ]) {
      await demo.format(format)
      await edit(input('datetime'), '  ' + date + '   10 : 15 : 32.123  ')
      input('datetime').blur()
      await demo.tick()
      assert.equal(demo.controls.datetime.field.state.input, '2026-03-02T10:15')
      assert.equal(await demo.controls.datetime.field.validate(), true)
      assert.equal(input('datetime').value, date + ' 10:15')
      const endpoints = [...section('datetimeRange').querySelectorAll('input')]
      await edit(endpoints[0], ' ' + date + '  10:15:32  ')
      await edit(endpoints[1], endDate + '\t 18:30:59.999 ')
      endpoints[1].blur()
      await demo.tick()
      assert.equal(
        JSON.stringify(demo.controls.datetimeRange.field.state.input),
        JSON.stringify({
          start: '2026-03-02T10:15',
          end: '2026-03-04T18:30',
        }),
      )
      assert.equal(await demo.controls.datetimeRange.field.validate(), true)
      assert.equal(endpoints[0].value, date + ' 10:15')
      assert.equal(endpoints[1].value, endDate + ' 18:30')
      demo.controls.datetime.field.reset()
      demo.controls.datetimeRange.field.reset()
      await demo.tick()
    }

    for (const name of ['range', 'datetimeRange', 'timeRange']) {
      const before = JSON.stringify(demo.controls[name].field.state.input)
      for (const [value, count, openSide] of [
        ['start', 1, 'end'],
        ['end', 1, 'start'],
        ['unrestricted', 2, null],
        ['bounded', 0, null],
      ]) {
        await mode(name, value)
        const frame = section(name).querySelector('[data-temporal-range]')
        assert.equal(
          frame.querySelectorAll('[data-temporal-infinity]').length,
          count,
          `${name} ${value}: ${JSON.stringify(demo.controls[name].field.state.input)}; ${demo.errors.join('; ')}`,
        )
        assert.equal(
          frame.querySelectorAll('[data-temporal-separator]').length,
          1,
        )
        assert.equal(frame.querySelectorAll('input').length, 2 - count)
        assert.equal(frame.querySelectorAll('[data-temporal-side]').length, 2)
        if (openSide)
          assert.ok(
            frame.querySelector(
              `[data-temporal-side=${openSide}] [data-temporal-infinity]`,
            ),
          )
      }
      assert.equal(
        JSON.stringify(demo.controls[name].field.state.input),
        before,
        'mode switching restores endpoint drafts',
      )
    }
    assert.ok(
      section('datetimeRange').querySelector(
        '.vuetify-temporal-part input.v-field__input',
      ),
      'content-width selector targets the rendered native input',
    )
    const marker = section('timeRange').querySelector(
      '[data-temporal-next-day]',
    )
    assert.ok(marker.querySelector('svg'))
    assert.equal(marker.textContent.trim(), '')
    assert.ok(marker.getAttribute('aria-label'))
    assert.notEqual(marker.style.visibility, 'hidden')
    await demo.controls.timeRange.field.set({ start: '09:00', end: '17:00' })
    await demo.tick()
    assert.equal(marker.style.visibility, 'hidden')
    await demo.format('MDY')
    await edit(input('text'), '03/04/2026 09:05:12.345')
    await demo.format('DMY')
    assert.equal(
      input('text').value,
      '03/04/2026 09:05:12.345',
      'format change retains focused draft',
    )
    await edit(input('text'), '03/06/2026 09:05:12.345')
    assert.equal(
      demo.controls.text.field.state.input,
      '2026-03-06T09:05:12.345',
    )
    input('text').blur()
    await demo.tick()
    assert.equal(input('text').value, '06/03/2026 09:05:12.345')
    await edit(input('date'), '31/02/2026')
    input('date').blur()
    await demo.tick()
    assert.equal(await demo.controls.date.field.validate(), false)
    assert.equal(input('date').value, '2026-02-31')
    for (const [format, date] of [
      ['YMD', '0007-03-02'],
      ['DMY', '02/03/0007'],
      ['MDY', '03/02/0007'],
    ]) {
      await demo.format(format)
      await demo.controls.date.field.set('0007-03-02')
      await demo.tick()
      assert.equal(input('date').value, date)
    }
    await demo.readonly(true)
    assert.ok(input('date').readOnly)
    assert.ok(section('range').querySelector('[data-temporal-mode]').disabled)
    await demo.readonly(false)
    await demo.disabled(true)
    assert.ok(input('date').disabled)
    assert.ok(section('range').querySelector('[data-temporal-mode]').disabled)
    await demo.disabled(false)
    await demo.language('en')
    demo.controls.date.field.reset()
    await demo.tick()
    section('date').querySelector('[data-temporal-trigger]').click()
    await demo.tick()
    assert.match(doc.querySelector('[data-temporal-popup]').textContent, /Mar/)
    assert.equal(input('date').value, '03/02/2026')
    assert.deepEqual(Array.from(demo.errors), [])
  } finally {
    demo?.dispose()
    dom.window.close()
  }
})
