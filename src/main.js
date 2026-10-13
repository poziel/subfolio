import './assets/main.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import App from './App.vue'
import router from './router'

const SubfolioPreset = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: '4px',
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)'
    }
  },
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
    formField: {
      borderRadius: '{border.radius.md}'
    },
    content: {
      borderRadius: '{border.radius.md}'
    },
    list: {
      option: {
        borderRadius: '{border.radius.sm}'
      }
    },
    navigation: {
      item: {
        borderRadius: '{border.radius.sm}'
      }
    },
    overlay: {
      select: {
        borderRadius: '{border.radius.md}'
      },
      popover: {
        borderRadius: '{border.radius.md}'
      },
      modal: {
        borderRadius: '{border.radius.lg}'
      }
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
    button: {
      root: {
        borderRadius: '{border.radius.md}',
        gap: '0.5rem',
        paddingX: '1rem',
        paddingY: '0.7rem',
        iconOnlyWidth: '2.75rem'
      }
    },
    datatable: {
      css: `
        .p-datatable {
          --p-datatable-border-radius: var(--radius-md);
          border-radius: var(--p-datatable-border-radius);
          min-width: 0;
        }

        .p-datatable-table-container {
          border-radius: var(--p-datatable-border-radius);
          overflow: auto;
        }

        .p-datatable-paginator-bottom {
          border-end-start-radius: var(--p-datatable-border-radius);
          border-end-end-radius: var(--p-datatable-border-radius);
        }

        .p-datatable:has(.p-datatable-paginator-bottom) .p-datatable-table-container {
          border-end-start-radius: 0;
          border-end-end-radius: 0;
        }
      `
    },
    menu: {
      root: {
        borderRadius: '{border.radius.md}'
      },
      list: {
        padding: '0.35rem',
        gap: '0.2rem'
      },
      item: {
        borderRadius: '{border.radius.sm}',
        color: '{content.color}',
        focusColor: '{content.color}',
        gap: '0.65rem',
        padding: '0.72rem 0.8rem',
        icon: {
          color: '{content.color}',
          focusColor: '{content.color}'
        }
      }
    },
    confirmdialog: {
      content: {
        gap: '1rem'
      }
    },
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
  .use(ConfirmationService)
  .use(ToastService)
  .use(router)
  .mount('#app')
