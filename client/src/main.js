import './assets/main.css'
import '@subfolio/vue-components/dist/vue-components.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
