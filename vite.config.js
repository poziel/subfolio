import { fileURLToPath, URL } from 'node:url'
import { env } from 'node:process'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const enableVueDevTools = env.VITE_ENABLE_VUE_DEVTOOLS === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ...(enableVueDevTools ? [vueDevTools()] : []),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
