# Vuetify backend documentation

[Package introduction](../README.md)

| Task | Read |
|---|---|
| Configure a Vue application | [Application setup](setup.md) |
| Understand presentation defaults, native mappings and limits | [Presentation and integration](presentation.md) |
| Customize presentation or check customization limits | [Customization](customization.md) |
| Build the package from a source checkout | [Package build](package-build.md) |
| Inspect assembly exports | [Package exports](exports.md) |
| Configure application tests or assess backend tests | [Testing](testing.md) |
| Apply regional presentation preferences | [Strategy support](strategies.md) |
| Inspect declared support | [Capability manifest](../capabilities.json) |

Business APIs and shared component guarantees belong to `@uninterface/uninterface`. This package documents how its presentation fulfills those rules. Consult the core package's API and backend-authoring references alongside this guide when implementing an adapter.

## Choice groups

Uses VRadio and VCheckboxBtn, with native labels, density and error presentation. Radio navigation is coordinated across these controlled native widgets. Both groups retain unavailable selections visibly and pause candidate interaction while sources are unavailable. Indeterminate standalone checkboxes resolve to checked on activation; they do not cycle through three values. Group layout, retained-value status and focus handling are adapter responsibilities.

- [Modal presentation](modals.md): native dialog scope, owned popup targets and verification limits.

- [Selection, feedback and panels](selection-feedback-panels.md)

[Typography and font delivery](typography.md): default hosted fonts, explicit bundling, language coverage and application setup.

[Native HTML content defaults](native-html.md): supported element baseline, toolkit mappings, setup, spacing and verification limits.

- [Component presentation](reviewed-components.md) — native integrations and current acceptance limits.

- [Shared input frames](presentation.md#shared-input-frames): native integration, customization and limits.

- [Navigation menu presentations](navigation.md)

- [Collection presentation](collections.md) — implemented list/table/paginator mappings and acceptance limits.

- [Table sizing and alignment](table-columns.md)

- [Segmented selection](segmented-selection.md): native joined single-choice presentation.


See [Contract adaptations](contract-adaptations.md) for this backend’s native mappings, support limits, allocation defaults and verification qualifications.

- [Floating launchers, docking and resizing](floating-panels.md): native integration, customization and verification limits.

- [Progress bars and upload integration](progress.md).
