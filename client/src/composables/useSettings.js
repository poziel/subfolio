import { computed, reactive, ref, watch } from 'vue'

const storageKey = 'subfolio-settings'

const defaultSettings = {
  displayedCurrency: 'CAD',
  availableCurrencies: ['CAD', 'USD', 'EUR', 'GBP', 'AUD'],
  defaultOrdering: 'dateAdded'
}

const allCurrencies = ['CAD', 'USD', 'EUR', 'GBP', 'AUD', 'NZD', 'JPY', 'CHF', 'MXN', 'BRL', 'SGD']

const symbolMap = {
  USD: '$',
  CAD: '$',
  EUR: '€',
  GBP: '£',
  AUD: '$',
  NZD: '$',
  JPY: '¥',
  CHF: 'CHF',
  MXN: '$',
  BRL: 'R$',
  SGD: '$'
}

const settingsState = ref(loadSettings())

const rateState = reactive({
  base: settingsState.value.displayedCurrency,
  rates: { [settingsState.value.displayedCurrency]: 1 },
  status: 'idle',
  updatedAt: null,
  error: null
})

let ratesInitialized = false

function loadSettings() {
  if (typeof localStorage === 'undefined') return { ...defaultSettings }
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return { ...defaultSettings }
    const parsed = JSON.parse(raw)
    return {
      displayedCurrency: parsed.displayedCurrency || defaultSettings.displayedCurrency,
      availableCurrencies: Array.isArray(parsed.availableCurrencies) && parsed.availableCurrencies.length
        ? parsed.availableCurrencies
        : [...defaultSettings.availableCurrencies],
      defaultOrdering: parsed.defaultOrdering || defaultSettings.defaultOrdering
    }
  } catch {
    return { ...defaultSettings }
  }
}

function persistSettings() {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(storageKey, JSON.stringify(settingsState.value))
}

const displayedCurrency = computed(() => settingsState.value.displayedCurrency || defaultSettings.displayedCurrency)

const availableCurrencies = computed(() => {
  const baseList = settingsState.value.availableCurrencies?.length
    ? settingsState.value.availableCurrencies
    : defaultSettings.availableCurrencies
  const merged = new Set(baseList)
  merged.add(displayedCurrency.value)
  return Array.from(merged).filter((c) => allCurrencies.includes(c))
})

const conversionStatus = computed(() => rateState.status)

const formatMoney = (amount, currency, opts = {}) => {
  const value = Number(amount) || 0
  const symbol = symbolMap[currency] || ''
  const withCode = opts.withCode ?? false
  const formatted = `${symbol}${value.toFixed(2)}`
  return withCode ? `${formatted} ${currency}` : formatted
}

const setDisplayedCurrency = (currency) => {
  if (!allCurrencies.includes(currency)) return
  settingsState.value = {
    ...settingsState.value,
    displayedCurrency: currency
  }
  persistSettings()
  fetchRates(currency)
}

const setAvailableCurrencies = (currencies) => {
  const sanitized = (currencies || []).filter((c) => allCurrencies.includes(c))
  settingsState.value = {
    ...settingsState.value,
    availableCurrencies: sanitized.length ? sanitized : [...defaultSettings.availableCurrencies]
  }
  persistSettings()
}

const ensureRates = () => {
  if (ratesInitialized) return
  ratesInitialized = true
  fetchRates(displayedCurrency.value)
}

const fetchRates = async (base) => {
  rateState.status = 'loading'
  rateState.error = null
  try {
    const response = await fetch(`https://api.vatcomply.com/rates?base=${base}`)
    if (!response.ok) throw new Error('Failed to load rates')
    const data = await response.json()
    rateState.base = data.base || base
    rateState.rates = { ...data.rates, [data.base]: 1 }
    rateState.updatedAt = data.date || new Date().toISOString()
    rateState.status = 'ready'
  } catch (error) {
    rateState.status = 'error'
    rateState.error = error?.message || 'Unable to load exchange rates'
    rateState.base = base
    rateState.rates = { [base]: 1 }
  }
}

const convertAmount = (amount, fromCurrency, toCurrency = displayedCurrency.value) => {
  if (fromCurrency === toCurrency) return Number(amount) || 0
  if (rateState.base !== toCurrency) return Number(amount) || 0
  const rate = rateState.rates[fromCurrency]
  if (!rate) return Number(amount) || 0
  return (Number(amount) || 0) / rate
}

const convertToDisplayed = (amount, fromCurrency) => convertAmount(amount, fromCurrency, displayedCurrency.value)

const getConversionTooltip = (amount, currency) => {
  if (!currency || currency === displayedCurrency.value) return ''
  const converted = convertToDisplayed(amount, currency)
  return `${formatMoney(converted, displayedCurrency.value)} ${displayedCurrency.value}`
}

watch(displayedCurrency, (currency) => {
  fetchRates(currency)
  persistSettings()
})

watch(settingsState, () => {
  persistSettings()
}, { deep: true })

const defaultOrdering = computed({
  get: () => settingsState.value.defaultOrdering,
  set: (value) => {
    settingsState.value.defaultOrdering = value
    persistSettings()
  }
})

function setDefaultOrdering(value) {
  defaultOrdering.value = value
}

export function useSettings() {
  ensureRates()

  return {
    // state
    displayedCurrency,
    availableCurrencies,
    allCurrencies,
    conversionStatus,
    defaultOrdering,

    // formatting
    formatMoney,
    getConversionTooltip,
    convertToDisplayed,
    convertAmount,

    // actions
    setDisplayedCurrency,
    setAvailableCurrencies,
    setDefaultOrdering
  }
}
