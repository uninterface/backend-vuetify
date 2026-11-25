import '@uninterface/backend/font-bundled.css'
import '@uninterface/backend/style.css'
import '@uninterface/uninterface/style.css'
import { createUiApplication } from '@uninterface/uninterface/setup'
import App from './App.vue'

const app = createUiApplication(App, {
  document,
  requires: ['actions.v1', 'input.select.single.v1'],
})
await app.ui.ready
app.mount('#app')
