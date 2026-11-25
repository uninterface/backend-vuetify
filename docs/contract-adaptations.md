# Vuetify contract adaptations

[Documentation index](README.md) · [Presentation and integration](presentation.md)

This backend-owned reference records native mappings, support limits and integration decisions. Shared API semantics remain in @uninterface/uninterface; native component names and concrete appearance do not add business-side parameters. This documentation move adds no runtime support or browser acceptance evidence.
## Fields, controls and strategies

Editor requests -2/-1/0 map to compact/comfortable/default density; positive requests retain default. Native typography does not scale with density. Ordinary beside requests generalize to show because native fields lack equivalent label columns; checkable control-aligned/separated are unsupported and resolve through adapt to flushed. Above/hidden and native integrated floating text/select labels are supported. Sole input-frame and segmented presenters can keep labels permanently raised; a sole input-frame presenter may do so within a grouped field. Checkable labels stay adjacent; group titles stay above options. Required annotations default to suffix; help replacement and below/tooltip failures are supported, while embedded approximates below.

Compact layouts fit a direct standalone checkbox field to native selection-control height, preserving its hit area and feedback. This local accommodation respects query depth and does not reach through nested layouts or opaque content.

UiSelect and UiMultiSelect use native selection components; multiple uses VSelect clear facilities and keyboard clearing. Segmented editors use native VField with text-style VBtnToggle/VBtn adapted to radio semantics. Mandatory handling must not force an initial selection. Native selected text color distinguishes selection without persistent fill or individual segment borders. A sole segmented field keeps its label raised under default/show/floating even with no selected value; above/hidden use external associations. Application VField filled/outlined defaults are supported; singleLine stays false. Short segments use field content-height budget rather than stacking button height with label padding. Larger/vertical/description/scrollbar cases may grow.

Input frames use VField with plain inner VTextField; full-width buttons use native block facilities. Preview regions use readonly VInput/VField with native filled surface, bottom border and integrated label; no fake text editor is created. VImg uses contain and an object-fit:fill adaptation for stretch, with a contained accessible broken-image glyph. File previews use local scalable family-marked artwork.

## Collections and navigation

Tables use VDataTableServer's native multi-sort headers/icons/priority badges with a custom body retaining every source-returned row, no native footer and no native row slicing. Sort updates preserve external clauses. Colgroups implement shared widths; VTable fixed-header keeps bounded headers visible. The outer collection host owns scrolling. Filter triggers use compact native icon buttons/popovers; removable criteria use VChip's controlled close affordance.

VPagination handles bounded jumps; size/jumper use native select/text fields at comfortable density to match navigation buttons. Footer order is size → info → paginator → jumper at logical end. Narrow rows preserve end alignment and use total-visible. This is a native-footer adaptation, not a claim that every detail matches an upstream mobile example. Context menus update the VMenu target tuple on viewport changes.

## Feedback and surfaces

UiNotice default/filled/outline/soft map to tonal/flat/outlined/tonal. Custom uncolored notices omit native type; filled uses neutral surface-variant. Text-led actions hang native insets into notice space while preserving padded targets.

Toasts use VSnackbar; editable notifications use VCard in a managed nonmodal viewport, avoiding snackbar touch-dismiss/content-live-region semantics. Native card content/action slots and appearing notification fade remain. Native snackbar timer is optional upstream, off by default and not exposed by managed target options. Floating variant requests do not select surface variants.

FooterActions puts the first action at inline-end with reverse-inline flow across managed surfaces, retaining declaration/DOM/Tab order. Drawer/popover surfaces use Card regions and are arrowless. Modal popups stay within the owning dialog; stacking registers actual .v-overlay wrappers. Loading uses VOverlay/VProgressCircular. Empty states use VEmptyState text/media/actions with content-sized allocation and a spanning VTable body row.

The contained loading VOverlay paints inside the core-ordered loading root. It opts out of Vuetify's global overlay stack so unrelated menus retain native Escape dismissal. Review the private `_disableGlobalStack` prop on Vuetify upgrades. Loading keeps its local pointer block and busy announcement.

## Appearance and artwork

