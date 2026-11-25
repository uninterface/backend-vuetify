# Vuetify presentation and native integration

[Documentation index](README.md) · [Application setup](setup.md)

This reference describes presentation policies, toolkit mappings and integration limits. Application consumers can start with setup; backend maintainers should also review the native coordination and upgrade-sensitive details here.

## Direct table actions

UiTable's private cell-content part middle-aligns a direct button host within the native table content line. This preserves native VBtn placement through its announcement wrapper without adding caption-baseline space above an icon action. Authored baseline layouts retain their caption reference and native widget dimensions remain unchanged. Check actual input/output/button/artwork centers in a standards-mode document (`<!doctype html>`), including hover and differing fonts.

## Command-menu columns and trailing content

Command menus use native VList/VListItem presentation. Within each menu surface, a selectable command reserves a separate check column for all command rows, including rows inside groups. Likewise, any entry icon reserves an independent icon column. Unchecked/nonselectable rows retain empty decorative check space; check state never replaces an entry icon. When both columns are reserved, the icon receives Vuetify’s `ms-2` logical spacing utility (8px in the installed toolkit), including empty placeholders so label alignment stays stable. This deliberately separates the two symbols while retaining the native spacer before the text. Submenu popups determine their own columns, and changes to loaded entries update reservations. Empty columns are omitted when no longer needed. Selection semantics stay on the command row; decorative native VIcon squares introduce no extra focus targets.

When a command-menu surface contains any entry icon (including entries inside groups), all its rows use native `VListItem prepend-gap="8"`, including rows with empty icon placeholders. Without entry icons, the adapter leaves the prop unset and retains native/application defaults; checkmarks alone do not trigger the compact gap. Each submenu decides independently, and entry changes update this choice. The separate 8px check-to-icon spacing remains unchanged. Vuetify also uses the prepend-gap token for append spacers, so icon-bearing surfaces use that native 8px clearance before shortcut/action and arrow content too. Navigation menus retain their existing spacing policy.

Shortcut hints use VListItemAction around noninteractive `kbd` content in the append slot. Command submenu arrows are direct VIcon append children, allowing native spacer rules to supply clearance from labels/descriptions. The adapter preserves native density, content sizing, popup collision handling, keyboard behavior and dismissal. Navigation presentation is separate and is not made denser by this command-menu adaptation. Consumers supply command definitions and actions without placeholder icons, spacing CSS or presentation props.

Verify matching label starts across ordinary/checkable/icon-bearing rows in a surface, stable alignment when checks toggle, and visible separation before shortcuts and submenu arrows. Verify nested groups, lazy submenus, LTR/RTL and narrow allocations while preserving native focus/dismissal. Popup surfaces may have different content-driven widths; native viewport collision handling may change placement. DOM checks establish markup/state; actual spacing and collision behavior require browser review.

## Content wrapping in narrow regions

UiContent allows an otherwise unbreakable word to wrap when it exceeds the available line width (`overflow-wrap: break-word`). This includes bare text and inline spans, independently of an enclosing card or paragraph. Ordinary word boundaries remain preferred; explicit descendant whitespace/wrapping rules retain ownership. The adapter supplies this default without author-side CSS, and without changing content insets or resize shares. Bootstrap's native card already provides equivalent inherited wrapping; UiContent also supplies it outside cards.

This is text wrapping, not a measured horizontal resize minimum: a panel narrower than its insets plus a glyph, or non-wrapping/non-text content, still needs an appropriate allocation or scrolling policy. Vertical measured minima remain separate. Verify both supporting regions near horizontal divider limits with enough width for insets and characters, and preserve mounted reading content.

## Presentation and responsibilities

