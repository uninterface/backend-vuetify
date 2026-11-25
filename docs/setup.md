# Set up the Vuetify backend

This guide owns the application integration requirements for `@uninterface/backend-vuetify`. Business components use `@uninterface/uninterface`; toolkit configuration stays at application assembly.

## Requirements

Use Vue compatible with core's `^3.5.43` peer dependency, Vue-aware TypeScript checking, and Vite with `@vitejs/plugin-vue`. Keep one runtime copy of Vue and core.

## Select the backend

The release package ships compiled ES modules and TypeScript declarations.
Install `@uninterface/backend-vuetify` under the alias `@uninterface/backend`.

```sh
npm install @uninterface/uninterface @uninterface/backend@npm:@uninterface/backend-vuetify@4.2.0-alpha1
```

Choose a Core version that satisfies the selected backend release's peer dependency.

Use TypeScript's `Bundler` module resolution to resolve the package's type
exports. See [package build](package-build.md) for a source checkout.

## Configure Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: { dedupe: ['vue', '@uninterface/uninterface'] },
})
```

## Initialize the application

```ts
// src/main.ts
import { createUiApplication } from '@uninterface/uninterface/setup'
import '@uninterface/backend/font.css'
import '@uninterface/backend/style.css'
import App from './App.vue'

const app = createUiApplication(App, { document })
await app.ui.ready
app.mount('#app')
```

The required `./integration` export is a descriptor consumed automatically by createUiApplication. It creates the native Vuetify plugin and locale context, enabling Vuetify SSR mode when core creates an SSR/hydration application; do not pass the descriptor to app.use or install a second toolkit plugin. No backend Vite plugin is needed. The adapter declares Vuetify 4.2.5 as its dependency. Setup installs toolkit theme, locale, display and SVG icon services without globally registering components. Views import individual toolkit components, and built-in SVG icons require no icon-font download. The stylesheet imports Vuetify's full styles, including global effects. No extra VApp wrapper or VForm validation engine is required for Uninterface components. The integration synchronizes native language resources and theme appearance with core services.

The integration descriptor is loaded by core through the selected alias; business components need no backend imports. Import the stylesheet once. The top-level `document` option grants ownership of document language attributes; omit it for an embedded application. Await readiness before mounting. For SSR/hydration, supply the same explicit `idPrefix` on both sides, create a fresh application per request and call `app.ui.dispose()` in `finally`. The core application-isolation guide defines the verified editing baseline and request-owned business-session cleanup.

Create a minimal `App.vue` to verify the configured application:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { UiApp, UiButton, UiContent } from '@uninterface/uninterface'

const acknowledged = ref(false)
</script>

<template>
  <UiApp>
    <UiContent>
      <h1>Application ready</h1>
      <UiButton
        :disabled="acknowledged"
        @click="acknowledged = true"
      >
        Acknowledge
      </UiButton>
      <p v-if="acknowledged" role="status">Acknowledged.</p>
    </UiContent>
  </UiApp>
</template>
```

Mount into the existing Vue application's `#app` element. Use its configured Vite and Vue type-check commands to build/check the source. Confirm that the button responds, becomes disabled and displays the status. This verifies a basic interaction, not every backend capability or browser.

## Scope and verification

The [presentation reference](presentation.md) documents native mappings and limitations; [exports](exports.md) documents assembly modules. Capability declarations describe supported contracts; they do not certify accessibility. Browser keyboard, focus, popup, contrast and scrolling checks remain necessary in addition to builds and DOM simulation.

## Localization and icons

Use `createUiApplication` to install this backend's `integration` alongside core resources. Do not separately install a native toolkit plugin. Core's application-localization service owns language selection and synchronizes the native resources supplied by this backend.

The initial full message set is English, Simplified Chinese, Traditional Chinese and Arabic. The integration declares native resource aliases; core exposes the effective native locale through `app.ui.i18n.state.value.resolved.backend`. Additional native resources can be supplied by extending the selected integration at assembly through the `backend` option; core/business components need no backend-name branch. Additional languages and full RTL require acceptance before support claims.

The catalogue supplies 58 semantic icon names. Application overrides affect UiIcon and menu entry icons; native internal glyphs retain their toolkit defaults. Assets are bundled locally without an external icon service. See [icon license](icon-licenses/Apache-2.0.txt) and [notice](icon-licenses/NOTICE.txt) for its bundled Material Design Icons subset.

Arabic (`ar`, العربية) uses script-derived RTL direction. The integration lazily loads the toolkit’s native Arabic pack. Some upstream native strings may remain untranslated. `resolved.backend` reports `ar`, including for compatible regional requests. Message and direction support do not certify full RTL layout or browser acceptance.

Request a language through the installed service; do not install another native locale manager:

```ts
await app.ui.i18n.setLocale('zh-Hans')
```

Register your own headings, field labels and business messages through `i18n.resources` at createUiApplication setup. Core/native packs translate library-owned text, not arbitrary strings in your application. Resource failures retain the previous language; handle the rejected request. Additional catalogue definitions use the setup `icons` option. Exact resource and icon contracts are documented by `@uninterface/uninterface` under `docs/guides/localization-and-icons.md`.

## Color mode

This backend declares `theme.color-mode.v1`. Configure `createUiApplication(App, { colorMode: { document } })` to own the document's appearance; optional `preference` selects light, dark or system and optional `storageKey` enables persistence. Omit ownership in embedded apps to inherit the host. The native document selector is `class="v-theme--light"` or `class="v-theme--dark"`; without a host selector, ordinary appearance follows the system. Do not install a competing preference controller. SSR must emit the selector matching the initial resolved mode before hydration. Both ordinary content and popups must receive the same theme.

## Customize presentation

See [customization](customization.md) for supported application-owned styling,
native configuration possibilities and adapter limitations.

See [strategy support](strategies.md) for optional regional preferences, control-size mappings and unsupported values.

Server fields initially use external labels/feedback; native integrated presentation takes over after mount without replacing the editor or duplicating IDs. The verified baseline covers text/multiline fields, checkbox, form actions, icons and explicit locale/mode. It does not establish open-overlay or general selection SSR support.

## Typography: fonts first, backend styles second

| Choice | First import: fonts |
|---|---|
| **Backend default · Network** (recommended starting setup) | `@uninterface/backend/font.css` |
| **Backend default · Bundled** | `@uninterface/backend/font-bundled.css` |
| **Uninterface default · Network** | `@uninterface/fonts/font.css` |
| **Uninterface default · Bundled** | `@uninterface/fonts/font-bundled.css` |

Import one selected font entry before the stable `@uninterface/backend/style.css`, as shown in the setup example. The Uninterface choices require the optional `@uninterface/fonts` package. Omitting the font import uses system fonts without downloads. See [typography and fonts](typography.md) for installation, CSP, deployment, language coverage and verification steps.

[Native HTML content defaults](native-html.md): supported element baseline, toolkit mappings, setup, spacing and verification limits.


### Common icon assets

The common catalogue supplies 58 semantic names with independent override keys. The artwork includes Material Design Icons from `@iconify-json/mdi` 1.2.3. Setup imports the catalogue as local Vue components. Applications should budget for the whole catalogue in the bundle. Native internal glyphs are separate from the override catalogue. For semantic names and overrides, see `docs/api/constants/uiIconNames.md` and `docs/guides/localization-and-icons.md` in the Core package. See [asset sources and mappings](icon-licenses/SOURCES.md).
