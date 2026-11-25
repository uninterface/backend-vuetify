import { useLocale } from 'vuetify'
import { createLocaleFixture } from '@uninterface/testing/fixtures/locale'

export const { mountLocale, renderLocale } = createLocaleFixture(() => {
  const { t } = useLocale()
  return () => t('$vuetify.noDataText')
})
