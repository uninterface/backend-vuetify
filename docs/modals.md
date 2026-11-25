# Modal presentation

UiModal uses the browser dialog top layer for masking and background interaction blocking. The shared optional presentation helper wraps Tab/Shift+Tab at the dialog boundaries while retaining native traversal within the surface. This adapter supplies Vuetify Card, CardText and Button primitives. Core owns run results and close policy; native presentation cannot decide whether hosted business work succeeded.

VDialog has no automatic close button. This adapter uses Vuetify’s icon-button composition: VBtn with the configured `$close` icon alias and text variant, including its native shape, focus and disabled treatment.

The adapter implements `modal.v1`. Header/footer remain outside the bounded body scrollport. The initial focus target is the visible dialog title with backend focus presentation. The mask uses a conventional translucent backdrop; the surface uses native theme values. Existing application-owned theme configuration and stylesheet ordering apply; see [customization](customization.md).

Owned toolkit select/menu portals target the nearest dialog so they remain operable inside its top layer. Nested modals establish separate native dialog scopes, and shared scroll locks are reference counted. Unmount cleanup is independent of whether a business close policy would have permitted a user dismissal.

No global modal registry, vendor instance or numeric stacking value is exposed to business code. See the core package’s modal guide (`docs/guides/modals.md`) for the public contract. Browser HTMLDialogElement.showModal support is required. Verify focus containment and return to the opener, viewport bounds and pointer dismissal in the browser. Check announcements and navigation with assistive technology.

## Modal surface and action placement

The adapter now uses VCardItem/VCardTitle, VCardText and VCardActions, VDialog's default elevation 5, 24px viewport margins and 0.32 scrim opacity. Native dialog-transition CSS is used for opening/closing without an activator-origin animation. Browser top-layer hosting replaces VOverlay, so VDialog's ancestor-dependent body padding (0 24px 24px after the header), inherited body typography and header padding are explicitly adapted. VCardActions supplies native button defaults; action sequence is reverse-inline, first at inline-end. A custom footer remains unsorted. This consumes the pinned native defaults, not arbitrary VDialog props or Sass dialog-variable overrides.

The native HTML dialog host retains the tested top-layer nesting, owned popup target and core cancellation reasons. This avoids introducing a second uncontrolled modal lifecycle or forcing native components with conflated dismissal events to decide close policy. It is an explicit hosting adaptation, not a claim that the complete native dialog API is exposed. DOM checks establish structure and behavior; compare computed typography, backdrop, spacing and motion against the installed toolkit using the native reference before claiming visual parity.

## Shared modal width

The adapter implements modal.width.v1. UiModal width=auto uses preferredWidth or a shared 32rem fallback; width=available fills the available width. Positive px numbers and px/rem/em lengths are accepted; preferredWidth also accepts percentages up to 100% of the available viewport. minWidth/maxWidth constrain preference, but the viewport after safe-area insets and backend clearance is always the hard cap. This replaces native toolkit default width and max-width behavior. Native surfaces/insets, vertical placement and scrolling remain intact. Application width customization should use UiModal props; native toolkit width tokens/classes no longer determine modal allocation.

The actual dialog receives the helper's widthStyle and backend-owned edge clearance. Reactive props and viewport changes preserve content identity. Automatic nested-content width negotiation is not implemented. Check viewport clearance and content identity when resizing in the browser.

## Content-owned scrolling

`UiModal bodyScroll="content"` keeps the native viewport cap, header and footer while making the body a shrinking flex allocation for its content. Short content remains naturally sized. The default `body` mode retains ordinary body scrolling. `UiForm height="full"` uses a shrinking grid boundary for one authored full-height layout root; ordinary forms retain their native field arrangement. Both optional capabilities are declared as `modal.content-scroll.v1` and `form.height.v1`.

Keep the actual body and any native intermediate wrappers shrinkable. The body retains overflow fallback when fixed supporting regions cannot fit at extreme sizes. Verify the actual invoice dialog with short/many rows, narrow/short viewports and keyboard focus: Reference and modal actions remain reachable, the line table scrolls, its summary stays visible and Add remains outside row scrolling. This is allocation support, not a promise that arbitrary default bodies supply a definite full height.

Both VCardText and its inner body participate in the shrinking flex chain; VCard title/actions retain native presentation.