Color mode uses native v-theme--light/v-theme--dark classes and the theme service. Explicit selectors override supported system following. Integration dispose releases the native theme-service scope, including setup rollback and unmounted disposal. Default font is Roboto Variable.

Clear uses MDI eraser; more-vertical uses dots-vertical; menu-item reuses file-outline independently. Search/refresh use the pinned MDI magnify/refresh glyphs. Native typography, focus and palette remain theme-owned; automated WCAG AA gating is not imposed on this toolkit backend.

See [presentation](presentation.md), [strategy support](strategies.md), [collections](collections.md), [typography](typography.md) and [customization](customization.md).

## Support and native defaults

The following mappings describe this installed adapter. Shared strategy requests can generalize to supported fallbacks; native feature availability alone does not imply adapter support. Three-level control scales map out-of-range requests to the nearest native level. Embedded validation is not implemented and is approximated to below feedback. Browser geometry, wrapping, focus paint and assistive-technology acceptance remain separate from source/DOM checks.

### Native size and field-label support

| Backend | Native editor levels | Native button levels | Supported field labels |
|---|---|---|---|
| Vuetify | -2/-1/0 through compact/comfortable/default | -2/-1/0/1/2 | above/hidden for ordinary fields; flushed checkables only; floating for text/select and sole input-frame/segmented presenters; ordinary beside requests generalize to show; checkable aligned/separated requests resolve to flushed without synthetic label/value areas |

### Collapsible color

| Backend | Color behavior |
|---|---|
| Vuetify | Native title-background color in both collapsed and expanded states; body surface is unchanged. |

### Upload allocation

| Backend | Minimum inline size | Minimum block size | Compact / regular / large block size |
| --- | --- | --- | --- |
| Vuetify | 16rem | 8rem | 8 / 10 / 16rem |

### Upload integration

| Backend | Presentation and concrete adaptation |
|---|---|
| Vuetify | Native VInput/VField filled surface with integrated field label, upload artwork, VProgressLinear and VBtn. The interactive field frame receives drops across its full boundary; guarded acquisition and independent actions retain core ownership. Native label/focus/error treatment and bounded internal fitting apply throughout ready, busy and retained states |

### Notice variants

| Backend | Omitted | filled | outline | soft |
| --- | --- | --- | --- | --- |
| Vuetify | Tonal | Flat | Outlined | Tonal |

### Multiple selection

| Backend | Presentation |
| --- | --- |
| Vuetify | Native VSelect multiple with its built-in clear affordance and keyboard clearing. |

### Floating feedback integration

| Backend | Implementation |
|---|---|
| Vuetify | Native VSnackbar for toast; native VCard in the managed nonmodal viewport for rich notifications, avoiding snackbar touch-dismiss/content-live-region behavior for editable notifications |

### Default font families

| Backend | Family order |
|---|---|
| Vuetify | Roboto Variable |


## Checkable label and description alignment

Standalone checkbox/switch labels, hit targets and feedback keep native VCheckbox/VSwitch facilities. A backend-local ResizeObserver/animation-frame coordinator aligns native details and custom coexistence/tooltip-policy helper text to the actual label text, using logical padding for RTL. It does not shrink the native interaction target or introduce another validation owner. Ordinary SSR has no geometry work; browser coordination releases on unmount. Checkable direction detection reads outside its own VLocaleProvider so native direction classes cannot feed back into the detector. Group headings and option-description policy remain separate.

Business authors supply the existing UiField label/help and business value; no alignment CSS or new public prop is required. Verify short/wrapped labels, descriptions present/absent, requested sizes, narrow/wide fields and both text directions while preserving label activation, keyboard behavior, disabled state and help/error associations. Whole-field flushed/control-aligned/separated arrangements are implemented; see [strategy support](strategies.md) for resolution, alignment and responsive behavior.

Checkable validation recovery focuses the first enabled checkbox or selected enabled/first enabled radio without changing values. Named group/status and form fallbacks get temporary programmatic focusability with blur/disposal cleanup. Native options retain their toolkit indicators and feedback descriptions; fallback containers use the shared backend focus-visible treatment, including forced colors and scrolling containment. Group/field wrappers do not gain standing focusability merely from validation failure.
