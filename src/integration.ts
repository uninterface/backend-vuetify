import { defineComponent, effectScope, watch } from 'vue'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { en } from 'vuetify/locale'
import type { UiBackendIntegration } from '@uninterface/uninterface/backend'
import icons from './icons'
import { useUiColorMode } from '@uninterface/uninterface'
export default {
  colorMode: {
    attribute: 'class',
    light: 'v-theme--light',
    dark: 'v-theme--dark',
    default: 'system',
  },
  initialLocale: en,
  locales: {
    resources: {
      en,
      ar: () => import('vuetify/lib/locale/ar.js').then((m) => m.default),
      'zh-Hans': () =>
        import('vuetify/lib/locale/zh-Hans.js').then((m) => m.default),
      'zh-Hant': () =>
        import('vuetify/lib/locale/zh-Hant.js').then((m) => m.default),
    },
    aliases: { zh: 'zh-Hans' },
  },
  icons,
  create({ nativeLocale, i18n, ssr }) {
    const nativeScope = effectScope(true)
    const vuetify = nativeScope.run(() =>
      createVuetify({
        ssr,
        theme: { defaultTheme: 'light' },
        icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
      }),
    )!
    return {
      plugin: vuetify,
      dispose: () => nativeScope.stop(),
      Root: defineComponent({
        setup(_, { slots }) {
          const mode = useUiColorMode()
          watch(mode.state, (state) => vuetify.theme.change(state.resolved), {
            immediate: true,
            flush: 'sync',
          })
          watch(
            [nativeLocale, i18n.state],
            () => {
              const locale = i18n.state.value.resolved.backend ?? 'en'
              vuetify.locale.messages.value[locale] =
                nativeLocale.value as typeof en
              vuetify.locale.rtl.value[locale] =
                i18n.state.value.direction === 'rtl'
              vuetify.locale.current.value = locale
            },
            { immediate: true },
          )
          return () => slots.default?.()
        },
      }),
    }
  },
} satisfies UiBackendIntegration
