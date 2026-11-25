import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { posix } from 'node:path'

const root = new URL('../', import.meta.url)
const distribution = new URL('dist/package/', root)
const readJson = (url) => JSON.parse(readFileSync(url, 'utf8'))
const source = readJson(new URL('package.json', root))
const manifest = readJson(new URL('package.json', distribution))
const [pack] = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const files = new Set(pack.files.map(({ path }) => path))

assert.equal(pack.name, source.name)
assert.equal(pack.version, source.version)
assert.equal(manifest.private, undefined)
assert.equal(manifest.publishConfig.access, 'public')
assert.equal(manifest.devDependencies, undefined)
assert.equal(manifest.overrides, undefined)
assert.deepEqual(Object.keys(manifest.exports), Object.keys(source.exports))
assert.equal(manifest.dependencies['@uninterface/uninterface'], undefined)
assert.equal(manifest.dependencies.vue, undefined)
assert.equal(manifest.dependencies['@uninterface/testing'], undefined)
assert.deepEqual(manifest.dependencies, source.dependencies)
assert.ok(manifest.peerDependencies['@uninterface/uninterface'])
assert.ok(manifest.peerDependencies.vue)
assert.equal(
  manifest.peerDependenciesMeta['@uninterface/testing'].optional,
  true,
)
for (const version of Object.values({
  ...manifest.dependencies,
  ...manifest.peerDependencies,
})) {
  assert.doesNotMatch(version, /^(workspace|file|link):/)
}

const views = readdirSync(new URL('src/', root))
  .filter((file) => file.endsWith('.vue'))
  .map((file) => file.slice(0, -'.vue'.length))
for (const [name, entry] of Object.entries(manifest.exports)) {
  if (typeof entry === 'string') {
    assert.ok(files.has(entry.slice(2)), `Missing export target ${entry}`)
    continue
  }

  if (name === './vite') {
    assert.ok(files.has(entry.import.slice(2)))
    assert.ok(files.has(entry.types.slice(2)))
    continue
  }
  assert.match(entry.import, /^\.\/esm\/.+\.js$/)
  assert.match(entry.types, /^\.\/types\/.+\.d\.m?ts$/)
  for (const target of [entry.import, entry.types]) {
    for (const path of name.includes('*')
      ? views.map((view) => target.replace('*', view))
      : [target]) {
      assert.ok(files.has(path.slice(2)), `Missing export target ${path}`)
    }
  }
}

for (const path of files) assert.doesNotMatch(path, /^src\//)
const iconPath = 'esm/src/UiIcon.vue.js'
const icon = readFileSync(new URL(iconPath, distribution), 'utf8')
const style = icon.match(/^import "(.*\.css)";/m)?.[1]
assert.ok(style, 'UiIcon keeps its compiled scoped stylesheet import')
assert.ok(files.has(posix.join(posix.dirname(iconPath), style)))

const runtimeFiles = [...files].filter(
  (path) => path.startsWith('esm/src/') && path.endsWith('.js'),
)
const runtime = runtimeFiles.map((path) =>
  readFileSync(new URL(path, distribution), 'utf8'),
)
for (const code of runtime)
  assert.ok(
    !/["']@uninterface\/testing(?:\/|["'])/.test(code),
    'Runtime entries omit Testing',
  )

for (const file of [
  'LICENSE',
  'README.md',
  'package.json',
  'style.css',
  'native-content.css',
  'font.css',
  'font-bundled.css',
  'font-family.css',
  'docs/setup.md',
  'docs/icon-licenses/Apache-2.0.txt',
  'docs/icon-licenses/NOTICE.txt',
  'docs/font-licenses/roboto.txt',
  'docs/font-licenses/noto-sans-sc.txt',
  'docs/font-licenses/noto-sans-tc.txt',
]) {
  assert.ok(files.has(file), `Missing package file ${file}`)
}

console.log(`${pack.name}@${pack.version}: checked ${files.size} packed files`)
