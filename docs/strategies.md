# Presentation strategies

For application authors choosing optional presentation preferences with this backend. Use `UiStrategy` and the common factories from `@uninterface/uninterface`; no backend imports or CSS are needed in business components. Core's strategy contract and usage guide define attachment, custom queries, scope and blocking.

```vue
<UiStrategy :use="uiControlSize(-1)">
  <UiField :field="name" label="Name"><UiTextInput /></UiField>
  <UiButton>Continue</UiButton>
</UiStrategy>
```

Import the components and `uiControlSize` from `@uninterface/uninterface`, and create `name` with `createUiFieldControl('')`. Apply strategies to an existing region; UiStrategy adds no DOM wrapper.

## Control size

| Controls | Native levels and mapping |
|---|---|
| UiTextInput, UiSelect, UiSegmentedSelect, UiCheckbox | -2 / -1 / 0 → compact / comfortable / default density |
| UiButton | -2 / -1 / 0 / 1 / 2 → x-small / small / default / large / x-large |

Editor size changes occupied density rather than uniformly scaling text or checkbox artwork. Requests -2/-1 map to native compact/comfortable density; zero and positive requests map to default density. Native label and feedback typography stays unchanged by density. The adapter does not invent an enlarged native editor.

Segmented option captions use field value typography. One-line segmented editor surfaces match peer field heights at each density. When a floating label and choice targets leave insufficient room for the native scrollbar, the scroll area extends below the field surface with stable space before feedback, whether or not the choices currently overflow.

Zero requests ordinary size. Levels are ordinal, not multipliers or additive offsets. All five size requests participate in agreement; the adapter maps the agreed level to its native scale. A three-level scale maps -2/-1 to small, 0 to ordinary and 1/2 to large. Common queries require supported contributions to agree; conflicting values preserve ordinary presentation. Omit strategies for normal use.

## Field presentation

Five common field queries participate, with per-field label support:

| Factory | Values and effect |
|---|---|
| uiCheckablePresentation | adapt / flushed / control-aligned / separated; checkable labels and group titles stay visible |
| uiFieldLabels | show / above / beside / beside-far / beside-near / floating / hidden; unsupported detail generalizes to beside/show |
| uiRequiredAnnotations | prefix / suffix / yes / no; presentation without changing required semantics |
| uiFieldHelp | together / replace-help; replace help only while a visible error is displayed |
| uiValidationFailure | none / show / show-below / show-embedded / show-tooltip; select failure visibility and placement |

Vuetify supports above through VLabel. Its native ordinary-field APIs have no equivalent beside-label position: beside, beside-far and beside-near generalize to show and retain integrated native labels. Resolution converts these ordinary requests to the concrete integrated-label treatment before rendering, so default/adapt checkables use flushed presentation. Checkable control-aligned and separated are unsupported because the native ordinary presentation establishes no separate label/value columns. Both requests resolve through adapt to flushed; no synthetic columns are created. Integrated ordinary labels do not acquire a manufactured beside column. Native widget error-messages/details supply below feedback; details below do not count as embedded. Helper coexistence uses coordinated external feedback; ordinary replacement retains native details.

Show retains ordinary backend feedback; show-below is supported, show-embedded renders below, and show-tooltip uses an anchored error bubble. The error bubble opens automatically while an issue is present. It appears when at least 50% of the editor anchor is visible after clipping and overlap by known layout regions. The accessible error description persists while the bubble is hidden. In a popover that stacks above its owning modal’s header and footer, the error appears below the field inside the popover. Embedded means the error message itself inside the control surface; this backend does not currently implement it. None suppresses field messages while retaining native invalid-state styling and preserving aria-invalid, requiredness, validation and submission behavior. Hidden message description IDs are removed, and help is restored. Form submission summaries remain independent.

All common requests agree before native fulfillment. Unsupported label detail generalizes through beside/show; failure placement generalizes to show. Show enables default visible treatment without imposing a location; omission preserves backend defaults. Core recommendations are not automatically applied declarations. Conflicting supported requests retain ordinary presentation. Reactive changes preserve editor identity, draft and focus. Required annotations yes uses this backend’s default suffix placement; optional annotations remain deferred.

Floating explicitly selects native integrated floating labels for text/select controls, a sole UiSegmentedSelect in an ordinary field, and a sole UiInputFrame including compound grouped fields. Frame and segmented labels stay floated to clear always-visible content. Checkbox and ordinary group requests generalize to show; multiple sibling frames retain one external group label. Hidden uses a visually hidden associated VLabel for ordinary non-checkable fields; checkable labels/titles stay visible. Tooltip uses VTooltip anchored to the field editor.

Resolution follows agreement on original intent. Before rendering, general show/yes/beside/adapt values, omitted preferences and unsupported detail become concrete supported treatments. Equivalent resolved presentations share native integration and geometry; renderers do not implement a separate backend-default path. Required annotations resolve to prefix/suffix/no and failure messages to a supported visible mode or none. Reactive native configuration is read during resolution.

Omitted strategies add no presentation preference. Defaults belong to this backend and its supported application configuration, rather than a fixed common strategy value.

## Verification

