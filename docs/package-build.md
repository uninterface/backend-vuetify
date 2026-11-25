# Build the Vuetify backend package

Use Node.js 24 and npm from this repository's root.

```sh
npm ci
npm run build
npm pack ./dist/package
```

The source checkout builds a public package in `dist/package`. The tarball
contains compiled view modules, test adapters, declarations, CSS, documentation
and licenses. Each public `.vue` subpath resolves to its own ESM entry. The
application and backend share Core and Vue through peer dependencies.
Install the tarball under the `@uninterface/backend` alias and follow
[application setup](setup.md) for styles and integration.

The release workflow in `.github/workflows/publish.yml` inspects the
archive, installs it in a fresh consumer, and checks the build and Chromium
interactions in development and production.
