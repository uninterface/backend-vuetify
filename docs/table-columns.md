# Table columns

This adapter implements table.column-sizing.v1 and table.column-alignment.v1. UiTableColumn accepts preferredWidth/minWidth as positive px numbers or px/rem/em lengths, spring/resizable booleans and physical left/center/right align. Defaults are 12em, 3em, true, true and native alignment. At least one spring column is required. Header and cell content use the same alignment; full-width editors retain their own internal alignment.

Spring columns absorb container changes; pointer or keyboard resizing redistributes adjacent columns within their minima. Both neighbors must permit resizing. Horizontal overflow requires explicit horizontal/both scrolling. If fixed widths plus spring minima cannot fit without scrolling, a localized status replaces the visible table while keeping editors mounted. Authors must supply responsive allocations suitable for their actual content.

Widths survive data/query updates for the mounted view. Arrow keys resize by 10px (Shift: 1px), Home/End reach bounds, Escape cancels a drag and double-click resets authored widths. The core package's docs/guides/table-columns.md provides full consumer semantics.

Native integration: VTable colgroups and cell/header styles with shared boundary handling.

Verify painted header and cell alignment, pointer and touch resizing, keyboard operation and header associations in the intended browsers and assistive technology.

Content width: preferredWidth/minWidth accept content. The adapter measures intrinsic header/cell wrappers plus native insets, so action-button labels and padding determine the allocation. Use content for both with spring=false to prevent resizing below the button's required space. Unmeasured content starts at 3em; hidden content retains its last measurement until measurable. Percentage/full-width editors are not appropriate intrinsic-content requests.

UiTable supports a custom footer below the data, anchored horizontally to its scroll host (table.footer.v1). Successful lists/tables are quiet by default; showSummary explicitly opts into a visible ready count. Loading, empty, stale, error, completion and accessibility status remain. Content sizing support is declared through table.column-content.v1.


See [collection presentation](collections.md#pagination) for native pagination and fallback behavior.

## Selection allocation

The generated selection-control column reserves `3em` separately from business-column allocation. It does not consume the remainder shared by spring columns. Verify native checkbox fit, header/cell alignment and horizontal scrolling with the application’s control sizes and zoom.


Custom table supporting footers are siblings of the record scrollport within the existing collection frame. In full-height tables they keep their natural size while rows receive the remaining space; horizontal row scrolling does not move their actions. Summary cells remain in the native table footer. Verify supporting-footer persistence, sticky summary and retained footer/editor identity through edits, insertion and removal. The creation row is separate from this custom footer.

## Creation row

UiTable supports `addRow`/`addRowLabel` through table.add-row.v1. A private backend preview tints each column’s content area inside its native cell insets using neutral foreground/surface tokens. The insets remain unshaded, separating adjacent areas. The core’s named text-variant action sits over these static, aria-hidden areas. Selection allocation, column resizing/order and horizontal scrolling share the table's geometry. The preview has no control outlines, blur, native editors, sample items or loading animation. It precedes the column summary and is independent of the generic supporting footer.

The creation affordance is the final body row after the records and before the summary. It always scrolls vertically with records and is never pinned to the viewport; long tables require reaching the final row. The declared summary retains its independent bottom position. A shorter allocation releases header pinning when necessary. Native scroll padding keeps focused editors clear of sticky regions. The existing modal/body overflow fallback remains available. Check visible action focus, pointer access, unobscured insertion focus, dark/RTL, empty membership and independent pending restrictions.

The creation tr follows records in the existing custom native body slot, before the native tfoot slot. Surface, border and control treatments use Vuetify theme tokens.
