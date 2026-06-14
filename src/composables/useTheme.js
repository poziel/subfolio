import { computed, ref } from 'vue'

const storageKey = 'subfolio-theme'
const themeOptions = ['system', 'light', 'dark']

const getBrowserTheme = () => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const loadThemePreference = () => {
  if (typeof localStorage === 'undefined') return 'system'
  const stored = localStorage.getItem(storageKey)
  return themeOptions.includes(stored) ? stored : 'system'
}

const themePreference = ref(loadThemePreference())
const systemTheme = ref(getBrowserTheme())

const activeTheme = computed(() =>
  themePreference.value === 'system' ? systemTheme.value : themePreference.value
)

const applyTheme = () => {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = activeTheme.value
  document.documentElement.classList.toggle('subfolio-dark', activeTheme.value === 'dark')
}

if (typeof window !== 'undefined') {
  const media = window.matchMedia?.('(prefers-color-scheme: dark)')
  media?.addEventListener('change', (event) => {
    systemTheme.value = event.matches ? 'dark' : 'light'
    applyTheme()
  })
  applyTheme()
}

const setThemePreference = (value) => {
  if (!themeOptions.includes(value)) return
  themePreference.value = value
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(storageKey, value)
  }
  applyTheme()
}

const toggleTheme = () => {
  setThemePreference(activeTheme.value === 'dark' ? 'light' : 'dark')
}

export function useTheme() {
  applyTheme()

  return {
    themeOptions,
    themePreference,
    activeTheme,
    setThemePreference,
    toggleTheme
  }
}
