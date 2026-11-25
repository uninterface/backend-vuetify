# Segmented selection

UiSegmentedSelect uses VField containing text-style VBtnToggle/VBtn with single selection and radio semantics. Core supplies a UiChoiceGroupViewProps binding and owns field updates, validation, source state and retained values. The backend owns actual markup, focus and theme presentation.

The public component requires an ordinary UiField without group and an owner-supplied entry control. Horizontal is the default, vertical is optional. The strip scrolls locally when labels exceed the available width; it does not open a popup or truncate the choice set. Standard field feedback and size strategies remain supported. Native defaults and application theme configuration supply visual values; no business CSS is required.

Radio semantics preserve undefined/no selection and empty-string keys, skip disabled choices during arrow navigation, and retain the selected value when activated again. Local size strategies use native size APIs and preserve query barriers. Light/dark appearance follows the backend theme.

Automated regressions cover selection, codec integration, keyboard events, feedback and focus. Browser checks cover label and scrollbar geometry and focused choice visibility on resize. Assistive-technology acceptance remains a separate check.

The native field provides one surface; individual segments use `text` rather than `outlined`/`divided` treatment. The group fills its content allocation with flexible buttons and intrinsic label minima. Selection uses native selected text color without a persistent fill. The adapter sets `--v-activated-opacity: 0` on these buttons only; native hover/focus overlays, ripple and forced-colors treatment remain in use.

A sole segmented editor owns the native floating label, kept raised even without selection to clear the visible choices. Above/hidden label strategies use an associated external label. The VField variant follows application defaults; singleLine is false to prevent overlap. UiField retains feedback ownership. Short single-line segments fit the field content-height budget instead of adding a standalone button-group height above the label padding. Descriptions, vertical choices and scrollbars can grow naturally. See [native field integration](presentation.md#segmented-selection-as-a-native-field) for details and evidence limits.

## Field alignment

Follow the core field alignment discipline (`@uninterface/uninterface` documentation: `docs/guides/field-alignment.md`). Navbar field peers anchor at block-start, so tall editors and feedback grow downward. Ordinary one-line filled and outlined segmented fields match Vuetify's peer field heights at compact (40 px), comfortable (48 px) and default (56 px) density. Option text uses the field value's font size, line height, letter spacing and vertical alignment. The scroll area uses reserved space inside the field whenever it fits without moving the choice row and immediately below it otherwise. Field height and scrollbar clearance stay stable whether the choices fit or scroll.


## Ordinary field label integration

UiSegmentedSelect is one composite editor inside an ordinary UiField, not a grouped field. Remove `group` from consumers; explicit group is rejected. The backend still owns its internal named radiogroup and individual option names, requiredness, feedback associations and keyboard behavior. Overall label placement follows ordinary field strategies, retaining this backend's existing adaptations. Hidden preserves the accessible name. Activating an external field label focuses the selected enabled option, then the first available option or named fallback, without selecting a value; disabled state blocks focus. Native integrated labels retain their existing interaction. This distinction also applies to settings-container responsive strategies.
