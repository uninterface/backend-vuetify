# Floating launchers, docking and resizing

This backend implements `floating.v1`, `drawer.docked.v1` and `drawer.resize.v1`. The public component API belongs to `@uninterface/uninterface`: UiFloating, UiDrawerLayout and UiDrawer's modal/panel/docked modes. Follow [application setup](setup.md) before using them; no additional plugin or stylesheet is required beyond the normal backend setup.

## Native integration

The adapter uses the existing Vuetify-themed drawer surface, VBtn and a platform range input. Keep the normal Vuetify theme service and style order. The supplied launcher remains an ordinary UiButton/UiIcon composition. The backend owns floating markup and its movement editor, while the shared helpers supply geometry/events without choosing a DOM tree. A platform range input supplies the small repositioning editor's click/tap and keyboard semantics; it is not an ordinary business field or another state owner.

No corresponding native composition coordinates a retained surface between overlay and measured adjoining allocations with the shared expansion owner. The adapter therefore projects UiDrawerLayout's extent into grid tracks, retains the same surface across physical hosting changes, and supplies a named boundary separator for pointer/touch/keyboard resizing. The attached edge remains fixed. Header/footer stay outside body scrolling. Modal blocking and guarded lifecycle remain intact; panel/docked do not lock the background or trap Tab. The separator is separate from body scrolling and supported native dismissal gestures.

A direct icon UiButton in the floating slot gets a theme-owned surface/border and elevation, a minimum 3rem square target and 1.5rem artwork sizing. The immediate button host owns that surface; the button keeps its native hover, disabled and focus behavior. This compensates for an isolated launcher over arbitrary page content; icon buttons elsewhere keep their ordinary native presentation. These are backend defaults, not new business sizing props.

## Application customization

Use the ordinary [customization setup](customization.md) for toolkit themes and controls. Optional launcher clearance can be changed in one application stylesheet loaded after the backend stylesheet:

```css
/* Apply a class to UiFloating; its actual floating root receives the class. */
.application-options-launcher {
  --ui-floating-clearance: 20;
}
```

```vue
<UiFloating class="application-options-launcher" edge="end" draggable>
  <UiButton variant="icon" color="primary">
    <template #icon><UiIcon name="settings" /></template>
    Options
  </UiButton>
</UiFloating>
```

Clearance is a unitless pixel presentation value, combined with platform safe areas. It does not change normalized position or stacking. Prefer ordinary native theme configuration for surface/control colors; do not override z-index, native visibility or transforms to coordinate panel state. Backend styles cover teleported content independently of application ancestor selectors. Light/dark and RTL follow the installed application/native context; the movement surface uses backend theme tokens. The public extent/min/max props control allocation; theme spacing remains separate.

## Limits and verification

Content must fit the floating unit's viewport allocation. Docked top/bottom layouts require a bounded height; full-height body scrolling also requires a definite parent. There is one participating drawer per host. Compact rails, snap points and controlled extent persistence are not supplied. Native top-layer reversal remains unsupported.

Verify launcher snapping and range-editor reachability at viewport edges, current theme/RTL, actual main reflow, named resize limits, focus/draft retention and nested popup ownership. Check modal blocking and nonmodal background use separately. Component DOM regressions exercise state and wiring; physical geometry, touch hit testing, zoom/software keyboards, native paint and assistive technology still need browser acceptance. No new browser or contrast certification is implied.

When a docked drawer becomes an overlay beneath an already-live child popup,
the parent uses an ordinary registered CSS surface for that presentation rather
than opening above its native child. The shared allocator still owns its rank;
children keep their handles/content, and docking transfers them back to the
enclosing scope. Native live order is not reversed, nor are children forcibly
closed/reopened. The adapter explicitly supplies visibility for docked and this
ordinary overlay state, alongside its normal theme and inactive hiding rules.

## Drawer boundary and depth

The drawer/docking presentation supplies a visible line and depth toward main content by default. The private docking frame keeps boundary paint outside the clipped motion area; UiDrawerLayout supplies adjoining space and core-resolved stacking. The decoration does not consume space, intercept pointer input or replace the resize control. Forced colors retain the boundary when shadows are suppressed. Overlay drawers retain their native surface treatment with the same main-facing depth composition. Its native shadow plane is oriented toward main on every edge, including RTL; a downward-only shadow recipe is not assumed to work above a bottom drawer.

Vuetify uses its native border color/opacity and elevation 5 for docking, matching the drawer card elevation. Native Sass theme/elevation configuration applies; the adapter exposes no separate elevation prop. Use the existing [application customization setup](customization.md); load application styles after backend styles. Preserve a visible boundary/depth treatment, motion containment, native focus and core-owned stacking. Native surface-only class overrides do not automatically style the separate docking composition. Verify all edges, RTL, resizing, motion and supported color modes after customization.
