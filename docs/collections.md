# Collection presentation

UiList, UiTable and UiPaginator implement `list.view.v1`, `table.view.v1` and `paginator.view.v1`. UiTableColumn is a logical core declaration. The application owns the shared list session and explicitly loads/disposes it. Views never load on mounting or reprocess accepted source rows.

VDataTableServer supplies native sorting headers around a controlled body of accepted rows; VCheckboxBtn, VNumberInput and VSelect supply other controls. No native row slicing or listbox row activation is introduced.

Core supplies localized status, ordered query updates, shared announcement/automatic continuation coordination and guarded requests. The adapter owns actual semantic/scroll/focus targets. Count and minimum-width grids use adapter-owned spacing; height full consumes a bounded parent. Selection has dedicated controls and nested actions do not activate rows. Cursor navigation never fabricates totals or page numbers.

Use the backend's existing application configuration and stable stylesheet customization workflow; collections inherit native text, colors and control presentation. No separate collection provider or required business stylesheet is introduced. Layout gaps are currently adapter-owned; no collection-specific strategy catalogue is claimed.

Shared DOM tests cover selection/query/action synchronization, one request per sort/navigation, editor retention within the documented native limits, unknown service failures and mount/disposal ownership. Browser and visual acceptance apply to the workflows and environments actually exercised; neither DOM tests nor a mobile viewport establish full geometry, focus, physical-touch or assistive-technology conformance. The basic native-table server/hydration path is covered separately from card/declaration rendering; see the server-rendering scope below.

## Pagination

UiPaginator is navigation-only: first, previous, pages, next, last. All four boundary/directional controls remain present and are disabled when unsupported. Bounded page buttons require known positive bounds and supported jumps; cursor/unknown/non-jump/out-of-bounds retained results use compatible navigation without invented data or native auto-clamping.

UiPaginatorSizeSelect and UiPaginatorJumper are independent static backend views, not paginator slots or children. Size choices have numeric values and localized count-per-page labels. The jumper keeps raw text until Enter/blur, reports local errors accessibly and does not submit enclosing forms. Both borrow the existing session; no lifecycle reads or disposal. Applications render optional readonly statistics as ordinary text and may use UiCollectionFooter for backend-owned arrangement, or compose the independent controls themselves.

Normal pagination buttons, size selection and jumper inputs have the same or similar control-surface height. Labels sit inline rather than adding a label row; default tooltip feedback does not enlarge the row; explicitly selected below feedback may extend it. Native size/density settings are preferred, with backend-owned adaptation and no shared fixed pixel height. DOM checks establish naming/state and request behavior; browser geometry and assistive-technology acceptance remain separate.

Vuetify uses VPagination with first/last enabled and standalone VSelect/VTextField. Comfortable field density matches ordinary native pagination button height; fallback buttons use native large size. Native locale, icons and responsive page adaptation remain active.


## Height and scrolling

Content height expands with rows; an ancestor owns vertical scrolling. Full height fills a bounded parent allocation and automatically enables internal vertical scrolling and fixed/sticky table headers. Horizontal scrolling remains a separate explicit permission. Overflow-x and overflow-y are implemented separately; no vertical scrollbar is added to a content-height collection. Vuetify uses VDataTableServer fixed-header (through its native VTable wrapper). Its nested overflow wrapper is made visible on both axes so the named collection host owns scrolling.

DOM verification covers mode changes and native configuration; browser acceptance must check actual row scrolling, header pinning, horizontal alignment, resize, and return to content height.


## Shared collection presentation

UiCollectionView implements collection.view.v1 through UiTable for tables and a native card/list composition for cards-full-width/cards-grid. Field declarations and UiCollectionButton actions are shared. Selection checkboxes live inside UiCard headers; selected cards use the backend primary theme token for an inset outline, independent of keyboard focus. Native controls and application-owned theme customization still apply. Header/leading/media/overlay groups, labeled details and action footers are backend-owned; business declarations need no backend styles. Card-grid/full-width changes retain card identity. See the core collection-view guide for placement ordering, empty-output limits and editor lifetime; real-browser geometry acceptance remains separate from DOM verification.

