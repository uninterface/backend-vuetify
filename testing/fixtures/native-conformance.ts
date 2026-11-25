import '@uninterface/backend/style.css'
import '@uninterface/uninterface/style.css'
import { createUiApplication } from '@uninterface/uninterface/setup'
import NativeConformance from './NativeConformance.vue'

const app = createUiApplication(NativeConformance)
const host = document.body.appendChild(document.createElement('div'))
void app.ui.ready.then(() => app.mount(host))
