import '@uninterface/backend/font.css'
import '@uninterface/uninterface/style.css'
import type { UiNavMenuPresentation } from '@uninterface/uninterface'
import { mountTravel } from './travel-navigation'
import { mountNavigation } from './navigation'

const params = new URLSearchParams(location.search)
document.documentElement.dir = params.get('dir') === 'rtl' ? 'rtl' : 'ltr'
const mode = params.get('mode') ?? 'horizontal'
if (params.has('links')) void mountNavigation()
else void mountTravel(mode as UiNavMenuPresentation)
