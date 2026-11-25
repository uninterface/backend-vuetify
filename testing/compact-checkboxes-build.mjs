import { fileURLToPath } from 'node:url'
import { build } from './fixture-build.mjs'

export async function buildCompactCheckboxes() {
  const result = await build({
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"', 'process.env': '{}' },
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(
          new URL('./fixtures/compact-checkboxes.ts', import.meta.url),
        ),
        formats: ['iife'],
        name: 'CompactCheckboxes',
      },
    },
  })
  const output = (Array.isArray(result) ? result : [result]).flatMap(
    (entry) => entry.output,
  )
  return {
    script: output.find((entry) => entry.type === 'chunk').code,
    styles: output
      .filter(
        (entry) => entry.type === 'asset' && entry.fileName.endsWith('.css'),
      )
      .map((entry) => String(entry.source))
      .join('\n'),
  }
}
