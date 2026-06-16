import { computed, reactive, ref, watch } from 'vue'

const storageKey = 'subfolio-settings'

const defaultSettings = {
  displayedCurrency: 'CAD',
  availableCurrencies: ['CAD', 'USD', 'EUR', 'GBP', 'AUD'],
  defaultOrdering: 'dateAdded',
  contentLayoutMode: 'fluid',
  selectedMetricIds: ['activeRecurrences', 'monthlyTotal', 'yearlyTotal', 'nextRecurrence'],
  incomeType: 'annual',
  salaryCurrency: 'CAD',
  annualSalary: null,
  hourlyRate: null,
  hoursPerWeek: 40,
  weeksPerYear: 52
}

const allCurrencies = ['CAD', 'USD', 'EUR', 'GBP', 'AUD', 'NZD', 'JPY', 'CHF', 'MXN', 'BRL', 'SGD']
const metricIds = [
  'activeRecurrences',
  'monthlyTotal',
  'yearlyTotal',
  'nextRecurrence',
  'weeklyTotal',
  'dailyTotal',
  'biWeeklyTotal'
]
const contentLayoutModes = ['fluid', 'focused']

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

function sanitizeMetricIds(value) {
  if (!Array.isArray(value)) return [...defaultSettings.selectedMetricIds]

  const unique = []
  value.forEach((id) => {
    if (metricIds.includes(id) && !unique.includes(id)) {
      unique.push(id)
    }
  })

  return unique.slice(0, 4)
}

function normalizeMetricSlots(value) {
  return [...sanitizeMetricIds(value), '', '', '', ''].slice(0, 4)
}

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
      defaultOrdering: parsed.defaultOrdering || defaultSettings.defaultOrdering,
      contentLayoutMode: contentLayoutModes.includes(parsed.contentLayoutMode)
        ? parsed.contentLayoutMode
        : defaultSettings.contentLayoutMode,
      selectedMetricIds: Object.prototype.hasOwnProperty.call(parsed, 'selectedMetricIds')
        ? sanitizeMetricIds(parsed.selectedMetricIds)
        : [...defaultSettings.selectedMetricIds],
      incomeType: ['annual', 'hourly'].includes(parsed.incomeType)
        ? parsed.incomeType
        : defaultSettings.incomeType,
      salaryCurrency: allCurrencies.includes(parsed.salaryCurrency)
        ? parsed.salaryCurrency
        : parsed.displayedCurrency || defaultSettings.salaryCurrency,
      annualSalary: Number(parsed.annualSalary) > 0 ? Number(parsed.annualSalary) : null,
      hourlyRate: Number(parsed.hourlyRate) > 0 ? Number(parsed.hourlyRate) : null,
      hoursPerWeek: Number(parsed.hoursPerWeek) > 0 ? Number(parsed.hoursPerWeek) : defaultSettings.hoursPerWeek,
      weeksPerYear: Number(parsed.weeksPerYear) > 0 ? Number(parsed.weeksPerYear) : defaultSettings.weeksPerYear
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
  const safeCurrency = allCurrencies.includes(currency) ? currency : displayedCurrency.value
  const withCode = opts.withCode ?? false

  try {
    const formatted = new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: safeCurrency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)

    return withCode ? `${formatted} ${safeCurrency}` : formatted
  } catch {
    const symbol = symbolMap[safeCurrency] || ''
    const formatted = `${symbol}${new Intl.NumberFormat('en-CA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)}`
    return withCode ? `${formatted} ${safeCurrency}` : formatted
  }
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

const contentLayoutMode = computed({
  get: () => contentLayoutModes.includes(settingsState.value.contentLayoutMode)
    ? settingsState.value.contentLayoutMode
    : defaultSettings.contentLayoutMode,
  set: (value) => {
    if (!contentLayoutModes.includes(value)) return
    settingsState.value.contentLayoutMode = value
    persistSettings()
  }
})

function setContentLayoutMode(value) {
  contentLayoutMode.value = value
}

const selectedMetricIds = computed({
  get: () => sanitizeMetricIds(settingsState.value.selectedMetricIds),
  set: (value) => {
    settingsState.value.selectedMetricIds = sanitizeMetricIds(value)
    persistSettings()
  }
})

function setSelectedMetricIds(value) {
  selectedMetricIds.value = value
}

const selectedMetricSlots = computed({
  get: () => normalizeMetricSlots(settingsState.value.selectedMetricIds),
  set: (value) => {
    settingsState.value.selectedMetricIds = sanitizeMetricIds(value)
    persistSettings()
  }
})

function setSelectedMetricSlots(value) {
  selectedMetricSlots.value = value
}

const incomeType = computed({
  get: () => settingsState.value.incomeType || defaultSettings.incomeType,
  set: (value) => {
    if (!['annual', 'hourly'].includes(value)) return
    settingsState.value.incomeType = value
    persistSettings()
  }
})

const salaryCurrency = computed({
  get: () => settingsState.value.salaryCurrency || displayedCurrency.value,
  set: (value) => {
    if (!allCurrencies.includes(value)) return
    settingsState.value.salaryCurrency = value
    persistSettings()
  }
})

const annualSalary = computed({
  get: () => settingsState.value.annualSalary,
  set: (value) => {
    settingsState.value.annualSalary = Number(value) > 0 ? Number(value) : null
    persistSettings()
  }
})

const hourlyRate = computed({
  get: () => settingsState.value.hourlyRate,
  set: (value) => {
    settingsState.value.hourlyRate = Number(value) > 0 ? Number(value) : null
    persistSettings()
  }
})

const hoursPerWeek = computed({
  get: () => settingsState.value.hoursPerWeek || defaultSettings.hoursPerWeek,
  set: (value) => {
    settingsState.value.hoursPerWeek = Number(value) > 0 ? Number(value) : defaultSettings.hoursPerWeek
    persistSettings()
  }
})

const weeksPerYear = computed({
  get: () => settingsState.value.weeksPerYear || defaultSettings.weeksPerYear,
  set: (value) => {
    settingsState.value.weeksPerYear = Number(value) > 0 ? Number(value) : defaultSettings.weeksPerYear
    persistSettings()
  }
})

const annualIncome = computed(() => {
  if (incomeType.value === 'hourly') {
    return (Number(hourlyRate.value) || 0) * hoursPerWeek.value * weeksPerYear.value
  }

  return Number(annualSalary.value) || 0
})

const annualIncomeDisplayed = computed(() =>
  convertToDisplayed(annualIncome.value, salaryCurrency.value)
)

export function useSettings() {
  ensureRates()

  return {
    // state
    displayedCurrency,
    availableCurrencies,
    allCurrencies,
    metricIds,
    contentLayoutModes,
    conversionStatus,
    defaultOrdering,
    contentLayoutMode,
    selectedMetricIds,
    selectedMetricSlots,
    incomeType,
    salaryCurrency,
    annualSalary,
    hourlyRate,
    hoursPerWeek,
    weeksPerYear,
    annualIncome,
    annualIncomeDisplayed,

    // formatting
    formatMoney,
    getConversionTooltip,
    convertToDisplayed,
    convertAmount,

    // actions
    setDisplayedCurrency,
    setAvailableCurrencies,
    setDefaultOrdering,
    setContentLayoutMode,
    setSelectedMetricIds,
    setSelectedMetricSlots
  }
}
