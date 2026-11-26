# Typography and fonts

[Documentation index](README.md) · [Setup](setup.md) · [Customization](customization.md)

This backend's recommended set is **Roboto Variable**, with language-aware Noto Sans SC/TC fallbacks. The alternative Uninterface-default set uses Noto Sans Variable across all backends. Font entries supply selection and delivery; the stable backend stylesheet supplies component styling.

## Setup: select fonts, then load backend styles

| Choice | First import: fonts |
|---|---|
| **Backend default · Network** (recommended starting setup) | `@uninterface/backend/font.css` |
| **Backend default · Bundled** | `@uninterface/backend/font-bundled.css` |
| **Uninterface default · Network** | `@uninterface/fonts/font.css` |
| **Uninterface default · Bundled** | `@uninterface/fonts/font-bundled.css` |

1. Follow the backend setup guide to resolve core and the selected backend. Make the optional `@uninterface/fonts` package available to the application for either Uninterface-default choice.
2. Import **one font entry first**, then always import the same backend stylesheet:

   ```ts
   // Backend default · Network
   import '@uninterface/backend/font.css'
   import '@uninterface/backend/style.css'
   ```

   To select Uninterface default · Bundled, change only the first line:

   ```ts
   import '@uninterface/fonts/font-bundled.css'
   import '@uninterface/backend/style.css'
   ```

3. For either Network choice, permit `https://cdn.jsdelivr.net` in applicable CSP `style-src`, `style-src-elem` and `font-src` sources, alongside existing application sources. Font CSS and WOFF2 subsets are fetched from this third-party CDN using pinned Fontsource versions. No HTML font link, loader script or API key is required; the build emits no font binaries.
4. For either Bundled choice, build normally and deploy all generated CSS and font assets. Permit their asset origin in `font-src`. These entries make no CDN font requests. Fontsource dependencies provide the files; no separate font installation is required after the selected packages are installed.
5. Check actual font requests and rendered faces on ordinary content, controls and popup surfaces. Test network failure: unavailable fonts fall back to system fonts, without guaranteeing the intended appearance.

Use the same order when composing an application stylesheet:

```css
@import '@uninterface/fonts/font.css';
@import '@uninterface/backend/style.css';
```

Keep CSS imports before ordinary rules. Font entries own family selection, language fallbacks and delivery; `style.css` owns component styling and native font-token mapping. It consumes the selected set without replacing it. Network and Bundled use identical families for the selected set. Importing multiple font entries is unsupported.

## System or application-owned fonts

For system fonts without downloads, omit the font entry:

```ts
import '@uninterface/backend/style.css'
```

The backend uses `system-ui, sans-serif` for ordinary interface text and controls. No selected font set, remote font stylesheet or bundled font binary is introduced by this import. Explicit code/monospace content retains its semantics.

For another provider or your own font files, load its CSS before the backend stylesheet and set an application override after the imports:

```css
/* Put your provider's font CSS import here if needed. */
@import '@uninterface/backend/style.css';

:root {
  --uninterface-font-family: 'Your Application Font', system-ui, sans-serif;
}
```

Supply the matching licensed faces, weights and language coverage yourself. The override replaces the complete stack, including Chinese fallbacks, and takes precedence over either selected set. It is inherited across language boundaries. Scope it to an application-owned language boundary (for example, an element with `lang="en"`) if needed, ensuring it also reaches surfaces teleported outside that scope. Setting this property does not remove an already imported font entry's declarations or network requests; omit that entry when supplying your own fonts.

## Language, weights and loading

All four choices supply Noto Sans SC/TC Variable upright faces. SC is the default Chinese fallback; zh-Hant, zh-TW, zh-HK and zh-MO boundaries select TC. Set correct document and content `lang` attributes. Teleported content must carry its owning language when different from the document. Font delivery does not inspect business values.

Latin normal/italic faces and Chinese upright faces cover weights 100–900. The CSS names include the `Variable` suffix. CJK italics may be synthesized. Fonts use `font-display: swap` and Unicode subsetting; browsers request subsets needed by visible characters. Text can change size after loading, so wait for relevant fonts before measuring layout or capturing screenshots.

The shared Uninterface set uses Noto Sans Variable, with Latin, Latin extensions, Greek, Cyrillic, Vietnamese and Devanagari subsets, plus SC/TC. The initial language acceptance target is English, Simplified Chinese and Traditional Chinese. Included subsets do not establish complete shaping/layout acceptance. Japanese/Korean regional selection and Arabic/Hebrew/Thai families are not yet supplied; unsupported scripts use platform fallback. This choice does not introduce a font-role strategy or serif set, and preserves code/monospace semantics.

Bundled backend sets emit approximately 8.9–9.4 MB of font assets; the shared set emits approximately 9.7 MB, mostly Chinese subsets. These are deployment sizes, not first-page transfer sizes. Network entries emit no font binaries. Fontsource packages remain installed dependencies of their owning backend/font package regardless of delivery; the shared font package is optional for applications choosing backend fonts. Cache deployed assets and retain licenses.

## Licenses and versions

- [roboto license](font-licenses/roboto.txt): `@fontsource-variable/roboto` 5.3.0, SIL Open Font License 1.1.
- [noto-sans-sc license](font-licenses/noto-sans-sc.txt): `@fontsource-variable/noto-sans-sc` 5.3.1, SIL Open Font License 1.1.
- [noto-sans-tc license](font-licenses/noto-sans-tc.txt): `@fontsource-variable/noto-sans-tc` 5.3.1, SIL Open Font License 1.1.

The optional `@uninterface/fonts` package owns the shared Noto Sans/SC/TC licenses and pinned dependencies.

## Verification and responsibility

Checks cover all four choices with font-first JavaScript imports and CSS imports: Network builds keep remote imports before style rules without emitting fonts; Bundled builds contain only the selected set's resolved WOFF2 assets, weights and italic faces. Backend styles alone emit no fonts or CDN requests. Browser acceptance additionally checks actual face loading, language boundaries, ordinary text/controls, popups, overrides, system-only operation and failed-network fallback. Hosted tests may intercept requests with exact pinned package bytes; these do not establish live CDN availability or visual acceptance.

Font providers own family selection, delivery declarations and licenses. Backends map selection into native tokens and preserve component weight semantics. Applications choose a font entry, declare languages, configure CSP/caching, deploy local assets and test real content in their supported browsers. Computed weight alone does not establish that a font loaded; font loading alone does not establish accessibility conformance.


Arabic interface messages are available through `ar`; the supplied font entries do not yet bundle or download a dedicated Arabic family. Arabic glyphs use system fallback. Applications can supply an Arabic-capable font through their typography configuration; verify actual shaping and loaded fonts in the target browser.
