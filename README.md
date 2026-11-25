# Uninterface Vuetify backend

Vue presentation for Uninterface using Vuetify 4.2.5. Business components import `@uninterface/uninterface`; this package supplies presentation while core owns values, validation, submission, entry sources and selection.

## Start here

Follow [application setup](docs/setup.md) for prerequisites, the backend alias, styles and required integration. Use [the documentation index](docs/README.md) for native mappings, exports and testing.

## Presentation defaults

Vuetify inputs provide floating labels, native field details and loading indicators. Errors replace helper text while invalid. The six baseline colors are supported; danger maps to error, and filled/outline/soft/text treatments map to flat/outlined/tonal/text.

Layouts preserve Uninterface's space allocation and scrolling rules. Navbar content wraps rather than silently collapsing. Source loading remains core-owned; the backend displays progress, unavailable candidates and errors using its native presentation where available.

## Document styles and theme

The stylesheet includes Vuetify global typography and reset rules. UiApp inherits that baseline and supplies the native theme surface without a VApp layout wrapper. These effects apply to the document, including ordinary HTML and teleported content, rather than relying on a UiApp styling boundary.

Supports shared light/dark/system integration through application setup, including host inheritance and popup surfaces. Application initialization synchronizes core and native locale resources and supplies the semantic icon catalogue. See [language and icons](docs/setup.md#localization-and-icons).

For application-owned theme settings, supported recipes and current limits, see
[customization](docs/customization.md).

See [presentation strategies](docs/strategies.md) for size levels, native mappings and optional field-preference support.

## Limits and compatibility

The [capability manifest](capabilities.json) records declared support. A declaration is not evidence of browser compatibility. Native palette contrast limitations and optional remedies are documented in the [presentation reference](docs/presentation.md). They do not establish WCAG AA conformance.

Use [presentation and integration](docs/presentation.md) for concrete native mappings, global style effects and limitations. [Testing](docs/testing.md) explains consumer harness setup and the boundary around backend-owned acceptance suites. No runtime backend switch or general presentation-strategy negotiation is supplied.

See [modal presentation](docs/modals.md) for the dialog surface, owned popup integration and verification limits.

- [Selection, feedback and panels](docs/selection-feedback-panels.md)

See [typography and font delivery](docs/typography.md) for four explicit setups: backend or Uninterface defaults, each with Network or Bundled delivery; includes language coverage and application-owned alternatives.

[Native HTML content defaults](docs/native-html.md): supported element baseline, toolkit mappings, setup, spacing and verification limits.

- [Component presentation](docs/reviewed-components.md) — native integrations and current acceptance limits.

- [Navigation menu presentations](docs/navigation.md)

- [Collection presentation](docs/collections.md) — implemented list/table/paginator mappings and acceptance limits.

Table columns support preferred/minimum widths, spring allocation, pointer/keyboard boundary resizing and left/center/right alignment. See the [backend sizing notes](docs/table-columns.md) for defaults, native integration, insufficient-space behavior and verification limits.

Loading surfaces: Masks use contained VOverlay; indicators use VProgressCircular. UiCard, UiTable, UiList and UiCollectionView integrate blocking loading while preserving mounted content. The core library’s loading guide documents surface ownership and verification.

- [Segmented selection](docs/segmented-selection.md) — joined, visible single-choice fields.

UiDrawer and UiPopover now have backend views for modal runs, retained nonblocking drawer panels and anchored interactive content. See the core drawer/popover guide and this backend's customization documentation. Browser geometry and interaction acceptance remain separate from rendered DOM checks.


See [Contract adaptations](docs/contract-adaptations.md) for this backend’s native mappings, support limits, allocation defaults and verification qualifications.

- [Floating launchers, docking and resizing](docs/floating-panels.md): native integration, customization and verification limits.

## License

Uninterface source is available under the [MIT License](LICENSE).