- `UiSwitch` uses native `VSwitch color="primary"`: an on switch uses the theme's primary track/thumb treatment, while off stays neutral. Thumb travel mirrors in RTL; size strategies retain native density. Readonly preserves the current state and appearance; disabled uses native dimming and can suppress the primary cue. Native invalid styling remains in charge of error presentation. This is a backend default; business authors supply boolean field data and do not select native colors or add state labels/CSS. Verify both states in light/dark modes, supported densities, RTL, label/Space activation, focus, disabled and readonly behavior. Focused Chromium default-theme checks cover these cases; custom-theme, other-browser and user visual acceptance remain separate.
- Buttons use `VBtn`, text editing uses `VTextField`, boolean selection uses `VCheckbox`, and choice selection uses `VSelect`. Loading buttons are disabled; loading selects remain openable.
- Uninterface owns values, validation, source loading, submission and reset. The adapter uses no `VForm` validation or data model. Single-value fields delegate labels and details to VTextField, VSelect or VCheckbox through private presentation coordination. Native error messages replace help while invalid; associations follow the visible message. Group fields retain their shared outer label and descriptions.
- A select retains the supplied selected label when candidates unload or fail. Placeholder and retained-value entries are omitted from the popup. Source messages use VSelect’s native no-data slot, distinct from candidates and the current selection; recovery controls remain outside the picker.
- Menu commands use Vuetify list items. Navigation uses ordinary links and disclosure buttons with Vuetify presentation. VMenu supplies connected positioning, overlay hosting, theme inheritance and nested-menu coordination. Native VList handles movement within a list; a narrow interaction bridge preserves selection groups, typeahead, lazy branches and host dismissal; ordinary navigation retains links/disclosures without imposing a menubar.
- `UiApp` supplies a theme surface and inherits document typography without a `VApp` layout wrapper. Document flow, viewport hosting, content insets, and grouped scrolling remain separate contracts. Navbar content wraps instead of silently becoming a collapsed menu.
- The six standard colors are available. `danger` maps to Vuetify's `error` theme role; no additional theme-color extension is declared. Filled, outline, soft and text treatments map to `flat`, `outlined`, `tonal` and `text`.

An open single- or multiple-selection picker handles Escape at its trigger
or floating content, closes the controlled native menu, and returns focus to
the combobox. The enclosing overlay can handle a later Escape.

## Verification and limits

The capability manifest lists the implemented view contracts. Conformance requires the shared acceptance scenarios and browser checks; a declaration alone is not evidence of compatibility. Native-select DOM assumptions do not apply to Vuetify's composite picker, which exposes a combobox and floating listbox instead.

Picker focus, real popup rendering, reduced-motion behavior and scroll geometry require real-browser verification. The current adapter has not established complete accessibility certification. Application locale synchronization is installed through createUiApplication. Core UiStrategy control-size queries are integrated with the [documented subset](strategies.md); all common field-presentation preferences are integrated; see strategy support for native adaptations. Shared application color-mode state synchronizes the native Vuetify theme service and document selector; it covers teleported overlays as well as ordinary content.

## Integration decisions

Floating menus use toolkit overlays and teleport outside clipped layout regions. The adapter registers their logical surfaces for shared keyboard/focus handling; membership does not depend on DOM ancestry. Core owns open/selection state. VMenu receives a direct VSheet child so native elevation, rounding and overflow rules apply. Commands use real VList and VListItem, native disabled props, title/subtitle/prepend/append slots and toolkit icon aliases. Logical groups do not create additional interactive VLists. Top-level navigation uses text VBtn actions; popup navigation uses VListItem.

Native VList owns ArrowUp/ArrowDown/Home/End and focus handling. The shared helper supplements typeahead, lazy-branch entry/exit and host dismissal; it does not also process native list-movement keys. Native popup transitions and focus capture remain enabled. Initial lazy-mount focus and explicit host restoration are bridged because core's host can change between a button and a context target, while VMenu's normal activator registration owns fixed event/ARIA attributes. Native click/hover activation is disabled to avoid registering a second invocation owner.

Initial popup focus is retried on the native overlay's `afterEnter` event, after its entering surface becomes focusable. This callback preserves focus already inside the menu or any registered teleported child popup, and queued focus work is canceled on disposal. Viewport geometry checks measure the settled popup after its native ancestor transforms finish; the entry animation is retained.

