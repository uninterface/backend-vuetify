# Selection, feedback and panels

## Multiple selection

UiMultiSelect uses VSelect multiple and displays each selected label as a native chip. Chips and long chip labels wrap within the input. Use the choices popup to deselect an individual choice or the native clear icon or keyboard to clear editable selections.

The field owns the complete string array and codecs translate business values. Clearing preserves loaded disabled selections and is available when editable memberships exist in a ready source. Missing selected choices remain visible and removable after a ready response. Pending and failed sources retain the current selections and block candidate edits.

The popup keeps its choices inside the owning modal's interaction scope. Selected values, available choices and source feedback are independent. See the core multiple-selection guide for source lifetime and validation.

## Inline feedback and record details

UiNotice and UiBadge use VAlert and noninteractive VChip. Severity never forces announcement: core supplies explicit off/polite/assertive policy. Badges are passive textual labels, not action chips or live counters.

UiKeyValueList/Item render dl/dt/dd with a two-column desktop arrangement and stacked labels/values below 40rem. Rich values remain opaque; business code supplies Intl formatting, empty/redacted wording and access policy. Exact spacing, typography and native theme colors are adapter presentation. Ordinary content needs no consumer stylesheet. Application-owned configuration and styles from the existing customization guide also cover these surfaces; there are no new business presentation knobs.

## Tabs and collapsibles

The bar uses VTabs/VTab, including native slider, typography and slide-group overflow. It omits the native window because separately placed UiTabPanel owns content. The controlled model disables forced native fallback selection. Captured keys supplement manual activation/disabled skipping and shared associations while retaining native presentation. Manual activation uses arrows/Home/End for focus and Enter/Space or pointer activation for selection. UiTab default slots supply labels, including passive icons/badges. UiTabsBinding and separately placed UiTabPanelBindings share one selection; no panel containment in the tab bar is required. Stable values preserve panels and disabled triggers are skipped. Full-height panels fill a definite business-owned allocation; their inner layout owns scrolling.


UiCollapsible uses actual VExpansionPanels/VExpansionPanel/VExpansionPanelTitle/VExpansionPanelText, preserving native indicators, overlay/elevation, typography and expand motion. The native group receives a controlled value and forwards requests to core. VExpansionPanelText is eager so native leave cleanup cannot destroy drafts; core independently gates lazy first mounting. Closed content is inert during exit motion. Rich summary content uses native inline-flex/wrapping/gap utilities. Each view owns a one-item native host; binding several views to an expansion control coordinates state without imposing a joined expansion-panel layout.

UiCollapsible accepts a plain label or noninteractive summary slot. The backend supplies the operable toggle; summary content must include meaningful accessible text and cannot contain nested buttons, links or inputs. Core resolves standalone v-model or UiCollapsibleBinding, including local disabled restrictions. No backend imports the expansion control. That control supports at-most-one or multiple expanded keys, preserving state across view unmount/remount.

UiTabPanel and UiCollapsible retain mounted content. Lazy defers only first mount. Collapsing does not stop validation or background work. Reveal content before focusing a field. Native motion, markup and theme treatment vary; application-level theme customization follows this backend's existing customization guide. Controls do not require business-side CSS.

## Collapsible color

Supports `collapsible.color.v1`. An explicit semantic color maps to VExpansionPanelTitle.color, including danger → error. Native title background/foreground treatment applies while collapsed and expanded. VExpansionPanel.bgColor is not set, so the content surface retains its native appearance. Omission removes the explicit title color.

## Verification and limits

Verify selection codecs, retained values, clearing and source states, notice urgency, passive badge semantics, definition-list associations, manual tab activation and lazy content retention. In a browser, check geometry, focus containment, visible focus and touch behavior. Check announcements with assistive technology. Use the core component references for shared behavior and the installed theme’s guidance for contrast.