## Empty presentation

UiEmpty implements `empty.v1` using VEmptyState (text/media/actions slots). It supports optional message, icon and actions slots, with no compulsory artwork or frame. Tables host successful-empty content in the native empty area or a spanning body row; lists/cards use the collection region. Existing custom empty slots replace the presentation. Loading/failure remain distinct, and the collection keeps its existing announcement owner. UiEmpty can also be used independently in cards and panels. Verify localized fallback, optional actions, narrow-width wrapping and theme behavior.

## Read failure placement

Core supplies default UiNotice error content with a Retry action; custom error slots remain supported. This backend hosts initial failures in the data area, replacement failures above retained data outside its scrollport, and append failures after existing items. Bounded allocation reserves space for the replacement notice and gives the remaining height to the rows. The controlled table body uses a spanning row for initial failure; append recovery follows the table within the collection scrollport. The collection owns one status announcement; the default notice does not announce again or offer dismissal. Recovery focus is coordinated through the actual table/list target. Verify narrow/RTL wrapping and fixed-header scrolling in a browser as well as DOM/control behavior.

## Header sorting

VDataTableServer supplies native sortable headers, keyboard interaction, direction icons and multi-sort priority badges. Controlled sortBy projects accepted shared clauses. Each native update submits only the changed clause, retaining query clauses not rendered in this table. The body slot renders source-returned rows and existing keyed editors directly; an empty native items input prevents a second row-processing authority. The native footer is hidden; collection pagination, selection, status and loading ownership remain shared. Mobile header substitution is disabled so the declared table columns remain present; explicit scrolling and the existing fit fallback still own narrow layouts. Header slots retain native content/icon classes, resizers and filter content without ordinary VBtn labels. Labels keep native header typography and filter/resizer events cannot trigger sorting. See [native server-side tables](https://vuetifyjs.com/en/components/data-tables/server-side-tables/).

Verify header typography before/after sorting, keyboard activation and focus, exactly one query per action, multi-sort and external updates, retained row editors, and resize/filter event isolation. DOM regressions establish query/state behavior; painted typography and native geometry require browser acceptance. Header-filter UI design remains separate.

## Header filtering

The adapter declares `table.column-filter.v1` and `table.column-sort.v1`. A supplied column filter slot opens from a compact header filter icon in the existing UiPopover integration; it is no longer rendered inline in the header. The business supplies `filterActive` and its editor/apply/clear policy. Core supplies localized names, expansion state, query wiring, close and lifetime; the backend owns the actual trigger, active/focus treatment and popup surface. Opening or dismissing never applies criteria or sorts. Popup body geometry does not participate in column measurement, but the trigger does. Native arrow/default presentation follows the existing popover adaptation.

The list controller's reactive `hasColumnSort` / `hasColumnFilter` report mounted active table controls, including UiCollectionView table mode. Cards do not contribute. These flags let a separate business section omit known duplicate controls while retaining cross-column and special filters. They aggregate any contributing view of the same binding, are false before client mount, and do not infer CSS visibility or identify individual supported keys.

Verify range editing/validation, active state after external changes, one source read per apply/clear, no query on open/dismiss/view switch, keyboard/focus, narrow/RTL headers and table/card changes. DOM coverage does not establish painted geometry or browser acceptance.

The trigger uses VBtn text/icon with native small sizing and primary active treatment; VDataTableServer never filters accepted rows locally.

During table loading, the interaction lock targets the data body; header anchors remain available so a live checkbox filter can stay open and issue further query changes. The existing loading overlay and collection busy state remain. Row interaction is blocked until loading finishes. Verify this with a delayed source as well as immediate fixtures.

## Collection footer

UiPaginator supplies native VPagination `total-visible`: up to 5 ordinarily, with a smaller window selected from allocated footer width (or the mobile policy when used independently). Vuetify may add ellipsis entries to the five-page window; the mobile window shows the current page. First/previous/next/last remain present. This bounds the navigation's intrinsic width instead of accepting the native automatic initial estimate based on viewport width, which can make a content-sized footer's paginator grow across the table and displace size/info/jumper onto other rows. Native button typography, density and interaction remain unchanged; the footer can still wrap when its available width requires it.

UiCollectionFooter implements `collection.footer.v1` with optional `info`, `size`, `paginator` and `jumper` slots. The end-aligned size → info → paginator → jumper arrangement follows native VDataTableFooter grouping (size → range → navigation), with jumper as an Uninterface addition. The current adapter uses VTable, so it does not insert VDataTableFooter or acquire its injected data engine. Existing numbered page controls remain: adopting the native footer's compact navigation would require a separate contract choice. See [Vuetify data tables](https://vuetifyjs.com/en/components/data-tables/basics/).

The backend renders supplied content once with stable wrappers and logical RTL alignment. Empty slots leave no internal gap; core omits a fully empty footer. Custom slot components retain their identity when other regions change. The footer does not format information, infer selection scope, load data, add a landmark/live announcement or create a scrollport, inset, frame or sticky region. The surrounding layout owns allocation and separation. Native control behavior and application customization continue through the supplied children.

Shared DOM regressions cover conditional slots, actual DOM order, attributes, retained custom jumper state/focus and one source read per commit with no reads on mounting/rearrangement. Narrow/wide/RTL geometry, control alignment and bounded scrolling still require browser visual acceptance.

### Space-aware footer allocation

[Vuetify data tables](https://vuetifyjs.com/en/components/data-tables/basics/) and native footer source establish end alignment and size-before-info order. Keep size-before-info order in the supporting content. The shared jumper → pagination group and fallback to isolated navigation are Uninterface adaptations.

The adapter measures the actual footer offer and supporting-slot intrinsic asks; its paginator reports preferred and compact-minimum width budgets based on native control metrics and navigation content. These requests are independent of the currently allocated page window, preventing allocation feedback. There is no fixed row-layout breakpoint. The complete preferred sequence is retained when it fits. Otherwise, information and page size pack above a shared jumper → pagination group when the compact minimum fits. That pair stays together at logical end with the normal backend gap; it mirrors in RTL. If native controls need more room, supporting slots pack above isolated navigation. Empty slots consume no allocation. A backend gap of spare room is required before merging; settled native overflow can reject an estimated shared fit without shrinking controls or repeatedly retrying that allocation.

Navigation consumes its actual allocated width and may show neighboring pages even in a multi-row footer. All supplied slots remain visible. Explicit row allocation changes actual DOM order without replacing the keyed control instances; focus/draft/text selection are preserved during retained editor movement and relocation blur does not commit. Truly removed controls follow their normal lifetime. CSS and measurement operate on backend-owned wrappers; arbitrary custom controls are not interpreted.

Shared allocation tests cover every slot subset and width boundaries. DOM regressions cover wide/narrow/wide, all nonempty subsets, retained input state/focus, no reads on layout changes, RTL and observer disposal. Browser tests check actual row ordering, navigation containment and draft commit. Real-browser execution and visual acceptance remain separate from simulated measurements.


## Compact jumper and validation feedback

UiPaginatorJumper shows approximately five digit cells plus native padding/borders. The inline localized label adds its own width. Longer numbers remain editable; this is not maxlength or a change to page bounds. Width follows the current input font, while native control height remains unchanged.

The jumper resolves `uiValidationFailure` from `@uninterface/uninterface` at `paginator-jumper`. Omission/`show` defaults to tooltip; explicit `show-tooltip` and `show-below` are supported. Unsupported `show-embedded` falls back to the tooltip default. `none` hides the error treatment/description without clearing `aria-invalid` or allowing an invalid page request. Invalid Enter or blur requests the tooltip automatically. It appears while at least 50% of the input anchor is visible. Editing clears the feedback, and the bubble takes no space in the footer. Keep the input mounted and focused when changing strategy. Explicit below feedback can enlarge its row.

Vuetify uses VTooltip and its native arrowless treatment. The jumper uses an external inline label because a floating label cannot fit a five-digit input surface without enlarging it. VTextField retains comfortable density and native padded field height; five-digit sizing applies only to its inner text area.

Check default errors at desktop/mobile widths without pointer hover, stable footer dimensions, five-digit visible capacity, longer drafts and policy changes retaining focus. Shared DOM tests cover validation/strategy/accessibility wiring; browser tests cover width/height and footer stability. Painted geometry and assistive-technology acceptance remain separate.


## Shared filter editors

UiCollectionFilter is a core logical host for business-defined filter editors, with no additional backend view or local filtering engine. Column popups supply table-column context; row/custom hosts supply their own context. Editors can omit redundant visible labels while retaining accessible names. Status, Amount and Order search in the Collections demo now share owner-held sessions across placements, preserving unfinished drafts on responsive view removal and discarding them on explicit user popup cancellation. Native input/field/button/popover presentation remains backend-owned. Generic header/filter-row/badge/panel arrangement and grouped Apply remain separate work.

Common choice filters now use the shared createUiChoiceFilterEditor adaptation: short flat column-popup choices use checkboxes/radios; external rows/panels use the existing UiMultiSelect/UiSelect. Native control behavior remains backend-owned. Plain's multiple select remains a bounded native listbox; other supplied adapters have compact multiple pickers. Sorting/query reset grouping in Orders is a business demo composition, not a new native collection-header implementation.


## Collection header

UiCollectionHeader implements collection.header.v1 with search, actions, filters, sort and info slots. Wide layout uses one editor-aligned inline row: search, external sort, filter presentation, then flexible space before actions. An optional business reset binding supplies a reset icon before actions; info follows below. The row wraps when needed. The narrow-expandable adaptation keeps search, separate Filter/Sort toggles and Reset together. One panel opens at a time before the action row. Each trigger independently reflects applied activity using native primary/default color and accessible count hints; expansion is a separate state. Empty groups reserve no space. RTL uses logical alignment and actual DOM order. Existing native field/button presentations remain intact; no data engine or statistics are generated.

This grouping is an Uninterface adaptation informed by PatternFly/Carbon and native table examples, not a claim of a toolkit-defined five-slot header. Core provides the configured responsive environment and disclosure behavior. The backend owns native spacing/markup. Query context reaches business-wrapped filters without per-view adaptation code. Container-width adaptation and automatic action overflow remain unimplemented. See the core header guide for sources, ownership and acceptance checks.

Header fields register the backend-owned first editor surface for per-line alignment. Above-label space is measured; floating labels remain native. Clear and other bare actions align to the editor band, with errors growing below. No form/controller ownership changes. Search in the Orders desktop header shows its label; mobile retains its existing presentation. Custom controls without a cooperating UiField retain ordinary start placement.

The exported collectionHeaderLongRow and collectionHeaderNarrowExpandable objects now own these layouts in core. uiCollectionHeaderPresentation selects objects directly or via a reactive contextual selector; custom objects need no backend registration. Names are diagnostic. Each adaptation is now an actual Vue render implementation. This adapter supplies a neutral header host and private flow/part components for the built-ins, fulfilling local allocation, editor alignment and theme spacing. It does not interpret a group schema or implement the disclosure; the narrow render implementation owns mutual exclusion, toggle state and reset placement. Custom render implementations may use their own component trees and interactions. Search/filter context follows the chosen adaptation, including explicit overrides of responsive defaults. Check the expanded narrow panel before actions, stable focus/caret across group moves and no empty allocations. Native geometry still requires browser review.

## Built-in filter presentations

Core now provides search, choice and ordered-range controls with typed bindings and actual backend-independent Vue adaptations. UiCollectionFilter hosts their registered views and borrows the owner-held editor session. This backend fulfills the existing input-frame, text/select/group, field, button/icon, layout and validation contracts; no filter-specific backend renderer or predicate engine is added. Choice list/picker selection retains native controls. Ranges retain one compact frame in column/row contexts and filter-form panels (separate stacked bounds remain an optional strategy), with explicit Enter/Apply or whole-editor panel exit behavior and independently guarded danger-colored Clear. Search uses placeholder/icon treatment where the header supplies compact search context. Check native spacing, tooltip containment, keyboard and touch behavior, and focus in a browser with your collection composition.

## Reusable query panels

Core provides collectionFilterPanel and collectionSortPanel as presentation objects, composed from the backend's existing native-backed controls. No backend-specific panel registration or standard UiXxxx panel component is introduced. The header retains disclosure/active-state coordination; the business supplies filters, sort labels and source capabilities. UiListOptions.sorting declares allowed keys and single/multiple support, enforced by core for table and panel interaction and programmatic queries. Omission means no user sorting. Native table features never grant extra source capabilities or reorder returned rows locally. See the core package’s `docs/guides/collection-panels.md` for consumer API and examples. The shared panel surface uses the same native spacing fallback when rendered outside a header.

The private CollectionSortLayout uses shared grid columns and row subgrids to align Add sort with field inputs. Rows/columns use this backend's compact layout gap; movement buttons adjoin without an extra peer gap and retain native hit targets. Empty/single-sort panels reserve no movement track. Current browsers with CSS subgrid support are required. Core owns all sort interactions and adaptation selection.

## Criterion badges

The shared collectionFilterBadges and collectionSortBadges adaptations render wrapping rows of criteria with named removal crosses. Private CollectionQueryBadge uses this backend's native badge/tag/chip design and real close buttons; the body has no edit action. Core owns eligibility, source operations and popup lifecycle. CollectionFilterEditor is shared by column and badge popovers and exposes a private focus() handle invoked after the editor popover has finished opening, so native initial surface focus cannot overwrite editor entry. The Add chooser uses the existing popup-menu interaction and closes before that editor opens. Verify long labels, compact wrapping, native focus, disabled crosses, popup keyboard behavior and RTL in the browser.


## Table sort priority

When the whole query contains two or more sort rules, sorted headers visibly show their one-based query priority beside the direction indicator. Hidden/non-column rules retain their positions; returning to one rule hides the number. Core supplies the visibility flag and priority; this adapter preserves native sorting interaction and includes the number in header content measurement. The number is decorative for accessibility: the associated localized sort description already supplies direction and priority. Check content-sized columns, narrow allocations, RTL and live updates in a browser.
Vuetify uses its native sort-badge styling.


## Header keyboard order

Resizable column handles remain keyboard-operable separators at the visual inline-end of the header. Their DOM position follows the header controls, preserving coherent sequential focus in LTR and RTL without positive tabindex values. Arrow keys resize; resize events do not activate sorting. Browser-visible focus and scrolling still need verification in the consuming application.


## Sort priority, header layout and badge editors

Active multi-sort table headers provide a Sort priority menu (Move earlier/later), isolated from native sort-cycle activation. Header sizing enables the shared minimumHeader measurement so label, direction, index, priority menu and other native header controls establish a usable minimum alongside the author's minimum. Header measurements include native cell insets; row/cell content sizing keeps its existing policy.

The long-row header uses measured filter/sort/action group asks to place actions beside filters, beside sorting, or below. Actions stay top-aligned. CollectionHeaderPart supplies a zero-height line boundary for the middle placement, using the backend gap without adding an extra empty row. Native editor alignment excludes actions and popup surfaces. Keyed moves retain controls, draft and focus.

The badge editor uses UiPopover's explicit anchor binding on its active badge; positioning transfers from Add to badge and returns to Add if the badge disappears, preserving the original trigger's cancellation/focus role. When a table-column editor opens, it requests focus on its first enabled input or choice. In a browser, check focus after opening and closing the editor, badge anchor changes, and header layout at narrow widths. Verify that controls and draft values survive layout changes.

### Direct sort-badge reordering

CollectionQueryBadge accepts the optional backend-only UiCollectionBadgeReorder binding. Its content span uses useUiCollectionBadgeReorder while its native removal button remains separate. Multiple sort badges have a focusable body with a localized position name, shortcut description and hover hint. Alt+Shift+Left/Right moves in visual inline order; pointer dragging previews an insertion boundary and commits once on drop. RTL, wrapping and retained direction/focus use the same source-backed operation. Escape/outside drop/state changes cancel; horizontal-start touch dragging coexists with vertical-start scrolling. No ellipsis or extra button is rendered inside the badge. Native body sizing, typography and removal remain; focus/insertion feedback is backend-owned. Hidden position announcements are anchored inside the badge. Filter badges and Table priority menus retain their established interactions. Browser tests cover gestures and geometry; OS shortcut conflicts and assistive-technology speech still require environment acceptance.

Keyboard reorder focus outlines the complete native badge boundary while DOM focus remains on its body. A guarded :has([data-ui-sort-reorder]:focus-visible) treatment suppresses the duplicate inner outline; removal keeps its own native focus treatment. Unsupported selectors retain the previous inner outline. This changes no badge dimensions or gesture handling.

During dragging, a primary insertion bar appears outside the proposed before/
after edge, between badges, without outlining the target. The sort composition's
existing layout allocation paints the bar, so native VChip clipping remains
intact. This backend-owned decoration uses the application's Vuetify theme; it
is not a native Vuetify drag-and-drop feature. The source chip dims, and feedback
clears on drop or cancellation. Badge dimensions and the source query stay
unchanged until a drop commits the reorder. Keyboard focus retains its separate
whole-badge treatment. Check both ends, wrapped rows, RTL and light/dark themes
for visible insertion positions without clipping or extra scrolling.

### Table header allocation

Header content uses `inline-flex` with `flex-direction: row`, including when
measured for content-sized columns. Labels, native sort icons/priority badges,
priority menus and filters share one aligned row in DOM order. The header cell
positions the group using its text alignment, so physical left/center/right
alignment does not reverse controls. Omitted alignment retains the native
default. `row` follows the inherited direction for RTL. Column minimum
measurements, keyboard order and resize handles remain in effect; no fixed
header-height override is used. Verify unsorted, single and
multiple sorts at wide/narrow widths, including filter focus/dismissal, priority
changes and resizing. Human visual acceptance is tracked separately from browser
geometry regressions.

## Card-grid width preferences

This adapter’s ordinary card-grid defaults are a **20rem preferred minimum and 25rem finite maximum**, including the card border/insets. `presentation-options` accepts positive rem/em/px `minWidth` and `maxWidth`, with `maxWidth: 'default'` retaining the ordinary cap. Omission or `{}` restores both defaults; minimum-only means no maximum and retains auto-fit occupied-column stretching. A maximum-only request retains the default minimum, so its resolved range must still be valid. Full-width cards and table columns ignore these grid widths.

The native/backend collection list uses shared `useUiCollectionCardGrid` mechanics over its own root and ordinary gap. Bounded columns are counted from available space and preferred minimum, retain equal widths across partial rows, grow only to the cap, and leave surplus at logical end. Narrow single columns shrink below the preferred minimum. Observer updates do not change record ownership or remount keyed content. SSR initially uses a bounded CSS layout before client measurement refines column count; identical pre-client geometry is not promised.

Application-owned styles can customize `--ui-collection-card-default-min` and `--ui-collection-card-default-max` on `.vuetify-collection-cards` after importing the stable backend stylesheet. The defaults are local to the list; set both as needed and preserve a positive ordered range. Component presentation options remain the portable business-facing way to express per-collection preferences. Styling must preserve the semantic list, ordinary gaps, focus and scrolling.

```css
.vuetify-collection-cards {
  --ui-collection-card-default-min: 16rem;
  --ui-collection-card-default-max: 24rem;
}
```

By default, `presentation-options.stretchSingleColumn` is enabled. When only one column fits at the effective minimum/gap, that column ignores the maximum and fills the available width. Explicit `false` keeps the cap strict. The decision uses container capacity, not record count; sparse wide grids and partial final rows retain their capped columns. A flag-only request uses the ordinary default bounds, and minimum-only requests keep stretching regardless of this flag. Client measurement activates this exception; initial server/premeasurement CSS retains its bounded fallback.

## Business summaries and action variants

Summary slots receive business-rendered values, supplied data and freshness. The adapter never fetches or calculates aggregates. Empty and retained-result summaries are independent of status/count footers. The layout and native integration are described below.

UiCollectionButton supports the collection action strategy bordered/soft/text. This backend currently defaults to bordered; Default and explicit Bordered therefore look the same. The default is backend-owned and may change. Bordered preserves each action's ordinary treatment, including mixed filled/outline buttons, through the existing native mappings. Soft/text request their corresponding native surfaces. Icon-only content stays independent, with its existing accessible label/hint and native geometry. Explicit local variants remain authoritative; composition defaultVariant is overridable. New/Refresh header buttons and filter/paginator controls are outside this record-action concern. Verify table/card summaries and all content/surface combinations, native focus, narrow widths, RTL and light/dark. Automated DOM checks establish wiring separately from browser visuals and assistive-technology acceptance.


### Summary layout and bounded scrolling

Table summaries retain their aligned value cells while the leading label spans the business columns before the first declared summary value. Selection stays separate. When the first column has a value, its label and value coexist. Conditional/empty slot output does not change the declared allocation. Full-height tables keep the summary visible at the bottom while rows scroll; content-height tables retain normal flow. A spanned label must not become a width demand on one column.

Vuetify enables VDataTableServer’s native fixed-footer option together with fixed-header for full-height summaries. Its pinned native sticky-header class also applies left:0 to ordinary columns; the adapter releases that horizontal attachment for non-fixed headers so body/header/summary columns stay aligned during horizontal scrolling. Card summaries reuse its UiCard view over VSheet, with a dedicated title header, neutral tint, header separator, solid boundary, compact insets and native zero elevation.

Card summaries place the collection-wide title above aligned field-name/value pairs; pairs occupy responsive columns and stack on narrow widths. Summary identity is independent of card hierarchy and color roles; they are outside the bounded card scrollport and remain visible while records scroll. Values and labels wrap within the available width. Supporting controls and business calculation ownership remain independent. Verify first/middle/end scrolling, narrow width, RTL, multiple summary values, reactive label spans and empty collections in a real browser.

## Server rendering and hydration

The basic UiTable and table-presented UiCollectionView paths render supplied rows, headers, draft editor content, declared summaries and the table name on the server, including an empty result. Synchronous reusable column declarations participate. Matching client state hydrates the same tested row/editor nodes without another view-owned source read. Sorting, selection and nested actions become interactive after hydration; draft text survives the tested sort update.

Supply the same initial data and explicit application idPrefix on the server and browser. The owner loads that snapshot and disposes each request session; views do neither. Browser measurements may refine geometry after mounting. This bounded verification does not certify every combination of creation rows, infinite continuation, teleports, conditional column updates, multiple concurrent requests or responsive layouts. Run the relevant application SSR/hydration cases before depending on those combinations.

## Editable collection focus

This adapter declares collection.editor-focus.v1. Its existing native row roots participate in the shared useUiCollectionView recovery protocol. A collection editor attachment can request the next/preceding registered editor and the table creation action before the native collection fallback. Native focus handles retain visibility, disabled-state and target checks. Markup, row presentation, validation feedback and ordinary Tab order are unchanged. See the core collection editor guide and backend collection contract for consumer/implementation obligations. Unit/DOM checks are distinct from browser and assistive-technology acceptance.