VLocaleProvider is renderless and maps inherited document/local direction into native input, checkbox, select and popup contexts. Ancestor direction changes are observed. Direction inheritance is distinct from message selection. Application setup separately synchronizes the committed core/native locale with Vuetify locale services through the integration descriptor.

The navbar uses a naturally wrapping VSheet; VAppBar/VToolbar impose height/layout behavior outside this contract. Insets and primary gaps use Vuetify's `pa-4`/`ga-4` utilities, and form rows use `ga-5`. It adds no arbitrary elevation, brand weight or descendant link colors. Application branding owns its own typography.

Vuetify owns floating labels, feedback spacing, button variants and control appearance. Its global stylesheet establishes native-content defaults. UiContent adds insets, not a prose theme or a global heading reset. Adapter reduced-motion patches affect its own loading buttons only.

## Document baseline

The imported Vuetify stylesheet establishes document typography and reset defaults on the document, including its native font stack. UiApp inherits that baseline while retaining the toolkit theme surface; teleported controls receive the same document font.

Application localization and the icon catalogue are installed through `createUiApplication`; see [setup](setup.md#localization-and-icons). The integration exports native locale mappings and the 58-name default subset.

Shared grid layout uses this backend’s static `./layout` export (`uiLayoutPresentation`) for peer spacing, also used by its linear layout. Core owns the grid geometry; no separate backend grid component is needed. See **UiGridLayout** in `@uninterface/uninterface` (`docs/api/components/UiGridLayout.md`).

## Known interface-language label contrast limitation

Vuetify 4.2.5's native floating label in the light filled select can fall below WCAG AA's 4.5:1 normal-text threshold. The mobile editor audit measured the Interface language label at **3.97:1**: effective foreground `#7a7a7a` on `#f6f6f6`. Native label emphasis and the filled-field overlay produce these colors; the backend preserves their defaults.

This is a documented light-mode limitation, not a WCAG AA conformance claim. Applications choose their acceptance policy and must assess their own theme and complete workflows. Keyboard, focus, naming, feedback and interaction obligations still apply.

Applications requiring stronger contrast can optionally increase native label emphasis after importing the backend stylesheet. For example:

```css
.v-theme--light .v-field:not(.v-field--disabled) .v-label.v-field-label {
  --v-medium-emphasis-opacity: 0.75;
}
```

This changes label emphasis for enabled light-theme fields while preserving the palette, focus/error rules and disabled treatment. It is an optional starting point, not a browser-certified theme. Verify the resulting contrast across field variants, resting/focused/error states and application backgrounds, and assess dark mode separately. [Vuetify theme configuration](https://vuetifyjs.com/en/features/theme/) provides broader theme customization when needed.


See [strategy support](strategies.md) for optional regional preferences, control-size mappings and unsupported values.


## Shared appearance and text editing

All text modes use the same UiTextInput view: single-line text, masked password, multiline text and readonly editing. VTextField provides single-line/password editing; VTextarea provides multiline editing with native label, density and detail presentation. Readonly preserves focus/copy behavior and field participation; disabled remains a separate restriction.

The backend integrates shared light/dark/system setup using `class` on the document element. See [setup](setup.md#color-mode). Mode changes retain drafts and open menu sessions. Controller and DOM checks do not establish computed appearance, native picker styling or accessibility conformance; browser checks remain required.

## Button presentation preferences

Filled, outline, soft and text map to flat, outlined, tonal and text. Icon uses native icon mode with text treatment. The icon slot maps to prepend for labeled buttons and native icon content for icon presentation; native loader behavior is retained.

Explicitly sized artwork supplies a minimum content height. Icon-only actions also allow the native width to grow and keep the icon's space under the native loading overlay.

All six variants support every declared color. The explicit variant prop takes precedence over an agreed uiButtonVariant regional preference. With neither specified, this adapter ordinarily uses filled; supported application-owned native configuration remains effective. Icon labels stay accessible and supply a native title hint; title display on focus/touch depends on the browser. Pass an explicit title when label content comes from an opaque component. These are support declarations; real-browser geometry and hint behavior need verification. See **UiButton** and **uiButtonVariant** in the core documentation.

## Cards and hierarchy

Cards support an absent header without reserving a blank header band or separator. The optional `top-end` slot anchors concise actions to the card frame using logical edges, independently of preview/media content. Its inset follows half the current card padding, including density changes; the enclosing frame stays positioned and focus remains unclipped. Collection cards use this slot for `card-action-placement="top-end"` and omit headers without selection or meaningful header fields.

UiCard supports five structural requests: -2/-1 higher, 0 ordinary, 1/2 subordinate. Its default map shares the two higher treatments; all other defaults differ. Every level retains a full outline and readable body content. Ordinary/higher levels use solid outlines; both subordinate levels use dashed outlines, independently of color. Higher cards use roomy insets, a band header, large title and raised surface; zero uses normal insets with a band, large title and raised surface; one uses compact insets and a band header; two retains the band and adds a tinted surface and smaller title. Headerless cards retain surface, boundary, density and elevation cues.

Vuetify retains one VSheet with native rounded lg and elevation 4/0. Region insets use 24px/16px/12px, corresponding to native spacing increments. A VSheet whole-background color would overfill arbitrary content for this contract; scoped boundary/tint composition instead consumes native theme channels (danger maps to error), preserving normal surface foreground. Native surface/background and border channels support both color modes. Footer content remains arbitrary rather than acquiring VCardActions semantics. The footer composes a native VDivider with its own inset content region. Header separator adaptation fulfills the explicit band/plain treatment.

All eight portable treatment properties are supported through uiCardPresentation: color, header (band/plain), footer (normal/muted), density (roomy/normal/compact), surface (plain/tinted), elevation (flat/raised), border (solid/dashed/dotted/double) and titleSize (large/normal/small). A map can independently customize all five levels, including -2 and -1. Exact native values remain theme-owned; solid/dashed is a primary distinction in Uninterface’s default hierarchy; applications can override patterns, including double, through their presentation maps. This is an Uninterface convention, not a claim of a universal toolkit hierarchy.

UiCard.color overrides the level's color; null explicitly selects neutral and omission uses the profile. Colored boundaries and softly tinted header/body regions use the effective role, while body text retains ordinary foreground. Neutral uses the theme's ordinary boundary tone. Private tokens reset on every card, so a parent's explicit color does not color nested cards or controls. Shared profile scope still independently applies to each participating card. Title/description slots receive structured typography; arbitrary header content retains its own typography and replaces both slots.

The card grows with content, has no sticky regions or scrollport, and preserves descendants when level, color or profile changes. Parent layouts own peer spacing; card regions own insets. No heading rank or interaction role is inferred. See [customization](customization.md) for setup and stylesheet ordering. Structural tests do not establish visual hierarchy quality; compare representative nested content in both modes and at narrow widths.

Footer background and separator color/thickness retain native toolkit presentation; foreground follows the selected footer emphasis. Existing separator patterns follow solid/dashed/dotted card boundaries; double boundaries use solid separators. Pattern-only adaptation fulfills the shared border contract without imposing the card accent on the native footer. Card-density padding adjustments remain to fulfill the explicit shared density request. Native theme configuration can therefore affect footer appearance independently of the enclosing boundary.

Default headers at levels 1/2 retain full insets and a separator so the footer does not receive the only region boundary. Ordinary title typography is semibold, with footer decoration intended to be equal or quieter. Native footer decoration is retained. Application-owned themes, custom plain-header profiles and rich footer content require assessment of the complete pairing; the default styling cannot control the prominence of arbitrary business content.

Vuetify passes solid/dashed/dotted through the native VDivider variant prop (double maps to solid) and adapts the band-header style. Native divider opacity/color/thickness remain intact. Pattern changes never add a separator to a plain header, reveal a missing footer, or change nested-card requests.

Footer emphasis defaults to muted at levels 1/2 and normal elsewhere. Muted uses the native on-surface color and medium-emphasis opacity as text alpha, with 0.875rem text on the footer-content wrapper (not on VDivider). Normal retains the native/reference foreground and body text scale. No whole-region opacity or control-size strategy is applied. Both subordinate levels use the same small scale. Card roots reset typography to the backend body baseline to prevent a nested card from inheriting reduced footer type. Backgrounds, insets and separators retain their independent policies. These scoped text changes fulfill the explicit portable footer request; native HTML/third-party content retains normal CSS inheritance responsibilities. Verify custom content and theme legibility in both modes.


### Context-menu host focus

UiMenu supplies `buttonTrigger` for explicit button activation and `contextTrigger` for contextual interaction on a content group. Apply the complete binding with `v-bind`. The contextual binding includes a private backend class that gives its element a visible keyboard-focus boundary; it does not change child control styling. Focus colors follow this backend's theme, with a system-color outline in forced-colors mode. The boundary uses a backend default radius independent of nested content; it does not infer a child card's shape. Ordinary consumers need no backend class names or focus CSS.


### Reusable focus presentation

Use `useUiFocusPresentation()` from `@uninterface/uninterface` and apply its complete object with `v-bind` to an author-supplied focus target. This backend fulfills `focus.presentation.v1` through its static `./focus` module and stylesheet. The same theme treatment used by context-menu content is available on native links and suitable custom regions anywhere in the application. The binding supplies no tabindex, roles or interaction; callers retain those responsibilities. Branding applies it explicitly rather than relying on navbar ancestry. Avoid adding a second focus treatment to existing toolkit/Uninterface controls. Theme and forced-colors behavior follow the contextual focus treatment described above.

### Region framing

Ordinary UiRegionLayout supports optional separators, selectable adjacent numeric-share resize boundaries and relative sibling layers. Vuetify uses its border/surface theme tokens and native elevation-4 class on the raised edge decoration. Separators occupy one theme-owned track; resizers replace that track with a pointer/touch target and use this backend's reusable focus treatment. The initial target is 0.5rem across the split; themes may customize the private layout handle/separator size properties. Raised surfaces do not add content insets.

The adapter owns markup/geometry and uses the optional useUiLayoutResizeView helper for measured pointer interaction, RTL-aware keys and cleanup. Core owns the adjusted ratio and validates relationships. This is allocation framing, not a card or a claim of a native splitter widget. Rendering stays stable while framing changes; the reading scrollport cannot clip a sibling header's shadow. Local layering does not establish global overlay order. Forced-colors uses system boundary colors. Shared browser acceptance remains necessary for hit targets, focus and geometry.

Region separation belongs to UiRegionLayout and spans the full allocation boundary, independent of navbar/UiContent size. A designated navigation child suppresses its matching local edge even when the layout explicitly hides ordinary separators. Standalone and unrelated nested navigation retain their own borders.

Start–Main uses `--v-border-color` at twice `--v-border-opacity`; Main–End uses `--v-border-color` at native `--v-border-opacity`. These line colors express stronger/quieter emphasis in both equal-depth and raised cases. They never change elevation, shadow opacity/reach or stacking order. This is the adapter's region-framing policy, not a claim that native toolkit navbars independently implement these region roles. Application theme overrides should preserve the distinction and both lines' visibility.

Raised region presentation decorates shared edges toward lower neighbours. The adapter retains native `elevation-4` on a separate shadow plane: reflect vertically for a before/top edge, rotate for inline edges, and mirror logical mapping in RTL. Absolute decoration uses `container-type: size` and `cqw`/`cqh` units to keep the rotated plane's footprint equal to the allocation; this requires a browser supporting size container queries. Business content is neither size-contained nor clipped. The wrapper clips only edge decoration. Native shadow customization still feeds the plane, with the same recipe at both roles. No exposed outside edge gains a border.

Equal-depth boundaries retain requested ordinary separators, including all-raised and none-raised states. A raised edge replaces the ordinary separator. Resize handles retain their own tracks and boundary lines; the adjoining raised decoration omits its extra line and stays below the interactive handle. Forced-colors uses a system-color line and suppresses shadows; tone and depth distinctions may collapse. Verify short content, both axes, RTL, light/dark themes and custom theme values in a real browser.

## Button announcement containment

The native button and its persistent loading-announcement live region share a private positioned inline-flex host. The clipped announcement is anchored at the host origin so a button inside a long scrollport does not extend document overflow. Attributes, events, form association and focus still target the native button. The live region remains outside its accessible name and mounted while idle.

## Input-styled controls

The core **Input-styled controls** contract (`docs/contracts/input-styled-controls.md` in the core documentation) defines this shared look-and-feel agreement. Applicable text, scalar temporal, select and compact multiselect surfaces normally fill their field-control allocation, align to its logical start, use a coherent input frame with visible focus, and default to one row. Textarea and wrapping selections are explicit adaptations. Field labels and feedback retain their existing arrangement strategies. Native theme tokens and supported customization supply the appearance; business compositions do not compensate with CSS.

UiInputFrame composes sub-inputs and supporting content into one input-styled control. UiTextInput shares its frame without adding another border. Existing native controls can fulfill the same agreement directly. Temporal ranges use the lower-level delegated-frame protocol internally. UiFileInput is input-styled: chooser, accepted filename and clear action share the surface. UiUploadRegion retains its drop-area presentation and owns the internal arrangement of optional progress, preview and actions. UiFileInput keeps previews separate. See the [reviewed components](reviewed-components.md) for ownership and native adaptations. This documents obligations, not new visual acceptance evidence.

## Shared input frames

Framed text editors support `maxWidthCharacters` as an approximate character-cell display cap (`input.frame.sizing.v1`), applied to the real editor allocation while the inner input fills it. It never supplies maxlength or changes parsing. UiInputFrameSpacer receives remaining logical inline space through an automatic start margin after editor growth; it is decorative and has no tab stop. The price example uses eleven cells for ten digits plus a decimal separator and places the spacer after USD. Narrow-width/RTL geometry remains subject to browser verification.

Vuetify VField supplies the native frame. A density-context host surrounds its arbitrary content slot; each part is an unframed text input. Field feedback stays with UiField, without a VInput validation owner. Identity, descriptions and interaction handlers attach to the content surface: VField consumes its own id prop for a single editor and cancels some bubbled clicks, so the adapter stops content clicks at that boundary after normal action handling. Density follows the existing control-size mapping; it does not enlarge typography at positive sizes.

UiInputFrame with ordinary UiTextInput implement input.frame.v1 and input.frame.cooperation.v1; single-line search also declares input.text.search.v1. The frame consumes field invalid/busy/disabled state and existing failure/size strategies. Hidden failure presentation retains aria-invalid. Parts receive unique names/IDs and the owning field's visible feedback descriptions. Leading, default and trailing content share one wrapping surface. Readonly leaves text selectable and blocks in-frame buttons by default; allowWhenReadonly permits appropriate non-editing actions without bypassing disabled/loading. Owned popup engagement is coordinated; popup content has a separate field/surface scope.

Use the [customization guide](customization.md) for consumed configuration. Functional DOM acceptance covers focus movement, invalid-part focus, incomplete drafts, Save/Reset/Clear and restrictions. Check appearance and narrow geometry with the intended theme in a browser; DOM tests are not visual evidence.

Vuetify uses VFileInput with its filename and clear action inside the native field. Filename text follows the accepted descriptor independently of the browser file list. Acquisition alone creates no preview object URL. Browser visual acceptance remains separate from functional DOM checks.

## Segmented selection as a native field

UiSegmentedSelect composes VInput (native density context with rules empty and details hidden), VField (surface/label/focus/error), and VBtnToggle/VBtn (text variant, native selected text color without persistent selected fill, no individual borders/dividers). A local activated-opacity token override removes the resting selection overlay while preserving native hover/focus overlays and ripple. The existing core radio selection and UiField feedback remain the only value/validation owners. This is an adapter composition using native building blocks, not an upstream segmented-field component.

The sole segmented editor uses the existing ordinary field-label coordination protocol. Default/show/floating renders a permanently raised label; above/hidden uses the outer associated VLabel. Application VField variant defaults are consumed, including filled/outlined; singleLine is explicitly false because always-visible choices cannot share the resting label position. Label and empty-surface clicks focus the selected enabled option or first enabled option. Content clicks stop before VField's single-input click cancellation, preserving radio activation. Focus remains active during movement inside the group and clears on departure. Required markers and field help/failure strategies remain supported.

The scroll area spans the field width. Choice padding uses the native inline field insets, so the endpoint choices have the usual edge spacing with a single inset. One-line filled and outlined controls use the native compact, comfortable and default field heights of 40, 48 and 56 px with either above or floating labels. Captions center in the same native content area as a text or select value, whether the choices fit or scroll. Floating labels use a tighter line where needed. The scroll area extends below the field if placing the scrollbar inside would displace the choice row. That space is stable across overflow and sits before field feedback. A classic scrollbar takes the place of the reserved padding when present. An overlay scrollbar paints within it. Resizing the strip reveals a clipped focused choice locally without changing focus or selection.

Option captions inherit field value font size, line height and letter spacing, and retain the native button weight. VBtn height is auto with a one-line minimum. Native text-button focus paint is inward, with an inward outline adaptation in forced colors. The field can grow to fit descriptions, large text and vertical arrangements.

The backend DOM regression covers label strategies, naming/IDs, native defaults, focus, radio selection, required/error/disabled states and vertical orientation. Shared choice-group regressions cover source retention, reset and RTL. The backend browser test checks label clearance and neighboring input heights at desktop/mobile widths, plus pointer/keyboard focus and narrow overflow. DOM success is not browser geometry acceptance.

External field feedback is rendered only when visible help or a non-tooltip error is present. Empty groups/frames do not reserve the feedback container's top margin. Tooltip descriptions remain independently rendered and associated; suppressed errors do not create blank feedback space. This mirrors native auto-details behavior and avoids shifting centered field surfaces when their feedback is empty.

## Vertical navbar adaptation

UiNavbar follows core's resolved navigation-region orientation. In a side navigation allocation it stacks brand, links and actions vertically at every width; a top/bottom or standalone navbar retains horizontal wrapping. Theme spacing and child semantics remain native to this backend. Only the acknowledged logical edge is rendered; a region-owned edge is not duplicated. This implements the shared UiNavbar backend guidance in `@uninterface/uninterface` (`docs/api/backend/navigation.md#uinavbar-implementation-guidance`), rather than relying on incidental narrow-width wrapping.


### Context menus during window resizing

The adapter uses core's backend helper `useUiMenuPoint` to retain the original click coordinates and derive an effective point constrained to the current document viewport. Shrinking past the original click recalculates the anchor; expanding restores it where possible. A changed effective point updates VMenu’s target coordinate tuple. Native VOverlay resize/overflow handling continues to own placement and available size. Button and keyboard invocation keep their element anchors. Resize preserves menu identity, open state and focus; shared point observers disconnect on deactivation/unmount. This addresses ordinary window resizing; it does not claim separate pinch-zoom or virtual-keyboard acceptance. Verify root and nested menus across shrink/expand and ensure commands remain reachable. Automated DOM tests cover state/wiring; browser geometry remains a separate acceptance check.


## Compound-control baseline alignment

The backend declares `layout.baseline.v1` for horizontal UiLayout/UiFlowLayout rows, with and without wrapping. The existing native CSS Grid/Flexbox allocation consumes `align="baseline"`; keyed allocation and stacking wrappers stay in place. Each wrapped row aligns independently. Vertical baseline alignment and UiRegionLayout baseline requests fail in core.

Input-frame editor participants supply the first editable baseline, ahead of leading icons and trailing actions. Native minimum-height surplus is centered around the content line. Button hosts use baseline vertical alignment; visible captions participate in baseline export while decorations retain their centered treatment. Field/form wrappers propagate the reference naturally; above labels expose their first line, while hidden/floating labels expose editable content. These adaptations preserve native typography, padding and control ownership. Arbitrary opaque content retains native baseline/fallback behavior; no DOM search or measured offset selects its business target.

The Shared input frame keyword row and Collections OrderSearch row exercise this behavior. Source/DOM checks do not establish painted text alignment; browser acceptance must compare actual text baselines at supported sizes, RTL, wrapping, feedback and loading states.


Framed UiTextInput also supports `minWidthCharacters` (`input.frame.min-width.v1`). The real editor allocation consumes a minimum in font-relative `ch` units; the inner native input continues to fill it. This minimum takes precedence over shrinking/percentage maxima in an insufficient host and is never a minlength constraint. Omission preserves the existing compact minimum and maximum-width behavior. OrderSearch and the Shared input frame keyword example request 20 cells; this is a business-composition choice, not a backend-wide search width.

## Neutral buttons

Uses native outlined VBtn with no named color class at rest, neutral surface/on-surface/border tokens, and the native state overlay. Hover, focus-visible and active select the requested semantic foreground/border; the existing currentColor overlay provides the tint. This is not an Element-style custom fill. Danger maps to error.

Select variant="neutral" independently of color. This fulfills the neutral-rest/semantic-interaction contract using backend-owned adaptations; it does not change omitted defaults. Test color changes, variant removal, loading/disabled behavior, keyboard focus, and light/dark themes. DOM mapping coverage does not establish browser visual acceptance.


See [Contract adaptations](contract-adaptations.md) for this backend’s native mappings, support limits, allocation defaults and verification qualifications.

## Infinite table continuation

The adapter uses its VDataTableServer body slot for continuation, preserving native fixedFooter and accepted-record ownership. Loading, append failure/Retry and completion scroll with the data, before any creation row and summary. The sentinel stays at that point. The adapter retains one announcement outside the table/loading mask; non-infinite and card status paths remain separate. Verify pending/retry/completion, bounded infinite and no-summary tables, plus switching to manual content-height accumulation, preserving keyed editor state and column alignment.

## Infinite continuation content

UiTable, UiList and collection card views forward `infinity-loading` and `infinity-complete` message-content slots with `{ message, loadedCount }`. The backend retains its loading indicator, status container, continuation position and independent sentinel; table continuation remains before creation/summary rows. Initial/refresh masks and non-infinite status paths retain their existing presentation. Missing/empty content uses the resolved default text. Core resolves per-view `messages.listAppending`/`listComplete` for visible defaults and the elected announcement. Error slots expose `placement` for initial, replacement and append recovery. See the `@uninterface/uninterface` Collection views guide, Infinite continuation content section for ownership and observable checks.

Default infinite loading/completion feedback is centered and subordinate to record text. Vuetify uses its on-surface foreground at native medium emphasis and a smaller relative text size. The local loading message inherits that size instead of enlarging with control-size strategies; the backend retains its indicator. Errors, empty states and non-infinite feedback keep their own treatment. Custom infinity content inherits the status tone/alignment.

## Progress bars

Standalone and upload-hosted bars share `UiProgressBar.vue` and `progress.bar.v1`. Both measured and unknown progress use horizontal bars. See the [shared progress guide](progress.md) for this backend’s native mapping, precise range, semantic color and reduced-motion adaptations. The producer retains operation and announcement ownership.