Check every documented level against the ordinary control, then remove the declaration and verify recovery. Change preferences while editing: drafts, control identity and focus must survive. Block `uiControlSizeQuery` in a nested UiStrategy and verify that inherited sizing stops while other concerns remain. Real-browser checks are needed for dimensions, visible focus and responsive arrangements; simulated DOM checks alone do not establish those properties.

[Documentation index](README.md) · [Presentation](presentation.md)

## Hierarchy

uiHierarchyLevel applies to card nodes. Explicit UiCard.level overrides the regional answer; disagreement/no answer uses zero. Agreement compares all five original requests before the permitted -2 to -1 adaptation. Targets, depth, stopAt and family/query blocking remain effective. See [card presentation](presentation.md#cards-and-hierarchy) for native mappings.

## Card presentation

uiCardPresentation configures all five level treatments independently of uiHierarchyLevel. All shared options are fulfilled; see [cards and hierarchy](presentation.md#cards-and-hierarchy). Partial maps retain core-selected defaults. Whole-profile semantic unanimity governs overlapping declarations; disagreement/no answer or blocking restores the default map. Family/query barriers and target/depth/stopAt scopes apply without native CSS-context leakage. Explicit card color overrides the map for that card; null selects neutral. Changing a profile does not remount content or alter child control sizes.

## Layout density

UiLayout, UiFlowLayout and UiGridLayout support `uiLayoutDensity(-1 | 0 | 1)` for peer separation. -1 maps to `ga-2` plus the local `vuetify-compact-layout` accommodation; 0 preserves `ga-4`; 1 maps to `ga-6`. These are backend fulfillment values, not business-author inputs. Zero/no answer uses the original default; supported conflicting answers retain that default. Both grid axes use the selected spacing. Native tokens/classes remain application-theme controlled where used.

Density does not scale checkbox surfaces or hit targets, change typography or content padding, or separate UiRegionLayout allocations. Nested layouts honor logical targets, depth, stopAt and query barriers without inherited CSS density. See `@uninterface/uninterface` documentation at `docs/guides/layout-density.md`. Shared DOM tests verify all levels, restoration, scoped barriers and retained input state/focus; browser geometry is a separate acceptance check.

### Compact standalone checkbox rows

A direct UiField/UiCheckbox item in a compact UiLayout, UiFlowLayout or UiGridLayout uses its native `--v-selection-control-size` as the checkbox row minimum, instead of VCheckbox's taller `--v-input-control-height`. With uncustomized default density, this removes the surplus 56px row allocation around the 40px selection target; the hit target remains 40px. Explicit control-size strategies still choose native selection sizes. Labels can grow/wrap naturally, and native helper/error details remain available.

The adapter keeps VCheckbox and its label, feedback, keyboard/focus and validation wiring. It does not switch native controls or force compact control density. The stylesheet matches only a compact allocation's immediate field/editor/adapter-checkbox chain; nested layouts (including scoped defaults and resets), frame/content wrappers, native third-party checkboxes and choice-group items are untouched. An opaque wrapper is intentionally outside this adaptation. No business CSS or additional strategy is needed for the Shared input frame example.

The backend DOM regression matches the actual built CSS selector to rendered checkbox rows and checks defaults, nested boundaries, control size, state, focus and validation feedback. The backend browser regression compares row and hit-area heights against UiCheckboxGroup at desktop/mobile widths. Browser execution remains environment-dependent and is not implied by DOM checks.

### Checkable-control labels

UiCheckbox and UiSwitch use flushed presentation. The shared strategy vocabulary still accepts adapt/flushed/control-aligned/separated requests; Vuetify supports only flushed and treats the two column modes as unsupported. Adapt first resolves effective ordinary label placement, including reactive native defaults, general values and unsupported requests. It then selects control-aligned for effective beside placement or flushed otherwise. Unsupported control-aligned/separated requests fall back through adapt to flushed before rendering. All standalone labels and group titles remain visible under hidden. Radio/checkbox option labels remain adjacent and group titles remain above their options. Standalone checkbox/switch labels remain adjacent. Standalone descriptions retain label-text alignment; group descriptions remain associated with their options. Size, markers and values retain their own behavior.

This integrates shared checkable requests with Vuetify's flushed-only support. Verify unsupported column requests preserve flushed geometry, all label modes and restoration, required markers, value/focus retention and label activation; browser checks must also cover narrow/wide widths, wrapping and RTL. DOM integration checks alone do not establish visual geometry.


## Button width

uiButtonWidth supports content/full for standalone text-labelled buttons. Full stretches both the containing host and actionable surface to the parent allocation; content retains intrinsic width. Icon-only and parent-input-frame actions keep their geometry. Omission/conflicting answers preserve defaults. Native sizing, focus, disabled/loading and action behavior remain unchanged. The core strategy guide documents scope and barriers.

## Docked drawer motion

Docked drawers retain their resolved extent while the docking grid track opens or closes. The surface uses the existing backend drawer motion; allocation motion uses the same timing. Exit keeps the surface mounted and visible until motion settles, with interaction disabled. Reduced motion disables both transitions. Resizing uses immediate geometry rather than repeatedly animating the allocation. Popups retain their existing overlay hosting. Verify repeated opening, Close/Escape, focus return, retained content, all edges and responsive panel/docked changes separately from human visual acceptance.
