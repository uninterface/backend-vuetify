# Progress bars

[Documentation index](README.md)

The adapter uses native `VProgressLinear` with original value/max and native indeterminate mode. It does not enable clicking or completion behavior. Optional danger maps to native error; omitted consumer color resolves to primary using its native/configured theme mapping. Reduced motion retains a static partial segment.

Standalone and upload-hosted bars share this backend’s `UiProgressBar.vue`, requiring `progress.bar.v1`. Both modes are horizontal bars filling the offered inline allocation. The producer owns outcomes, actions, visibility and announcements; the bar has no live region or default tab stop. Null means unknown; numeric value/max retain their original units and fractional precision. A full bar does not automatically declare success.

Verify accessible naming/range and no unknown current number, known/unknown transitions, narrow/wide containment, light/dark, LTR/RTL and reduced motion. Functional/DOM evidence is separate from browser geometry/paint, human visual review and assistive-technology acceptance. The shared consumer API and usage guide are in `@uninterface/uninterface`, under `docs/api/components/UiProgressBar.md` and `docs/guides/progress.md`.
