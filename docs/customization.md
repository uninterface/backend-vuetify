# Customize the Vuetify backend

[Documentation index](README.md) · [Application setup](setup.md)

This adapter uses Vuetify 4.2.5. Vuetify has extensive theme and defaults APIs,
but the adapter does not currently expose their configuration through a factory.
Distinguish native possibilities from the simple path available here.

## One application stylesheet for typography

Create `src/ui.theme.css`:

```css
@import '@uninterface/backend/style.css';

:root {
  --uninterface-font-family: system-ui, sans-serif;
}
```

Replace the direct backend stylesheet import in `src/main.ts` with
`import './ui.theme.css'`. Keep application initialization unchanged. Import
core's stylesheet separately if using core styling utilities. The font override
is translated into native Vuetify font tokens; custom font families require
explicitly supplied font assets. Check document content and popup typography.

## Native possibilities and current limits

Vuetify's `createVuetify` supports named themes, light/dark palettes, foreground
colors, theme variables, component defaults and blueprints. Native component
props/defaults can control density, size and rounding; Sass supports additional
typography and spacing configuration.

The adapter already creates the native plugin with its required icon and locale
integration. It does not accept application theme/defaults options. Do not install
a second Vuetify plugin or copy the integration implementation as an ordinary
theme customization recipe. Full native palette/defaults configuration needs an
adapter configuration entry point before it has a supported simple workflow.

Setting raw `--v-theme-*` variables on `:root` is not equivalent to registering a
Vuetify theme: native theme classes can redeclare those variables on surfaces,
and foreground colors and related values must remain coordinated. There is no
supported complete-palette CSS recipe in this guide.

The adapter explicitly supplies some native props to fulfill Uninterface rules,
including explicit button presentation. Native defaults must not replace
those explicit meanings or re-enable native form validation.

Layout separation uses native `ga-4`; some adapter parts have their own fixed
spacing. Native density is not an application-wide spacing scale. The stylesheet
imports compiled `vuetify/styles`; configuring Sass cannot change that already
compiled CSS, and a separate custom-build replacement path is not exported.

The integration synchronizes shared color-mode state with Vuetify’s native theme
service and document classes. Independently scoped theme ownership is unsupported. Private adapter selectors are not stable customization hooks.

References: [Vuetify themes](https://vuetifyjs.com/en/features/theme/),
[global configuration](https://vuetifyjs.com/en/features/global-configuration/)
and [Sass variables](https://vuetifyjs.com/en/features/sass-variables/).
Consult the installed 4.2.5 APIs when online examples target another version.

## Verify a customized presentation

Check the same business components with and without your customization: filled
and outline buttons, disabled/loading states, field help/errors, select and menu
popups, icons, layout wrapping and scrolling. Confirm visible keyboard focus and
readable text. Check both supported color modes, including an already-open popup.
Do not infer whole-application coverage from a single button or claim WCAG
conformance from a theme's name. Customization must preserve Uninterface's model,
validation, selection and interaction contracts.

Keep theme authoring in application setup and styles; business views should not
need native toolkit props or per-component CSS to activate the theme. An existing
color role can be recolored without changing its meaning. Adding a role requires
backend implementation and capability support across all relevant components;
CSS alone does not extend Uninterface's theme vocabulary.

## Portable card hierarchy customization

For changes that should survive switching backends, configure a shared strategy in an application-owned Vue composition; no additional stylesheet is required:

```vue
<script setup lang="ts">
import { UiStrategy, uiCardPresentation } from '@uninterface/uninterface'
const cards = uiCardPresentation({
  [-2]: { color: 'primary', border: 'double' },
  [-1]: { color: 'primary', elevation: 'flat' },
  1: { header: 'band', density: 'compact' },
  2: { color: 'secondary', surface: 'tinted' },
})
</script>
<template><UiStrategy :use="cards"><slot /></UiStrategy></template>
```

Place the application's cards under this composition. Omitted properties retain the shared defaults. Each UiCard can override its effective role with color, or explicitly request neutral with :color="null". Customizing palette values remains an application theme task using the setup above; raw CSS/native variant names do not belong in this map. The same configuration works across conforming adapters, with each retaining its own concrete theme values. [Presentation mappings](presentation.md#cards-and-hierarchy) specify which native values are consumed. Test nested/peer cards, headerless units, both color modes and narrow layouts before adopting a custom profile.

## Default font delivery

Import a selected font.css or font-bundled.css entry first, then the stable backend style.css. Omit font imports for system or application-owned fonts, using --uninterface-font-family for a complete override. See [typography](typography.md) for all four choices, setup steps, CSP sources, licenses and limits.

The ordinary font setup offers four choices: backend or Uninterface default, each with Network or Bundled delivery. Import one font entry before the stable backend stylesheet, following [typography](typography.md); the Uninterface choices require the optional `@uninterface/fonts` package.

## Shared input frame coverage

Vuetify VField supplies the native frame. A density-context host surrounds its arbitrary content slot; each part is an unframed text input. Field feedback stays with UiField, without a VInput validation owner. Density follows the existing control-size mapping; it does not enlarge typography at positive sizes.

The frame follows the input theme through the supported setup described above; private adapter selectors are not a stable public styling API. Check ordinary inputs beside the compound frame under the chosen light/dark theme, sizes, focus, invalid, disabled and readonly states. Interior part wrapping is adapter-owned and is not a global layout-spacing customization contract. See [presentation mappings](presentation.md#shared-input-frames) for limits.


## Drawers and popovers

UiDrawer (modal and retained panel modes) and UiPopover consume this backend's normal surface, typography and color-mode setup. The adapter renders native-themed content over browser dialog/manual-popover hosting so Uninterface remains the only lifecycle and stacking owner. Application styles load after backend style.css; preserve hidden/inert behavior, bounded scrolling, focus treatment and core-owned stacking when customizing. Popups are teleported to body or the owning overlay; scope application theme variables accordingly. Toolkit gesture/snap-point/resizing options and docked/compact drawer allocation are not exposed. Layout peer spacing remains owned by the existing layout components.