For collapsible sections, exercise denied requests, accessible summary names, local disabled state, lazy retention and disposal. See [native testing](testing.md#run-the-backends-native-tests) for the source-checkout runner.

## Scrolling content and focus clearance

UiContent supports content/full height and named scrolling, with insets inside the scroll boundary. Use it when a content inset is intended. Use scrolling UiLayout/UiGridLayout for flush content; unpadded scrolling scopes adapt supported outward focus outlines inward without changing alignment. Padded content/card/modal surfaces reset that placement context. The backend keeps scroll-host and tab-panel focus indicators inward. Modal bodies own their own internal clearance and preserve native browser focus scrolling. Do not add another content inset solely to repair focus. Allocation-only layouts still add no content gutter. Native field interiors retain their focus treatment. Custom or third-party focus treatments need their own integration checks. See the core package’s `docs/guides/scrolling-content.md` guide. Browser clearance checks cover the public focus binding; native paint/custom-theme acceptance still requires browser verification.

Header-to-body separation is placed at the start of the body scroll area instead of the end of the header, preserving total separation while protecting a first focused child.

## Notice dismissal and presentation

UiNotice uses VAlert with its native severity icons and close button. A controlled modelValue remains true; update:modelValue requests business-owned dismissal, so declined requests do not hide content. Core's resolved announcement policy overrides the native alert role. Recovery actions occupy a wrapping row in the content column rather than the max-content append column, keeping multiple actions usable in narrow hosts.

Dismissal is opt-in through dismissible. The close control requests dismissal; business code decides visibility and focus handoff. Recovery actions retain source and tab order with backend-owned spacing and wrapping below the message. No automatic dismissal, timer or Escape handling is installed. Rich custom actions own their internal layout. Exercise denied, repeated and accepted dismissal, then change the language and verify content retention. In a browser, dismiss with the keyboard and check that the application restores focus to the intended target. Verify narrow LTR and RTL layouts and check announcements with assistive technology.

## Notice presentation

Default and soft explicitly select native tonal; filled maps to flat and outline to outlined. Standard kinds retain native type-derived icons. A custom icon slot uses native prepend with automatic icon disabled, including when the supplied slot is empty. Custom has no native type/icon; colors map directly (danger → error). Omitted custom color is neutral; filled uses native surface-variant, while other treatments retain native neutral defaults. Ordinary links on filled notices inherit foreground.

UiNotice now supports custom kind/color and filled/outline/soft variants. The core rejects color on standard kinds and rejects undeclared or unsupported theme roles. A supplied icon slot always wins, even if empty; otherwise standard kinds supply their icon and custom supplies none. Icons are decorative/noninteractive; message text carries meaning. Declaration requires notice.color.v1, notice.variant.v1 and notice.icon.v1 alongside notice.v1. Applications customize through the existing backend theme setup; no business-side CSS is required. Native theme defaults remain in force unless a notice requests a treatment.

Focused five-backend DOM checks cover slot replacement, empty-slot suppression, neutral/custom colors, rejected combinations, retained content/focus and controlled dismissal. Browser cases cover variant/color/mode combinations, narrow geometry, icons and keyboard dismissal. Execution/visual acceptance must be recorded separately; passing DOM checks does not establish paint, contrast or assistive-technology conformance. See the shared feedback guide in `@uninterface/uninterface` (`docs/guides/feedback-and-details.md`).


### Notice action alignment

When the action row starts with a directly rendered text UiButton, its leading content aligns with the message column by hanging the native button inset into the notice's leading space. The row moves as a unit: button padding, height, hit targets, hover/focus treatment and gaps remain native. Logical margins support RTL; filled/outline/soft/icon-led rows retain ordinary boundary alignment. A leading icon or loading indicator is the aligned content; subsequent labels keep native icon/indicator spacing. Rich compositions own their internal alignment. Wrapped rows share the same origin; differently sized controls retain their own padding.

Without a notice icon, hanging is limited to the available inset so targets and focus remain inside the frame; exact label alignment can yield to containment. Applications that customize button padding can set `--vuetify-notice-action-inset` on `.vuetify-notice-actions` to the leading button's padding plus border inset. Native size mappings supply the ordinary value; this is backend-owned integration, not a business prop. If changing notice insets too, review target/focus containment and the backend's private maximum-hang rule.

Check wide/narrow LTR and RTL, native size levels, a single action, multiple/wrapped actions, explicit variants, loading and keyboard focus. DOM checks verify selectors match live button hosts; browser geometry and visual acceptance remain separate.

## Toast and notification targets

Supports core createUiToastTarget/createUiNotificationTarget and feedback.floating.v1. Targets render automatically in their creation scope, with configurable admission/capacity/duration and per-delivery Vue content. Uses VSnackbar for toasts and a native VCard within the managed nonmodal viewport for rich notifications. The latter avoids snackbar touch-dismiss and internal content-live-region behavior for editing workflows. Toast content uses the native header slot so a separate summary region owns announcement; native global stack allocation is disabled for the managed surface. Core owns the sole duration clock and summary announcement policy; native auto-dismiss timers are disabled. The core package documents full options in docs/guides/toasts-and-notifications.md. Configure appearance through this backend's existing customization setup and style.css; queue options belong to target creation, not toolkit-global service configuration. Verify concurrent rich forms, changing-height content, modal scope, narrow/RTL layout and native exit behavior before claiming browser/AT acceptance.

Toast uses native snackbar content typography and actions integration; its header slot avoids announcing interactive rich content as a live region. Notifications use native elevated VCard, VCardText, VCardActions and append close icon with VFadeTransition/appear. Native VSnackbar entry/exit remains intact. The viewport reserves elevation/focus clearance. Native snackbar timer display is optional and off by default; the managed adapter currently leaves it off. Native/source DOM regressions are in `testing/feedback-presentation.test.mjs`; actual geometry and motion still require browser acceptance.

### Toast and notification focus

Both kinds implement the core backend delivery focus standard. A named, keyboard-focusable content region represents the delivery: direct keyboard focus there draws the indicator around the complete toast/notification surface, using Vuetify’s on-surface focus outline with its overlay multiplier. The body has no duplicate inner outline. Moving into a rich input, link, close button or footer action removes the outer cue and retains the focused control's own treatment. Returning to the content region restores the outer cue. There is no extra equivalent root Tab stop and arrival does not take focus. Forced colors use `Highlight`; the fallback viewport has its own inward indicator.

The outer indicator preserves native shadows/elevation. Focus anywhere inside still follows the configured timer-pause policy. Verify both Tab directions, light/dark, narrow LTR/RTL, forced colors and viewport clearance. DOM selector checks do not establish browser paint or assistive-technology acceptance.
