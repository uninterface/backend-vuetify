import { execFileSync } from 'node:child_process'
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { posix } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { build } from 'vite'

const root = new URL('../', import.meta.url)
const source = new URL('src/', root)
const destination = new URL('dist/package/', root)
const manifest = JSON.parse(await readFile(new URL('package.json', root)))
const {
  private: sourceOnly,
  scripts,
  devDependencies,
  overrides,
  uninterface,
  ...distribution
} = manifest
const exports = { ...manifest.exports }
const entries = {}
for (const [name, target] of Object.entries(manifest.exports)) {
  if (!/^\.\/(src|testing)\//.test(target)) continue
  const path = target.slice('./'.length)
  if (path.endsWith('.css')) {
    exports[name] = `./${posix.basename(path)}`
    continue
  }

  const module = path.replace(/\.(ts|mjs)$/, '')
  exports[name] = {
    types: `./types/${module}${path.endsWith('.mjs') ? '.d.mts' : '.d.ts'}`,
    import: `./esm/${module}.js`,
  }
  if (!module.includes('*')) {
    entries[module] = fileURLToPath(new URL(path, root))
    continue
  }

  // Compile each public view as an independent entry for static imports.
  for (const file of await readdir(source)) {
    if (file.endsWith('.vue')) {
      entries[`src/${file}`] = fileURLToPath(new URL(file, source))
    }
  }
}

await rm(destination, { force: true, recursive: true })
await build({
  root: fileURLToPath(root),
  configFile: false,
  plugins: [
    vue(),
    {
      name: 'uninterface-component-styles',
      // Keep scoped styles attached to their components after Vite extracts them.
      generateBundle: {
        order: 'post',
        handler(_options, bundle) {
          for (const chunk of Object.values(bundle)) {
            if (chunk.type !== 'chunk') continue
            for (const asset of chunk.viteMetadata?.importedCss ?? []) {
              const relativeAsset = posix.relative(
                posix.dirname(chunk.fileName),
                asset,
              )
              const specifier = relativeAsset.startsWith('.')
                ? relativeAsset
                : `./${relativeAsset}`
              chunk.code = `import ${JSON.stringify(specifier)};\n${chunk.code}`
            }
          }
        },
      },
    },
  ],
  logLevel: 'warn',
  build: {
    outDir: fileURLToPath(new URL('esm/', destination)),
    lib: { entry: entries, formats: ['es'] },
    cssCodeSplit: true,
    minify: false,
    rollupOptions: {
      // Keep toolkit imports and consumer-generated virtual modules in the app's graph.
      external: (id) =>
        !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0'),
      output: {
        preserveModules: true,
        preserveModulesRoot: fileURLToPath(root),
        entryFileNames: '[name].js',
      },
    },
  },
})

execFileSync(
  process.execPath,
  [
    fileURLToPath(import.meta.resolve('vue-tsc/bin/vue-tsc.js')),
    '-p',
    fileURLToPath(new URL('tsconfig.json', root)),
  ],
  { stdio: 'inherit' },
)

await mkdir(new URL('types/testing/', destination), { recursive: true })
for (const file of ['dom.d.mts', 'presentation-parts.d.mts']) {
  await cp(
    new URL(`testing/${file}`, root),
    new URL(`types/testing/${file}`, destination),
  )
}
for (const path of ['README.md', 'LICENSE', 'capabilities.json', 'docs']) {
  await cp(new URL(path, root), new URL(path, destination), { recursive: true })
}
for (const file of await readdir(source)) {
  if (file.endsWith('.css')) {
    await cp(new URL(file, source), new URL(file, destination))
  }
}
distribution.files = ['esm/', 'types/', '*.css', 'capabilities.json', 'docs/']
distribution.exports = exports
distribution.publishConfig = { access: 'public' }
await writeFile(
  new URL('package.json', destination),
  `${JSON.stringify(distribution, null, 2)}\n`,
)
