import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { addSecurityMetaTags, hardingBrowser } from './utils/securityHeaders'

// Apply security hardening
addSecurityMetaTags()
hardingBrowser()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')