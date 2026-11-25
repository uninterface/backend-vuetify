# Navigation menus in Vuetify

VBtn for horizontal roots, VList/VListItem for vertical/flyout entries, VListGroup for persistent branches, and VMenu for floating descendants. Current ancestry uses native active state.

All four UiNavMenu presentations are implemented: horizontal, vertical-tree, vertical-popup, and icon-popup. The shared controller owns current/path/requests, while each view owns expansion. Current changes reveal persistent ancestry without opening closed flyouts. Native markup, focus mechanics and styling remain backend-owned. Group and descendant slots preserve leading icons; check selection and shortcut hints are absent from navigation projections.

Icon-popup uses labelled flyouts and accessible root names; missing root destination icons receive neutral menu-item artwork without changing modes. Navigation labels are required. Responsive selection is application-owned; UiNavbar does not automatically collapse.

The existing application-owned theme/configuration and stylesheet ordering continue to apply; there are no new business-side spacing, caret or native-widget props. See this backend's customization guide for toolkit settings actually consumed by the adapter.

Focused shared DOM tests cover the four presentations, three levels, icons, command-metadata isolation, current/breadcrumb synchronization, synchronous link interception, single request dispatch and accepted/refused navigation. DOM checks do not establish browser geometry, animation, mobile/RTL placement or assistive-technology acceptance.

Vertical roots and all persistent tree levels retain a leading icon column, including empty decorative slots. This keeps hierarchy independent of icon presence and supports consistent icon coordinates across vertical modes. Independent floating surfaces retain per-level icon-presence decisions. Rail labels appear on hover/focus; grouped headings retain hidden accessible text without widening the rail. Fallback artwork is a view projection, never a source mutation.

Leading artwork and empty icon columns use a direct native VIcon in each VListItem prepend slot, so Vuetify supplies its icon-to-label spacer and application-owned gap overrides. Tree branch and leaf buttons fill the available width at their level, throughout the hierarchy. The icon rail removes the unused content minimum and prepend spacer only on its own root items, following the native drawer-rail adaptation; labelled flyouts retain ordinary spacing. Group-heading icons use the native start-icon margin.

The backend presentation regression checks native icon/spacer adjacency, full-width button rules, root-only rail adaptations, and activation through the actual travel example in vertical-tree, vertical-popup, and icon-popup. Browser scenarios compare sibling widths, native spacer geometry and icon centering.

Vertical-tree hierarchies use one native VList with recursively nested VListGroup branches. Recursive render fragments do not create new list surfaces, reset --indent-padding, add repeated list insets, or restart the native nested-item context. The root opened model mirrors expansion across the entire projected hierarchy, including transparent groups and lazily loaded branches. Native indentation, group spacing and disclosure arrows therefore accumulate by depth while full-width rows retain a shared trailing edge. Current/ancestor treatment remains native; no connector lines or extra decorations are introduced.

These persistent hierarchies select VList's native slim spacing and comfortable density, retaining its icon-aware nesting indentation. With the default toolkit theme, icon-bearing branches advance 44px per level, placing the child's icon column at the parent's text column. The icon-to-label gap is 20px and one-line rows have a 44px minimum height. Text and icon sizes stay consistent across levels, as do full-width row targets. These are adapter defaults for tree navigation; floating menus keep their existing native presentation. Browser scenarios check parent-text/child-icon alignment and row geometry.

Drawer-based navigation is not a UiNavMenu presentation. Support for a hamburger trigger, drawer container and vertical hierarchy composition is planned; its public API and coordination solution remain undetermined.

Root navigation renders a logical themed separator unless an eligible UiNavbar or explicitly designated UiRegionLayout navigation region owns the adjoining boundary. The backend surface coordinates allocation transitions, focus and rail hints through useUiNavigationPresentation; it retains native row/icon geometry. Reduced motion suppresses transitions. DOM regressions cover ownership, fallbacks, expansion retention and hints. Compare geometry, focus and reduced-motion behavior in a browser.
