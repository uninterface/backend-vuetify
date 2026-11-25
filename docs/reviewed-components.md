# Component presentation

Vuetify uses VSwitch, native anchors with semantic text colors, VBreadcrumbs, VTooltip/VMenu, VDatePicker and VTimePicker. Native time selection edits seconds at most; the lossless text editor supports milliseconds and extended-hour ranges.

Password reveal preserves the editor and uses a named non-submit reveal action. Switches follow the shared switch-then-label arrangement. Search source/selection and temporal validation remain core-owned. Tooltips and suggestions use popup targets inside their owning modal. Directly owned tooltips paint below the header and footer. A managed tooltip requires at least half of its anchor area visible after clipping and overlap by known layout regions. File chooser/drop accepts one file; uploads use an application transport. Preview URLs are resolved and released by core.

The suggestions popup uses a direct `VSheet` inside `VMenu` so Vuetify paints the menu background, corners, and shadow around both the scrollable list and its status message.

Temporal inputs use a normal backend text field with a leading calendar/clock button. The button opens a floating picker; Alt+ArrowDown opens it from the editor, and Escape closes it. Selection and explicit dismissal return focus to the trigger. Disabled/readonly inputs cannot open the picker. Popups use the application/modal overlay target. Vuetify composes VTextField’s prepend-inner slot with VBtn/VMenu, VCard, VDatePicker and [VTimePicker](https://vuetifyjs.com/en/components/time-pickers/), following the field/menu structure used by [VDateInput](https://vuetifyjs.com/en/components/date-inputs/). VDateInput’s blur parsing may clear invalid text or clamp a date, so the adapter keeps the outer field lossless. VTimePicker receives only valid within-day values through seconds; milliseconds remain text-owned and survive selection. Extended-hour range endpoints stay editable as text.

Picker candidates bypass the display-text parser and are validated by the owning control. Native selection is checked before commitment; a toolkit calendar may still display a candidate that a combined datetime or interval rule later rejects. Date and time may be staged independently before a complete datetime is committed. Explicit open boundaries and extended hours remain text/control semantics, not claims of native picker support.

Use the existing application-owned [customization guide](customization.md) for theme setup and stylesheet ordering. These components consume the same native theme configuration; no extra business stylesheet or generic styling wrapper is required. Keep overrides after the backend stylesheet and test teleported popup coverage in light/dark modes. Do not style only the component wrapper when the actual editor or popup lives elsewhere.

Shared control and built-DOM checks exercise state, naming, calendar/time/datetime selection, preservation of milliseconds and invalid text, disabled/readonly behavior, Escape dismissal and focus return, file replacement and tooltip associations. Check picker geometry, touch and keyboard behavior, hover continuity, modal stacking and assistive technology in the intended environment.

Suggestions compose VMenu with VList/VListItem. The external editor retains focus; VListItem supplies native disabled/active presentation. Shared query freshness does not add toolkit filtering.

Breadcrumbs use VBreadcrumbs, VBreadcrumbsItem and VBreadcrumbsDivider, with native breadcrumb anchor classes rather than generic links. Ancestors retain the native hover underline; the current item receives native active/disabled treatment with no destination. An ordered list and hidden decorative dividers preserve breadcrumb semantics. Link attributes and capture handlers target the anchor directly.

Temporal ranges compose both endpoints, separator and supporting actions inside the backend UiInputFrame view. Endpoint editors retain their own editing behavior and share one surface; at narrow allocations they stack inside that frame. Owned picker state keeps the frame visually engaged while popup focus is outside it. A leading boundary-mode selector offers only allowed combinations: both specified, start only, end only, unrestricted. Mode changes retain drafts; external synchronization/reset and Clear discard them. Every mode retains the start–end arrangement and separator: unavailable endpoints show native infinity chips with endpoint-specific accessible names. Unrestricted is distinct from an absent whole value. The selector uses VMenu/VList with range icons, native keyboard handling and shared-frame engagement. The overnight indicator is an icon with localized tooltip and accessible name. Surplus width follows both endpoints rather than expanding infinity chips or the separator; narrow layouts place endpoints on two rows and retain the separator beside the end. The compact × action clears the whole range. These actions obey disabled/readonly state; an empty draft never implicitly opens a boundary.

Pickers dismiss with Escape or outside click; date selection dismisses automatically. No added Close footer is rendered. Picker triggers occupy the leading side of the input. Their localized “Choose…” strings name the icon button and popup for assistive technology; the adapter does not add a visible popup heading from those strings.

File Clear uses VFileInput’s native clear slot with VIcon artwork rendered as a keyboard-operable button; readonly and disabled native presentation may hide it. Range endpoints use the plain VTextField variant without nested labels/details, while the enclosing VField supplies the shared surface. Vuetify’s filled/focused/error descendant selectors also reach decoration inside nested plain fields. Explicit parent-frame participants therefore hide only their own native overlay and outline layers; the outer frame retains its native background, underline and state treatments. This applies to participating text fields generally, not just temporal ranges. Ordinary text-field defaults remain unchanged.

UiUploadRegion uses a workflow binding with retained-field or service destinations. Optional progress, preview and actions are arranged entirely by this backend. Vuetify composes VInput/VField with the default filled surface and integrated UiField label, native upload artwork, VProgressLinear and VBtn. The frame remains interactive; core guards the independent chooser and full-frame drops. Native field density, label spacing, focus and error presentation remain, with bounded internal layouts that fit optional contents without scrolling. Focus follows the contained control; eligible drag-over uses the native focused underline in the primary color. Disabled regions still intercept drops to prevent navigation. The complete named region receives drops and fits its contents within an explicit extent without scrolling; optional contents no longer reserve blank rows. Upload/association locks persist when progress or preview is absent. Focus moves to an available chooser/action or the region when a focused action disappears. Preview URL lifetime remains core-owned; controller lifetime belongs to the business composition.

The upload group is excluded from ordinary Tab traversal (tabindex=-1 while enabled); Tab visits the chooser/actions directly. Named fallback focus remains available when no action accepts focus. Native VBtn local focus overlays/borders and VField state treatment are retained.

The upload boundary retains VField's native disabled opacity and focused treatment. Disabled groups have no wrapper tabindex, and focused state cannot paint through disabled. Pointer events remain enabled on the drop boundary solely to intercept blocked drops; acquisition and actions remain guarded. Shared input-frame wrappers also lose their focus target when disabled; live disabling releases internal surface focus, and upload recovery cannot focus a disabled region.

Verify appearance and geometry in the browser, including zoom and RTL.

The outer text editors use year-month-day presentation by default, retain permissive numeric parsing, and leave calendar language with application localization. Text parsing accepts surrounding/repeated whitespace and excess clock precision while preserving invalid drafts; canonical value formats remain unchanged.

Bounded date ranges use native `VDatePicker multiple="range"` behind one shared leading calendar trigger. Native range highlighting, reverse selection and calendar navigation are retained. The first selection stays local to the picker; completing the pair updates both control endpoints atomically and closes the popup. Vuetify emits an empty selection when the same date is clicked a second time; the adapter interprets that specific transition as a complete inclusive one-day range. No confirmation or Close action is added. Escape/outside dismissal discards an incomplete picker selection without changing text drafts. External endpoint updates replace that pending selection, while presentation changes preserve it. Invalid text is not coerced into a calendar date. Alt+ArrowDown from either endpoint opens the shared picker.

Open-ended date ranges retain scalar native pickers. Vuetify's VTimePicker has no range mode and there is no combined date-time range picker; time and date-time ranges retain separate native endpoint pickers. Calendar language remains application-owned independently of the outer text display order.

Temporal range-mode arrows use VIcon with the installed MDI aliases: arrowleft/arrowright for one-sided modes and unfold rotated horizontally for bounded ranges. The next-day indicator uses the custom calendar +1 SVG; infinity is Unicode. Mode arrows use the installed native icon set without a new icon dependency.

Navigation submenus retain native VList/VListItem styling. The adapter's public stylesheet declares the complete native cascade-layer order before imports so bundled layer-statement hoisting cannot put the prose baseline above toolkit components. Semantic menu lists suppress their own markers and outer margins, including VList rendered as ul; native VList padding remains toolkit-owned. Ordinary prose lists and links retain their baseline styling.

A sole UiInputFrame uses native VInput density/layout and owns the field's native VField floating label, including grouped temporal ranges and explicit UiTextInput compositions. Its inner editors do not register separate field labels or feedback presenters. The label stays floated because compound content can remain visible even for an empty value; this is independent of business dirty/baseline state. Clicking it focuses an available part. Above/hidden label strategies remain honored, required annotations appear on the owning label, and UiField retains group requirement descriptions and help/error feedback. Ordinary groups and fields containing multiple sibling frames keep one external group label. A nested UiField establishes its own presentation context.

### Concise upload states

The region shows its chooser/artwork only in the ready state. Working and retained states display file/progress or file/preview with available actions. Recovery uses one short error and a row of actions. Progress labels remain accessible without a duplicate visible caption; preview displays the filename once. Embedded previews use a compact file summary. Ordinary demo uploads succeed; deliberate failure is available in the separate Upload failure simulation and test fixtures.

This backend's compact/regular/large allocations are currently 8/10/16rem. The native upload artwork uses a 3rem icon (2rem for compact/fill), with one backend-owned gap before the chooser. Native field padding reserves space for the raised label within the allocation. Retained preview content uses a bounded grid cell, avoiding inline-image baseline overflow. There is no shared minimum. The allocation remains stable across states; the host must respect the backend minimum size; content never introduces scrolling. These are adapter defaults, not business-authored dimensions or browser geometry acceptance.

### Image-only preview

UiImagePreview uses the container allocation or explicit dimensions, with contain by default and stretch when requested. It has no border, avatar shape, filename, caption or actions. Missing/failed content uses an accessible broken-image glyph, without visible failure prose. A parent with definite bounds retains its rectangle through failure; auto sizing cannot reserve unknown intrinsic dimensions before loading. Embedded upload previews use their region's available bounds instead of a fixed thumbnail limit. File metadata presentation remains separate.

VImg supplies native loading, natural aspect ratio and contain. Its image receives object-fit:fill for stretch; native rounded/transition presentation is suppressed while VResponsive's internal overflow containment is preserved and an adapted SVG supplies failure presentation. DOM checks pass separately from browser geometry/visual acceptance.


Upload regions declare minimum inline/block allocations and do not scroll internally. Long file/error text is abbreviated with full DOM text and title retained; recovery keeps its actions visible. This backend declares a minimum inline size of 16rem and block size of 8rem; hosts, including fill allocations, must respect those constraints. Browser acceptance of fitting is separate from DOM workflow checks.


### Upload minimum-size audit

Fill uses the compact upload-icon size so the chooser fits the minimum height as well as the compact preset. Delivery failures use the same single error line and recovery-action arrangement as acquisition failures, avoiding an extra filename row.

In a browser, check compact, regular, large and fill allocations at the minimum and at narrow widths. Repeat at each supported control size with known, unknown and hidden progress, long file names and errors, delivery retry, portrait and landscape previews, and no preview. Verify that visible descendants stay within the allocated region and that actions remain reachable.


### Read-only preview field

UiPreviewRegion uses readonly VInput and VField with the native default filled presentation, matching ordinary text and compound fields. Its shaded surface and bottom border replace the previously forced full outline. UiField still owns the integrated label and feedback; the label stays raised above the bounded preview content. The preview remains intrinsically noneditable, without a text input, editing actions or an added tab stop. Empty/image/failure states retain the preview allocation.


### Filled upload field

UiUploadRegion now shares the filled field surface used by ordinary Vuetify controls and UiPreviewRegion throughout ready, busy, recovery and occupied states. The full VField is the named drop boundary, including the label area; labels come from UiField and remain strategy-aware. Label clicks focus the available chooser/action without opening a file picker. Independent actions bypass native single-editor click handling. Disabled drops still prevent navigation, and acquisition locks remain independent of Cancel/Remove availability. The 16rem inline / 8rem block minimum and 8/10/16rem presets are unchanged; no internal scrolling is introduced. Focused upload DOM checks cover the native frame, integrated label, label focus and existing guarded workflow.



### Transfer failure and retry presentation

UiUploadProgress presents both active transfer progress/Cancel and transfer failure/Cancel/Retry. Failed transfers have concise feedback and available native Cancel and Retry buttons, without a progress indicator. The file name is visible inside the progress/recovery presentation and identifies the transfer group; Retry describes its failure. The view invokes guarded producer callbacks and never creates a task. The backend retains its existing button and progress primitives and arranges feedback/actions within the allocated width.

UiUploadRegion composes the same progress view for transfer recovery, without duplicating the filename, error or Retry. Acquisition rejection and delivery failure remain region-owned. Omitting the progress indicator does not omit essential transfer feedback or selected Retry; cancellation is not an error, but an owner may retain a Retry action. Recovery layout responds to recovery participation, including cancellation without an error message. Keyboard context is preserved across standalone Retry/Cancel changes; region focus coordination includes the chooser. DOM checks cover wiring and lifetime; browser fitting and assistive-technology checks remain separate.

The Files demo's Supporting functions section contains Previews beside the independent Upload progress and Upload failure cards; the two top cards align, and no extra Upload simulation heading is rendered. Both use UiUploadProgress; the failure case has no chooser, region frame or playback controls. Each retry deliberately fails again for presentation review.

### Native focus ownership

The file input's Clear button draws its keyboard focus outline inside the
button. Vuetify's native clearable slot clips paint outside the action.

Tooltip placement uses Vuetify's target facility. Uninterface owns the anchor's hover/focus listeners and accessible description; the tooltip does not acquire native activator focus restoration, which could pull Tab back to the editor.

Multiple-selection and temporal popups consume Escape while open, close, and return focus to their trigger. Popup content handles the key during capture, before the native select can change its menu state. A closed temporal trigger leaves Escape available to its surroundings. DOM regressions exercise trigger and popup routes; native dialog cancellation still needs browser acceptance.

Vuetify's floating field labels have pointer-events disabled. Pointer acceptance clicks their visible position through the frame; the compound frame forwards clicks on its otherwise empty content area to its first editor. Child controls retain their own actions.


Progress and transfer failure share a filename row above a context/action area. Failure uses the native error foreground. Standalone messages wrap completely, including unbroken text; actions stay at logical end and wrap below if necessary. UiUploadRegion keeps an abbreviated summary and coordinates its chooser beside identity, leaving the lower row for feedback/actions. Full DOM text/title and Retry association remain.


Transfer-failure text uses `--v-theme-error`, with color and mode mapping owned by the theme. The optional shared focus helper retains keyboard context across the brief activity-to-failure rendering gap, including an immediately repeated failed Retry. Verify focus after a failure and an immediate failed retry.
