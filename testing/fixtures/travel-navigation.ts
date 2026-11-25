import '@uninterface/backend/style.css'
import { computed, h, nextTick, ref, toValue } from 'vue'
import {
  createUiEntryControl,
  createUiNavigationControl,
  UiContent,
  UiNavbar,
  UiNavMenu,
  UiRegionLayout,
  type UiNavMenuPresentation,
} from '@uninterface/uninterface'
import { createUiApplication } from '@uninterface/uninterface/setup'

export async function mountTravel(
  initialMode: UiNavMenuPresentation = 'horizontal',
) {
  const current = ref('overview')
  const mode = ref<UiNavMenuPresentation>(initialMode)
  const icon = { name: 'info' }
  const entries = createUiEntryControl([
    { key: 'overview', label: 'Overview', icon },
    {
      key: 'destinations',
      kind: 'submenu',
      label: 'Destinations',
      icon,
      children: [
        { key: 'allDestinations', label: 'All destinations' },
        {
          key: 'europe',
          kind: 'submenu',
          label: 'Europe',
          icon,
          children: [{ key: 'france', label: 'France' }],
        },
        { key: 'nearby', label: 'Nearby' },
        {
          key: 'asia',
          kind: 'submenu',
          label: 'Asia',
          icon,
          children: [
            { key: 'japan', label: 'Japan' },
            { key: 'singapore', label: 'Singapore', icon },
            { key: 'thailand', label: 'Thailand' },
          ],
        },
        {
          key: 'americas',
          kind: 'submenu',
          label: 'Americas',
          icon,
          children: [{ key: 'canada', label: 'Canada' }],
        },
      ],
    },
    {
      key: 'experiences',
      kind: 'submenu',
      label: 'Experiences',
      icon,
      children: [{ key: 'outdoors', label: 'Outdoors' }],
    },
    { key: 'travelJournal', label: 'Travel journal' },
    { key: 'essentials', label: 'Essentials', icon },
  ])
  const navigation = createUiNavigationControl(entries, {
    driver: {
      current,
      navigate(key) {
        const unchanged = current.value === key
        current.value = key
        return { status: unchanged ? 'unchanged' : 'completed' }
      },
    },
  })
  const sidebar = computed(() => mode.value !== 'horizontal')
  const errors: string[] = []
  const warnings: string[] = []
  const app = createUiApplication({
    render: () =>
      h('div', { 'data-testid': 'navigation-preview', style: 'height:32rem' }, [
        h(
          UiRegionLayout,
          {
            direction: sidebar.value ? 'horizontal' : 'vertical',
            navigationRegion: 'start',
            height: 'full',
          },
          {
            start: () => {
              const menu = () =>
                h(UiNavMenu, {
                  binding: navigation.bindings.navMenu,
                  presentation: mode.value,
                  'aria-label': 'Travel navigation',
                })
              return sidebar.value
                ? h(
                    UiContent,
                    {
                      height: 'full',
                      scroll: 'both',
                      inset: 'none',
                      'aria-label': 'Travel navigation region',
                    },
                    menu,
                  )
                : h(UiNavbar, { 'aria-label': 'Travel navbar' }, menu)
            },
            main: () =>
              h(
                UiContent,
                {
                  height: 'full',
                  scroll: 'vertical',
                  'aria-label': 'Destination content',
                  'data-testid': 'navigation-content',
                },
                () =>
                  h(
                    'h3',
                    toValue(entries.describe(current.value)?.label) ??
                      current.value,
                  ),
              ),
          },
        ),
      ]),
  })
  app.config.errorHandler = (error) => errors.push(String(error))
  app.config.warnHandler = (message) => warnings.push(message)
  const host = document.body.appendChild(document.createElement('div'))
  await app.ui.ready
  app.mount(host)
  async function tick() {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 80))
    await nextTick()
  }
  await tick()
  return {
    host,
    errors,
    warnings,
    tick,
    async setPresentation(presentation: UiNavMenuPresentation) {
      mode.value = presentation
      await tick()
    },
    dispose() {
      app.unmount()
      navigation.dispose()
      entries.dispose()
      host.remove()
    },
  }
}
