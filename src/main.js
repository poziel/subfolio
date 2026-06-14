import './assets/main.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import App from './App.vue'
import router from './router'

const SubfolioPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e5f5f2',
      100: '#c8ebe5',
      200: '#98d8ce',
      300: '#65c7b8',
      400: '#2db5a4',
      500: '#00a594',
      600: '#008f80',
      700: '#007768',
      800: '#175f58',
      900: '#173c39',
      950: '#101a19'
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#fcfaf6',
          100: '#f4efe7',
          200: '#eee6da',
          300: '#d8d0c2',
          400: '#b7cec3',
          500: '#8a918b',
          600: '#6d766f',
          700: '#173c39',
          800: '#142220',
          900: '#101a19',
          950: '#0b1110'
        }
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '#f4efe7',
          100: '#a8b7b2',
          200: '#7f918c',
          300: '#5f7c76',
          400: '#314844',
          500: '#223633',
          600: '#1a2d2a',
          700: '#142220',
          800: '#101a19',
          900: '#0b1110',
          950: '#070d0c'
        }
      }
    }
  },
  components: {
    tag: {
      colorScheme: {
        light: {
          secondary: {
            background: 'rgba(215, 175, 114, 0.18)',
            color: '#173c39'
          },
          success: {
            background: '#e5f5f2',
            color: '#007768'
          },
          info: {
            background: '#eef6f3',
            color: '#173c39'
          },
          warn: {
            background: '#f8f1e5',
            color: '#7a5b28'
          },
          danger: {
            background: '#f9eaea',
            color: '#8e3030'
          }
        }
      }
    },
    message: {
      colorScheme: {
        light: {
          success: {
            background: '#e5f5f2',
            borderColor: 'rgba(0, 165, 148, 0.24)',
            color: '#007768'
          },
          info: {
            background: '#eef6f3',
            borderColor: 'rgba(143, 189, 177, 0.36)',
            color: '#173c39'
          },
          warn: {
            background: '#f8f1e5',
            borderColor: 'rgba(215, 175, 114, 0.38)',
            color: '#7a5b28'
          },
          error: {
            background: '#f9eaea',
            borderColor: 'rgba(198, 90, 90, 0.32)',
            color: '#8e3030'
          }
        }
      }
    }
  }
})

createApp(App)
  .use(PrimeVue, {
    ripple: true,
    theme: {
      preset: SubfolioPreset,
      options: {
        darkModeSelector: '.subfolio-dark'
      }
    }
  })
  .use(router)
  .mount('#app')
