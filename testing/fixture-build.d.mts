import type { buildFixture } from '@uninterface/testing/fixture-build'

export const build: (
  options: Parameters<typeof buildFixture>[0],
) => ReturnType<typeof buildFixture>
