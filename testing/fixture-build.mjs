import { buildFixture } from '@uninterface/testing/fixture-build'

const backend = {
  resolveBackend: (subpath) =>
    import.meta.resolve(
      subpath
        ? '@uninterface/backend-vuetify/' + subpath
        : '@uninterface/backend-vuetify',
    ),
}

export const build = (options) => buildFixture(options, backend)
