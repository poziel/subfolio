import { fileURLToPath, URL } from 'node:url'
import { cwd, env as processEnv } from 'node:process'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

function parsePort(value) {
  const port = Number(value)
  return Number.isInteger(port) && port > 0 && port < 65_536 ? port : undefined
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, cwd(), ''), ...processEnv }
  const devHost = env.LOCAL_DEV_HOST?.trim() || undefined
  const devBindHost = env.LOCAL_DEV_BIND_HOST?.trim() || undefined
  const devPort = parsePort(env.LOCAL_DEV_PORT)

  return {
    plugins: [
      vue(),
      ...(env.VITE_ENABLE_VUE_DEVTOOLS === 'true' ? [vueDevTools()] : []),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      ...(devBindHost ? { host: devBindHost } : {}),
      ...(devHost ? { allowedHosts: [devHost] } : {}),
      ...(devPort ? { port: devPort, strictPort: true } : {}),
    },
  }
})
