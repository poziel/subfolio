import { reactive, ref, computed } from 'vue'
import { useSettings } from './useSettings'
import { useDatabaseConnection } from './useDatabaseConnection'
import {
  getDefaultTaxRateOptionForCurrency,
  getTaxRateForCurrency,
  getTaxRateOptionForSelection,
  getTaxRateOptionsForCurrency
} from '../data/taxRates'
import {
  buildRecurrenceSchedule,
  buildRecurrenceSummary,
  deriveLegacyDatePattern,
  deriveLegacyFrequency,
  formatDateOnly,
  getTimesPerYearFromRepeat,
  normalizeRecurrenceSchedule,
  normalizeRepeatInterval,
  normalizeRepeatPattern,
  normalizeRepeatUnit,
  normalizeScheduleType,
  parseDateOnly,
  repeatPatterns,
  repeatUnits,
  repeatUnitSupportsPattern,
  scheduleTypes
} from '../data/recurrenceRules'
import { findKnownService, findKnownServiceById, getCategoryIcon } from '../data/serviceCatalog'
import { createExpenseConnection } from '../services/database/expenseConnections'

const { displayedCurrency, availableCurrencies, allCurrencies } = useSettings()
const { connection, connectionVersion } = useDatabaseConnection()

// Supported currencies (full list for validation)
const currencyUniverse = allCurrencies

// Frequency options
const frequencyOptions = [
  { value: 'once', label: 'Once', timesPerYear: 1 },
  { value: 'yearly', label: 'Yearly', timesPerYear: 1 },
  { value: 'monthly', label: 'Monthly', timesPerYear: 12 },
  { value: 'weekly', label: 'Weekly', timesPerYear: 52 },
  { value: 'bi-weekly', label: 'Bi-Weekly', timesPerYear: 26 },
  { value: 'daily', label: 'Daily', timesPerYear: 365 },
  { value: 'quarterly', label: 'Quarterly', timesPerYear: 4 },
  { value: 'semi-annually', label: 'Semi-Annually', timesPerYear: 2 },
  { value: 'custom', label: 'Custom', timesPerYear: null }
]

// Date pattern types based on frequency
const datePatternTypes = {
  once: [
    { value: 'once', label: 'One-time payment' }
  ],
  weekly: [
    { value: 'day-of-week', label: 'Day of week' } // e.g., Every Monday
  ],
  'bi-weekly': [
    { value: 'day-of-week', label: 'Day of week' } // e.g., Every other Monday
  ],
  daily: [
    { value: 'interval', label: 'Every X days' }
  ],
  monthly: [
    { value: 'day-of-month', label: 'Day of month' }, // e.g., 15th of each month
    { value: 'nth-weekday', label: 'Nth weekday of month' } // e.g., 2nd Tuesday
  ],
  quarterly: [
    { value: 'day-of-month', label: 'Day of month' }, // e.g., 15th of quarter start
    { value: 'nth-weekday', label: 'Nth weekday of month' }
  ],
  'semi-annually': [
    { value: 'day-of-month', label: 'Day of month' },
    { value: 'specific-date', label: 'Specific dates' } // e.g., Jan 15 and Jul 15
  ],
  yearly: [
    { value: 'day-of-year', label: 'Day of year' }, // e.g., March 15th
    { value: 'nth-weekday-year', label: 'Nth weekday of month' } // e.g., 3rd Monday of March
  ],
  custom: [
    { value: 'day-of-month', label: 'Day of month' },
    { value: 'day-of-year', label: 'Day of year' },
    { value: 'nth-weekday', label: 'Nth weekday of month' },
    { value: 'interval', label: 'Every X days' }
  ]
}

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const ordinals = ['1st', '2nd', '3rd', '4th', 'Last']
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Shared state
const expenses = ref([])
const categories = ref([])
const status = ref('idle')
const statusError = ref('')
const saving = ref(false)
const showAddModal = ref(false)
const editingId = ref(null)

const baseCategories = ['Subscriptions', 'Utilities', 'Groceries', 'Housing', 'Wellness', 'Entertainment', 'Insurance', 'Transportation']
const extraCategories = ref([])

const currencies = computed(() => {
  const allowed = availableCurrencies.value?.length ? availableCurrencies.value : currencyUniverse
  const merged = new Set(allowed)
  expenses.value.forEach((item) => {
    if (item.currency) merged.add(item.currency)
  })
  if (form.currency) merged.add(form.currency)
  merged.add(displayedCurrency.value)
  return Array.from(merged)
})

const getAutoTaxRate = (currency) => getTaxRateForCurrency(currency)
const getAutoTaxRateId = (currency) => getDefaultTaxRateOptionForCurrency(currency)?.id || null
const getTaxRateOptions = (currency) => getTaxRateOptionsForCurrency(currency)
const getSelectedTaxRateOption = (currency, taxRateId, taxRate) =>
  getTaxRateOptionForSelection(currency, taxRateId, taxRate)
const getNormalizedRecurrence = (expense = {}) =>
  normalizeRecurrenceSchedule(expense.recurrenceSchedule, expense)
const getRecurrenceSummary = (expense = {}, locale = 'en') => {
  const recurrence = getNormalizedRecurrence(expense)
  return buildRecurrenceSummary({
    scheduleType: recurrence.scheduleType || expense.scheduleType,
    paymentDate: recurrence.paymentDate || expense.paymentDate || expense.startDate,
    repeatInterval: recurrence.repeat?.interval || expense.repeatInterval,
    repeatUnit: recurrence.repeat?.unit || expense.repeatUnit,
    repeatPattern: recurrence.repeatPattern || expense.repeatPattern,
    paymentTimezone: recurrence.timezone || expense.paymentTimezone
  }, locale)
}

// Default form state
const getDefaultForm = () => ({
  name: '',
  presetId: null,
  category: 'Subscriptions',
  amount: '',
  currency: displayedCurrency.value || 'CAD',
  url: '',
  icon: '',
  note: '',
  includesTax: true,
  taxRateId: null,
  taxRate: 0,
  scheduleType: 'recurring',
  paymentDate: new Date().toISOString().slice(0, 10),
  repeatInterval: 1,
  repeatUnit: 'month',
  repeatPattern: 'same-calendar-day',
  frequency: 'monthly',
  startDate: new Date().toISOString().slice(0, 10),
  startTime: null,
  datePattern: {
    type: 'day-of-month',
    dayOfMonth: 1,
    dayOfWeek: 1, // Monday
    nthWeek: 1, // 1st
    month: 0, // January
    intervalDays: 1,
    intervalHours: 1
  }
})

const form = reactive(getDefaultForm())

let activeUnsubscribe = null
let activeConnectionKey = null

const localFallback = [
  {
    id: 1,
    name: 'Netflix',
    category: 'Subscriptions',
    frequency: 'monthly',
    amount: 22.99,
    currency: 'CAD',
    url: 'https://netflix.com',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-15',
    datePattern: { type: 'day-of-month', dayOfMonth: 15 },
    active: true
  },
  {
    id: 2,
    name: 'Spotify Premium',
    category: 'Subscriptions',
    frequency: 'monthly',
    amount: 10.99,
    currency: 'EUR',
    url: 'https://spotify.com',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-09',
    datePattern: { type: 'day-of-month', dayOfMonth: 9 },
    active: true
  },
  {
    id: 3,
    name: 'Adobe Creative Cloud',
    category: 'Subscriptions',
    frequency: 'monthly',
    amount: 29.99,
    currency: 'USD',
    url: 'https://adobe.com',
    includesTax: false,
    taxRate: 0,
    startDate: '2026-01-03',
    datePattern: { type: 'day-of-month', dayOfMonth: 3 },
    active: true
  },
  {
    id: 4,
    name: 'Notion Plus',
    category: 'Subscriptions',
    frequency: 'yearly',
    amount: 120,
    currency: 'USD',
    url: 'https://notion.so',
    includesTax: true,
    taxRate: 0,
    startDate: '2025-02-14',
    datePattern: { type: 'day-of-year', month: 1, dayOfMonth: 14 },
    active: true
  },
  {
    id: 5,
    name: 'Microsoft 365',
    category: 'Subscriptions',
    frequency: 'yearly',
    amount: 99,
    currency: 'CAD',
    url: 'https://microsoft.com',
    includesTax: true,
    taxRate: 0,
    startDate: '2025-10-02',
    datePattern: { type: 'day-of-year', month: 9, dayOfMonth: 2 },
    active: true
  },
  {
    id: 6,
    name: 'iCloud+',
    category: 'Subscriptions',
    frequency: 'monthly',
    amount: 3.99,
    currency: 'CAD',
    url: 'https://apple.com',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-21',
    datePattern: { type: 'day-of-month', dayOfMonth: 21 },
    active: true
  },
  {
    id: 7,
    name: 'Amazon Prime',
    category: 'Subscriptions',
    frequency: 'yearly',
    amount: 99,
    currency: 'CAD',
    url: 'https://amazon.com',
    includesTax: true,
    taxRate: 0,
    startDate: '2025-07-18',
    datePattern: { type: 'day-of-year', month: 6, dayOfMonth: 18 },
    active: true
  },
  {
    id: 8,
    name: 'HBO Max',
    category: 'Subscriptions',
    frequency: 'monthly',
    amount: 15.99,
    currency: 'USD',
    url: 'https://max.com',
    includesTax: false,
    taxRate: 0,
    startDate: '2026-01-06',
    datePattern: { type: 'day-of-month', dayOfMonth: 6 },
    active: true
  },
  {
    id: 9,
    name: 'Figma Pro',
    category: 'Subscriptions',
    frequency: 'monthly',
    amount: 12,
    currency: 'USD',
    url: 'https://figma.com',
    includesTax: false,
    taxRate: 0,
    startDate: '2026-01-28',
    datePattern: { type: 'day-of-month', dayOfMonth: 28 },
    active: true
  },
  {
    id: 10,
    name: 'YouTube Premium',
    category: 'Subscriptions',
    frequency: 'monthly',
    amount: 11.99,
    currency: 'USD',
    url: 'https://youtube.com',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-11',
    datePattern: { type: 'day-of-month', dayOfMonth: 11 },
    active: true
  },
  {
    id: 11,
    name: 'Hydro Quebec',
    category: 'Utilities',
    frequency: 'monthly',
    amount: 118,
    currency: 'CAD',
    url: '',
    includesTax: false,
    taxRate: 5,
    startDate: '2026-01-21',
    datePattern: { type: 'day-of-month', dayOfMonth: 21 },
    active: true
  },
  {
    id: 12,
    name: 'Fiber Internet',
    category: 'Utilities',
    frequency: 'monthly',
    amount: 79,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-12',
    datePattern: { type: 'day-of-month', dayOfMonth: 12 },
    active: true
  },
  {
    id: 13,
    name: 'Mobile Plan',
    category: 'Utilities',
    frequency: 'monthly',
    amount: 65,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-04',
    datePattern: { type: 'day-of-month', dayOfMonth: 4 },
    active: true
  },
  {
    id: 14,
    name: 'Water Service',
    category: 'Utilities',
    frequency: 'quarterly',
    amount: 90,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-05',
    datePattern: { type: 'day-of-month', dayOfMonth: 5 },
    active: true
  },
  {
    id: 15,
    name: 'Gas Heating',
    category: 'Utilities',
    frequency: 'monthly',
    amount: 54,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-17',
    datePattern: { type: 'day-of-month', dayOfMonth: 17 },
    active: true
  },
  {
    id: 16,
    name: 'Garbage Pickup',
    category: 'Utilities',
    frequency: 'yearly',
    amount: 120,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2025-03-10',
    datePattern: { type: 'day-of-year', month: 2, dayOfMonth: 10 },
    active: true
  },
  {
    id: 17,
    name: 'Local Market',
    category: 'Groceries',
    frequency: 'weekly',
    amount: 85,
    currency: 'CAD',
    url: '',
    includesTax: false,
    taxRate: 5,
    startDate: '2026-01-04',
    datePattern: { type: 'day-of-week', dayOfWeek: 6 },
    active: true
  },
  {
    id: 18,
    name: 'Bulk Foods',
    category: 'Groceries',
    frequency: 'weekly',
    amount: 45,
    currency: 'CAD',
    url: '',
    includesTax: false,
    taxRate: 5,
    startDate: '2026-01-07',
    datePattern: { type: 'day-of-week', dayOfWeek: 3 },
    active: true
  },
  {
    id: 19,
    name: 'Organic Produce Box',
    category: 'Groceries',
    frequency: 'bi-weekly',
    amount: 62,
    currency: 'CAD',
    url: '',
    includesTax: false,
    taxRate: 5,
    startDate: '2026-01-06',
    datePattern: { type: 'day-of-week', dayOfWeek: 2 },
    active: true
  },
  {
    id: 20,
    name: 'Coffee Beans',
    category: 'Groceries',
    frequency: 'monthly',
    amount: 28,
    currency: 'CAD',
    url: '',
    includesTax: false,
    taxRate: 5,
    startDate: '2026-01-07',
    datePattern: { type: 'day-of-month', dayOfMonth: 7 },
    active: true
  },
  {
    id: 21,
    name: 'Farmers Co-op',
    category: 'Groceries',
    frequency: 'monthly',
    amount: 54,
    currency: 'CAD',
    url: '',
    includesTax: false,
    taxRate: 5,
    startDate: '2026-01-26',
    datePattern: { type: 'day-of-month', dayOfMonth: 26 },
    active: true
  },
  {
    id: 22,
    name: 'Pet Food',
    category: 'Groceries',
    frequency: 'monthly',
    amount: 42,
    currency: 'CAD',
    url: '',
    includesTax: false,
    taxRate: 5,
    startDate: '2026-01-19',
    datePattern: { type: 'day-of-month', dayOfMonth: 19 },
    active: true
  },
  {
    id: 23,
    name: 'Snack Delivery',
    category: 'Groceries',
    frequency: 'monthly',
    amount: 18,
    currency: 'CAD',
    url: '',
    includesTax: false,
    taxRate: 5,
    startDate: '2026-01-01',
    datePattern: { type: 'day-of-month', dayOfMonth: 1 },
    active: false
  },
  {
    id: 24,
    name: 'Rent',
    category: 'Housing',
    frequency: 'monthly',
    amount: 1600,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-01',
    datePattern: { type: 'day-of-month', dayOfMonth: 1 },
    active: true
  },
  {
    id: 25,
    name: 'Condo Fees',
    category: 'Housing',
    frequency: 'monthly',
    amount: 340,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-03',
    datePattern: { type: 'day-of-month', dayOfMonth: 3 },
    active: true
  },
  {
    id: 26,
    name: 'Property Tax',
    category: 'Housing',
    frequency: 'yearly',
    amount: 2800,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2025-06-20',
    datePattern: { type: 'day-of-year', month: 5, dayOfMonth: 20 },
    active: true
  },
  {
    id: 27,
    name: 'Home Insurance',
    category: 'Insurance',
    frequency: 'yearly',
    amount: 1200,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2025-04-02',
    datePattern: { type: 'day-of-year', month: 3, dayOfMonth: 2 },
    active: true
  },
  {
    id: 28,
    name: 'Mortgage',
    category: 'Housing',
    frequency: 'monthly',
    amount: 980,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-15',
    datePattern: { type: 'day-of-month', dayOfMonth: 15 },
    active: true
  },
  {
    id: 29,
    name: 'Home Cleaning',
    category: 'Housing',
    frequency: 'bi-weekly',
    amount: 120,
    currency: 'CAD',
    url: '',
    includesTax: false,
    taxRate: 5,
    startDate: '2026-01-09',
    datePattern: { type: 'day-of-week', dayOfWeek: 5 },
    active: true
  },
  {
    id: 30,
    name: 'Gym Membership',
    category: 'Wellness',
    frequency: 'monthly',
    amount: 64,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-01',
    datePattern: { type: 'day-of-month', dayOfMonth: 1 },
    active: true
  },
  {
    id: 31,
    name: 'Yoga Studio',
    category: 'Wellness',
    frequency: 'monthly',
    amount: 110,
    currency: 'CAD',
    url: '',
    includesTax: false,
    taxRate: 5,
    startDate: '2026-01-10',
    datePattern: { type: 'day-of-month', dayOfMonth: 10 },
    active: true
  },
  {
    id: 32,
    name: 'Therapy Session Pack',
    category: 'Wellness',
    frequency: 'bi-weekly',
    amount: 140,
    currency: 'CAD',
    url: '',
    includesTax: false,
    taxRate: 5,
    startDate: '2026-01-05',
    datePattern: { type: 'day-of-week', dayOfWeek: 1 },
    active: true
  },
  {
    id: 33,
    name: 'Vitamins',
    category: 'Wellness',
    frequency: 'monthly',
    amount: 24,
    currency: 'CAD',
    url: '',
    includesTax: false,
    taxRate: 5,
    startDate: '2026-01-06',
    datePattern: { type: 'day-of-month', dayOfMonth: 6 },
    active: true
  },
  {
    id: 34,
    name: 'Health Insurance',
    category: 'Wellness',
    frequency: 'monthly',
    amount: 210,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-22',
    datePattern: { type: 'day-of-month', dayOfMonth: 22 },
    active: true
  },
  {
    id: 35,
    name: 'Massage Package',
    category: 'Wellness',
    frequency: 'quarterly',
    amount: 180,
    currency: 'CAD',
    url: '',
    includesTax: false,
    taxRate: 5,
    startDate: '2026-01-14',
    datePattern: { type: 'day-of-month', dayOfMonth: 14 },
    active: true
  },
  {
    id: 36,
    name: 'Meditation App',
    category: 'Wellness',
    frequency: 'monthly',
    amount: 9.99,
    currency: 'USD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-23',
    datePattern: { type: 'day-of-month', dayOfMonth: 23 },
    active: false
  },
  {
    id: 37,
    name: 'Cinema Pass',
    category: 'Entertainment',
    frequency: 'monthly',
    amount: 24,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-08',
    datePattern: { type: 'day-of-month', dayOfMonth: 8 },
    active: true
  },
  {
    id: 38,
    name: 'Game Subscription',
    category: 'Entertainment',
    frequency: 'monthly',
    amount: 16,
    currency: 'USD',
    url: '',
    includesTax: false,
    taxRate: 0,
    startDate: '2026-01-27',
    datePattern: { type: 'day-of-month', dayOfMonth: 27 },
    active: true
  },
  {
    id: 39,
    name: 'Concert Fund',
    category: 'Entertainment',
    frequency: 'monthly',
    amount: 40,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-30',
    datePattern: { type: 'day-of-month', dayOfMonth: 30 },
    active: true
  },
  {
    id: 40,
    name: 'Streaming Rentals',
    category: 'Entertainment',
    frequency: 'monthly',
    amount: 12,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-13',
    datePattern: { type: 'day-of-month', dayOfMonth: 13 },
    active: true
  },
  {
    id: 41,
    name: 'Book Club',
    category: 'Entertainment',
    frequency: 'monthly',
    amount: 25,
    currency: 'GBP',
    url: '',
    includesTax: false,
    taxRate: 20,
    startDate: '2026-01-16',
    datePattern: { type: 'day-of-month', dayOfMonth: 16 },
    active: true
  },
  {
    id: 42,
    name: 'Sports League',
    category: 'Entertainment',
    frequency: 'yearly',
    amount: 220,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2025-09-28',
    datePattern: { type: 'day-of-year', month: 8, dayOfMonth: 28 },
    active: true
  },
  {
    id: 43,
    name: 'Auto Insurance',
    category: 'Insurance',
    frequency: 'monthly',
    amount: 135,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-02',
    datePattern: { type: 'day-of-month', dayOfMonth: 2 },
    active: true
  },
  {
    id: 44,
    name: 'Travel Insurance',
    category: 'Insurance',
    frequency: 'yearly',
    amount: 240,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2025-11-12',
    datePattern: { type: 'day-of-year', month: 10, dayOfMonth: 12 },
    active: true
  },
  {
    id: 45,
    name: 'Gadget Insurance',
    category: 'Insurance',
    frequency: 'monthly',
    amount: 12,
    currency: 'USD',
    url: '',
    includesTax: false,
    taxRate: 0,
    startDate: '2026-01-25',
    datePattern: { type: 'day-of-month', dayOfMonth: 25 },
    active: true
  },
  {
    id: 46,
    name: 'Life Insurance',
    category: 'Insurance',
    frequency: 'monthly',
    amount: 45,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-06',
    datePattern: { type: 'day-of-month', dayOfMonth: 6 },
    active: true
  },
  {
    id: 47,
    name: 'Transit Pass',
    category: 'Transportation',
    frequency: 'monthly',
    amount: 94,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2026-01-01',
    datePattern: { type: 'day-of-month', dayOfMonth: 1 },
    active: true
  },
  {
    id: 48,
    name: 'Rideshare Credits',
    category: 'Transportation',
    frequency: 'monthly',
    amount: 60,
    currency: 'CAD',
    url: '',
    includesTax: false,
    taxRate: 5,
    startDate: '2026-01-20',
    datePattern: { type: 'day-of-month', dayOfMonth: 20 },
    active: true
  },
  {
    id: 49,
    name: 'Vehicle Maintenance',
    category: 'Transportation',
    frequency: 'quarterly',
    amount: 180,
    currency: 'CAD',
    url: '',
    includesTax: false,
    taxRate: 5,
    startDate: '2026-01-09',
    datePattern: { type: 'day-of-month', dayOfMonth: 9 },
    active: true
  },
  {
    id: 50,
    name: 'Parking Permit',
    category: 'Transportation',
    frequency: 'yearly',
    amount: 180,
    currency: 'CAD',
    url: '',
    includesTax: true,
    taxRate: 0,
    startDate: '2025-05-05',
    datePattern: { type: 'day-of-year', month: 4, dayOfMonth: 5 },
    active: true
  }
]

// Calculate effective amount (with tax if not included)
const getEffectiveAmount = (expense) => {
  const amount = Number(expense.amount)
  if (expense.includesTax || !expense.taxRate) {
    return amount
  }
  return amount * (1 + expense.taxRate / 100)
}

// Calculate times per year for an expense
const getTimesPerYear = (expense) => {
  if (expense.scheduleType === 'one-time' || expense.recurrenceSchedule?.scheduleType === 'one-time') {
    return 1
  }

  if (expense.repeatUnit || expense.recurrenceSchedule?.repeat) {
    return getTimesPerYearFromRepeat(expense)
  }

  if (expense.frequency === 'hourly') {
    return getTimesPerYearFromRepeat(expense)
  }

  const freq = frequencyOptions.find(f => f.value === expense.frequency)
  return Number.isFinite(freq?.timesPerYear)
    ? freq.timesPerYear
    : getTimesPerYearFromRepeat(expense)
}

// Calculate yearly amount for an expense
const getYearlyAmount = (expense) => {
  const effectiveAmount = getEffectiveAmount(expense)
  const timesPerYear = getTimesPerYear(expense)
  return effectiveAmount * timesPerYear
}

const toDate = (value) => {
  return parseDateOnly(value)
}

const addDays = (date, days) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const addMonths = (date, months) => {
  const next = new Date(date)
  const day = next.getDate()
  next.setDate(1)
  next.setMonth(next.getMonth() + months)
  const daysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
  next.setDate(Math.min(day, daysInMonth))
  return next
}

const getNthWeekdayOfMonth = (year, month, nthWeek, dayOfWeek) => {
  const firstDay = new Date(year, month, 1)
  const firstDayOfWeek = firstDay.getDay()
  const offset = (dayOfWeek - firstDayOfWeek + 7) % 7
  if (nthWeek === 5) {
    const lastDay = new Date(year, month + 1, 0)
    const lastDow = lastDay.getDay()
    const backwards = (lastDow - dayOfWeek + 7) % 7
    return new Date(year, month, lastDay.getDate() - backwards)
  }
  const day = 1 + offset + (nthWeek - 1) * 7
  return new Date(year, month, day)
}

const getCalendarMonthCandidate = (monthAnchor, anchorDate) => {
  const max = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0).getDate()
  return new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), Math.min(anchorDate.getDate(), max))
}

const getRelativeMonthCandidate = (monthAnchor, pattern) => (
  getNthWeekdayOfMonth(
    monthAnchor.getFullYear(),
    monthAnchor.getMonth(),
    pattern.nthWeek || 1,
    pattern.dayOfWeek ?? 1
  )
)

const getNextOccurrence = (expense, referenceDate = new Date()) => {
  const recurrence = getNormalizedRecurrence(expense)
  const anchorDate = toDate(recurrence.paymentDate || recurrence.startsOn)
  if (!anchorDate) return null
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate())

  if (recurrence.scheduleType === 'one-time') {
    return anchorDate >= today ? anchorDate : null
  }

  const repeatInterval = Number(recurrence.repeat?.interval || recurrence.repeatInterval) || 1
  const repeatUnit = recurrence.repeat?.unit || recurrence.repeatUnit || 'month'

  if (anchorDate >= today) return anchorDate

  if (repeatUnit === 'day') {
    const steps = Math.ceil((today.getTime() - anchorDate.getTime()) / (repeatInterval * 86400000))
    return addDays(anchorDate, steps * repeatInterval)
  }

  if (repeatUnit === 'week') {
    const steps = Math.ceil((today.getTime() - anchorDate.getTime()) / (repeatInterval * 7 * 86400000))
    return addDays(anchorDate, steps * repeatInterval * 7)
  }

  const intervalMonths = repeatUnit === 'year' ? repeatInterval * 12 : repeatInterval
  const pattern = recurrence.pattern || {}
  let monthAnchor = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1)
  let candidate = pattern.type === 'same-relative-weekday'
    ? getRelativeMonthCandidate(monthAnchor, pattern)
    : getCalendarMonthCandidate(monthAnchor, anchorDate)

  while (candidate < today) {
    monthAnchor = addMonths(monthAnchor, intervalMonths)
    candidate = pattern.type === 'same-relative-weekday'
      ? getRelativeMonthCandidate(monthAnchor, pattern)
      : getCalendarMonthCandidate(monthAnchor, anchorDate)
  }

  return candidate
}

export function useExpenses() {
  const normalizeCategory = (value) => String(value || '').trim()
  const normalizeCategoryKey = (value) => normalizeCategory(value).toLowerCase()
  const isLocalCategoryId = (id) => String(id || '').startsWith('local-')
  const localCategoryId = (value) => {
    const normalized = normalizeCategoryKey(value)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    return `local-${normalized || 'category'}`
  }

  const normalizeCategoryStatus = (value) => (
    value === 'inactive' || value === false ? 'inactive' : 'active'
  )

  const registerCategory = (value) => {
    const normalized = normalizeCategory(value)
    if (!normalized) return

    if (!baseCategories.includes(normalized) && !extraCategories.value.includes(normalized)) {
      extraCategories.value = [...extraCategories.value, normalized]
    }
  }

  const normalizeCategoryRecord = (record = {}) => {
    const name = normalizeCategory(record.name || record.category) || baseCategories[0]
    const normalizedName = record.normalizedName || normalizeCategoryKey(name)
    const status = normalizeCategoryStatus(record.status ?? record.active)

    return {
      id: record.id || localCategoryId(name),
      user: record.user || '',
      name,
      normalizedName,
      status,
      active: status !== 'inactive',
      icon: record.icon || getCategoryIcon(name),
      createdAt: record.createdAt || null,
      updatedAt: record.updatedAt || null
    }
  }

  const mergeCategoryRecord = (record = {}) => {
    const category = normalizeCategoryRecord(record)
    const next = [...categories.value]
    const index = next.findIndex((item) =>
      (category.id && item.id === category.id) ||
      item.normalizedName === category.normalizedName
    )

    if (index === -1) {
      next.push(category)
    } else {
      next[index] = {
        ...next[index],
        ...category,
        id: isLocalCategoryId(next[index].id) && !isLocalCategoryId(category.id)
          ? category.id
          : next[index].id || category.id,
        icon: category.icon || next[index].icon
      }
    }

    categories.value = next.sort((a, b) => a.name.localeCompare(b.name))
    registerCategory(category.name)
    return categories.value.find((item) => item.id === category.id) ||
      categories.value.find((item) => item.normalizedName === category.normalizedName) ||
      category
  }

  const setCategoryRecords = (records = []) => {
    const next = []

    records.forEach((record) => {
      const category = normalizeCategoryRecord(record)
      const index = next.findIndex((item) =>
        (category.id && item.id === category.id) ||
        item.normalizedName === category.normalizedName
      )

      if (index === -1) {
        next.push(category)
      } else {
        next[index] = {
          ...next[index],
          ...category,
          icon: category.icon || next[index].icon
        }
      }

      registerCategory(category.name)
    })

    categories.value = next.sort((a, b) => a.name.localeCompare(b.name))
  }

  const findCategoryById = (id) => {
    if (!id) return null
    return categories.value.find((category) => String(category.id) === String(id)) || null
  }

  const findCategoryByName = (name) => {
    const normalizedName = normalizeCategoryKey(name)
    if (!normalizedName) return null
    return categories.value.find((category) => category.normalizedName === normalizedName) || null
  }

  const getExpenseCategory = (expense = {}) => {
    return findCategoryById(expense.categoryId) ||
      findCategoryByName(expense.category) ||
      (expense.category
        ? normalizeCategoryRecord({
            id: localCategoryId(expense.category),
            name: expense.category,
            icon: expense.categoryIcon,
            status: expense.categoryStatus
          })
        : null)
  }

  const getExpenseCategoryName = (expense = {}) =>
    getExpenseCategory(expense)?.name || normalizeCategory(expense.category) || baseCategories[0]

  const getExpenseCategoryIcon = (expense = {}) =>
    getExpenseCategory(expense)?.icon || getCategoryIcon(getExpenseCategoryName(expense))

  const getExpenseCategoryStatus = (expense = {}) =>
    getExpenseCategory(expense)?.status || expense.categoryStatus || 'active'

  const isExpenseCategoryActive = (expense = {}) =>
    getExpenseCategoryStatus(expense) !== 'inactive'

  const isExpenseCounted = (expense = {}) =>
    expense.active !== false && isExpenseCategoryActive(expense)

  const ensureVisibleCategoryRecords = (items = []) => {
    items.forEach((item) => {
      if (findCategoryById(item.categoryId) || findCategoryByName(item.category)) return
      if (!item.category) return

      mergeCategoryRecord({
        id: localCategoryId(item.category),
        name: item.category,
        status: item.categoryStatus || 'active',
        icon: item.categoryIcon || getCategoryIcon(item.category)
      })
    })
  }

  const applyCategoryMetadata = (items = []) => {
    ensureVisibleCategoryRecords(items)

    return items.map((item) => {
      const category = getExpenseCategory(item)
      const categoryId = category?.id && !isLocalCategoryId(category.id)
        ? category.id
        : item.categoryId || category?.id || null
      const categoryName = category?.name || normalizeCategory(item.category) || baseCategories[0]
      const categoryStatus = category?.status || 'active'

      return {
        ...item,
        categoryId,
        category: categoryName,
        categoryStatus,
        categoryActive: categoryStatus !== 'inactive',
        categoryIcon: category?.icon || getCategoryIcon(categoryName)
      }
    })
  }

  const refreshExpenseCategoryMetadata = () => {
    expenses.value = applyCategoryMetadata(expenses.value)
  }

  const registerKnownCategories = (items) => {
    items.forEach((item) => registerCategory(getExpenseCategoryName(item)))
    ensureVisibleCategoryRecords(items)
  }

  const getConnectionKey = () => {
    if (!connection.value) return ''
    return `${connectionVersion.value}:${JSON.stringify(connection.value)}`
  }

  const stopActiveSubscription = () => {
    if (activeUnsubscribe) {
      activeUnsubscribe()
    }

    activeUnsubscribe = null
    activeConnectionKey = null
  }

  const clearStatusError = () => {
    statusError.value = ''
  }

  const setOfflineStatus = (error) => {
    status.value = 'offline'
    statusError.value = error?.message || 'The configured database is not available.'
  }

  const getWritableAdapter = () => {
    if (!connection.value) return null
    return createExpenseConnection(connection.value)
  }

  const registerAdapterCategories = async (adapter) => {
    if (!adapter?.listCategories) return

    const adapterCategories = await adapter.listCategories()
    setCategoryRecords(adapterCategories)
  }

  const ensurePayloadCategory = async (adapter, payload) => {
    if (!payload.category) return payload

    if (!adapter?.ensureCategory) {
      const category = mergeCategoryRecord({
        name: payload.category,
        icon: getCategoryIcon(payload.category)
      })

      return {
        ...payload,
        categoryId: category?.id || payload.categoryId || null,
        category: category?.name || payload.category
      }
    }

    const category = await adapter.ensureCategory(payload.category, {
      icon: getCategoryIcon(payload.category),
      status: 'active'
    })
    const normalizedCategory = mergeCategoryRecord(category)
    return {
      ...payload,
      categoryId: normalizedCategory?.id || category?.id || payload.categoryId || null,
      category: normalizedCategory?.name || payload.category
    }
  }

  const upsertExpense = (expense) => {
    expenses.value = [
      expense,
      ...expenses.value.filter((item) => item.id !== expense.id)
    ]
  }

  const isExpenseInCategory = (expense, category) => {
    if (!expense || !category) return false
    if (category.id && String(expense.categoryId) === String(category.id)) return true
    return normalizeCategoryKey(expense.category) === category.normalizedName
  }

  const cleanupUnusedCategory = async (adapter, category) => {
    if (!category) return

    const stillUsed = expenses.value.some((item) => isExpenseInCategory(item, category))
    if (stillUsed) return

    if (adapter?.deleteCategory && category.id && !isLocalCategoryId(category.id)) {
      await adapter.deleteCategory(category.id)
    }

    categories.value = categories.value.filter((item) =>
      item.id !== category.id && item.normalizedName !== category.normalizedName
    )

    if (!baseCategories.includes(category.name)) {
      extraCategories.value = extraCategories.value.filter((item) =>
        normalizeCategoryKey(item) !== category.normalizedName
      )
    }
  }

  const resetForm = () => {
    Object.assign(form, getDefaultForm())
    editingId.value = null
  }

  const openAddModal = () => {
    resetForm()
    showAddModal.value = true
  }

  const openEditModal = (item) => {
    editingId.value = item.id
    const preset = findKnownServiceById(item.presetId)
    form.presetId = preset?.id || item.presetId || null
    form.name = item.name || preset?.name || ''
    form.category = getExpenseCategoryName(item)
    form.amount = Number(item.amount)
    form.currency = item.currency || displayedCurrency.value || 'CAD'
    form.url = preset?.url || item.url || ''
    form.icon = preset?.icon || item.icon || findKnownService(item.name)?.icon || ''
    form.note = item.note || ''
    form.includesTax = item.includesTax ?? true
    const taxRateOption = form.includesTax
      ? null
      : getSelectedTaxRateOption(form.currency, item.taxRateId, item.taxRate)
    form.taxRateId = taxRateOption?.id || null
    form.taxRate = form.includesTax
      ? 0
      : taxRateOption?.rate ?? (Number(item.taxRate) || getAutoTaxRate(form.currency))
    const recurrence = getNormalizedRecurrence(item)
    form.scheduleType = recurrence.scheduleType || item.scheduleType || getDefaultForm().scheduleType
    form.paymentDate = recurrence.paymentDate || item.paymentDate || item.startDate || getDefaultForm().paymentDate
    form.repeatInterval = recurrence.repeat?.interval || item.repeatInterval || getDefaultForm().repeatInterval
    form.repeatUnit = recurrence.repeat?.unit || item.repeatUnit || getDefaultForm().repeatUnit
    form.repeatPattern = normalizeRepeatPattern(
      recurrence.repeatPattern || item.repeatPattern || recurrence.pattern?.type,
      form.repeatUnit
    ) || getDefaultForm().repeatPattern
    form.startDate = form.paymentDate
    form.startTime = null
    form.frequency = item.frequency || 'monthly'
    form.datePattern = item.datePattern ? { ...getDefaultForm().datePattern, ...item.datePattern } : getDefaultForm().datePattern
    showAddModal.value = true
  }

  const applyPreset = (presetId) => {
    form.presetId = presetId || null
    const preset = findKnownServiceById(presetId)
    if (!preset) return

    form.name = preset.name
    form.url = preset.url
    form.category = preset.category
    form.icon = preset.icon
  }

  const closeModal = () => {
    showAddModal.value = false
    resetForm()
  }

  const fetchExpenses = async () => {
    if (!connection.value) {
      stopActiveSubscription()
      setCategoryRecords([])
      expenses.value = applyCategoryMetadata(localFallback)
      registerKnownCategories(expenses.value)
      status.value = 'demo'
      clearStatusError()
      return
    }

    const connectionKey = getConnectionKey()

    if (activeUnsubscribe && activeConnectionKey === connectionKey) {
      return
    }

    stopActiveSubscription()
    status.value = 'loading'
    clearStatusError()

    try {
      const adapter = createExpenseConnection(connection.value)
      if (!adapter) throw new Error('Missing database adapter')

      await registerAdapterCategories(adapter)

      activeConnectionKey = connectionKey
      activeUnsubscribe = await adapter.subscribe(
        (items) => {
          expenses.value = applyCategoryMetadata(items)
          registerKnownCategories(items)
          status.value = 'ready'
          clearStatusError()
        },
        (error) => {
          setOfflineStatus(error)
          if (!expenses.value.length) {
            setCategoryRecords([])
            expenses.value = applyCategoryMetadata(localFallback)
            registerKnownCategories(expenses.value)
          }
        }
      )
    } catch (error) {
      activeConnectionKey = null
      activeUnsubscribe = null
      setCategoryRecords([])
      expenses.value = applyCategoryMetadata(localFallback)
      registerKnownCategories(expenses.value)
      setOfflineStatus(error)
    }
  }

  const buildPayload = () => {
    const preset = findKnownServiceById(form.presetId)
    const normalizedCategory = normalizeCategory(form.category || preset?.category) || baseCategories[0]
    let resolvedTaxRate = 0
    let resolvedTaxRateId = null

    if (!form.includesTax) {
      const taxRateOption = getSelectedTaxRateOption(form.currency, form.taxRateId, form.taxRate)
      resolvedTaxRate = taxRateOption?.rate ?? (
        form.taxRate === '' || form.taxRate === null || form.taxRate === undefined
          ? getAutoTaxRate(form.currency)
          : Number(form.taxRate) || 0
      )
      resolvedTaxRateId = taxRateOption?.id || form.taxRateId || getAutoTaxRateId(form.currency)
    }
    const scheduleType = normalizeScheduleType(form.scheduleType)
    const repeatUnit = scheduleType === 'recurring' ? normalizeRepeatUnit(form.repeatUnit) : null
    const repeatInterval = scheduleType === 'recurring' ? normalizeRepeatInterval(form.repeatInterval) : null
    const repeatPattern = scheduleType === 'recurring' ? normalizeRepeatPattern(form.repeatPattern, repeatUnit) : null
    const paymentDate = formatDateOnly(form.paymentDate || form.startDate)
    const recurrenceSource = {
      scheduleType,
      paymentDate,
      repeatInterval,
      repeatUnit,
      repeatPattern,
      startDate: paymentDate
    }
    const recurrenceSchedule = buildRecurrenceSchedule(recurrenceSource)
    const datePattern = deriveLegacyDatePattern(recurrenceSource)
    const frequency = deriveLegacyFrequency(recurrenceSource)

    return {
      name: normalizeCategory(form.name) || preset?.name || '',
      presetId: preset?.id || null,
      category: normalizedCategory,
      amount: Number(form.amount),
      currency: form.currency,
      url: preset?.url || form.url || '',
      icon: preset?.icon || form.icon || findKnownService(form.name)?.icon || '',
      note: form.note || '',
      includesTax: form.includesTax,
      taxRateId: resolvedTaxRateId,
      taxRate: resolvedTaxRate,
      scheduleType,
      paymentDate,
      repeatInterval,
      repeatUnit,
      repeatPattern,
      recurrenceSummary: recurrenceSchedule.summary,
      startDate: paymentDate,
      startTime: null,
      frequency,
      datePattern,
      recurrenceSchedule,
      active: true
    }
  }

  const addExpense = async () => {
    if (saving.value) return null

    saving.value = true
    const adapter = getWritableAdapter()
    let savedExpense = null

    try {
      const payload = await ensurePayloadCategory(adapter, buildPayload())
      if (!payload.name || !payload.amount || !payload.paymentDate) return null

      if (adapter) {
        const created = await adapter.create(payload)
        const hydrated = applyCategoryMetadata([created])[0]
        upsertExpense(hydrated)
        savedExpense = hydrated
      } else {
        const fallbackItem = {
          id: String(Date.now()),
          createdAt: new Date().toISOString(),
          ...payload
        }
        const hydrated = applyCategoryMetadata([fallbackItem])[0]
        expenses.value = [hydrated, ...expenses.value]
        savedExpense = hydrated
      }
      registerCategory(payload.category)
    } catch (error) {
      setOfflineStatus(error)
    } finally {
      saving.value = false
    }

    if (savedExpense) {
      closeModal()
    }

    return savedExpense
  }

  const updateExpense = async () => {
    if (editingId.value === null) return null
    if (saving.value) return null

    saving.value = true
    const adapter = getWritableAdapter()
    let savedExpense = null
    const previousExpense = expenses.value.find((item) => item.id === editingId.value)
    const previousCategory = previousExpense ? getExpenseCategory(previousExpense) : null

    try {
      const payload = await ensurePayloadCategory(adapter, {
        ...buildPayload(),
        active: previousExpense?.active !== false
      })
      if (!payload.name || !payload.amount || !payload.paymentDate) return null

      const updated = adapter
        ? await adapter.update(editingId.value, payload)
        : { id: editingId.value, ...payload }
      const hydrated = applyCategoryMetadata([updated])[0]
      expenses.value = applyCategoryMetadata(
        expenses.value.map((item) => (item.id === hydrated.id ? hydrated : item))
      )
      savedExpense = hydrated
      registerCategory(payload.category)
      if (
        previousCategory &&
        previousCategory.normalizedName !== normalizeCategoryKey(payload.category)
      ) {
        await cleanupUnusedCategory(adapter, previousCategory)
      }
    } catch (error) {
      setOfflineStatus(error)
    } finally {
      saving.value = false
    }

    if (savedExpense) {
      closeModal()
    }

    return savedExpense
  }

  const deleteExpense = async (id) => {
    const deletedExpense = expenses.value.find((item) => item.id === id)
    if (!deletedExpense) return null

    const existing = expenses.value
    expenses.value = expenses.value.filter((item) => item.id !== id)
    const adapter = getWritableAdapter()
    const category = getExpenseCategory(deletedExpense)

    try {
      if (adapter) {
        await adapter.delete(id)
      }

      await cleanupUnusedCategory(adapter, category)
      return deletedExpense
    } catch (error) {
      setOfflineStatus(error)
      expenses.value = existing
      return null
    }
  }

  const toggleExpenseActive = async (id) => {
    const item = expenses.value.find((e) => e.id === id)
    if (!item) return

    const newActive = !(item.active ?? true)

    expenses.value = expenses.value.map((e) =>
      e.id === id ? { ...e, active: newActive } : e
    )

    try {
      const adapter = getWritableAdapter()
      if (adapter) {
        await adapter.update(id, { ...item, active: newActive })
      }
    } catch (error) {
      setOfflineStatus(error)
      expenses.value = expenses.value.map((e) =>
        e.id === id ? { ...e, active: item.active } : e
      )
    }
  }

  const toggleCategoryActive = async (categoryInput) => {
    const input = typeof categoryInput === 'object'
      ? categoryInput
      : findCategoryById(categoryInput) || findCategoryByName(categoryInput)
    if (!input) return null

    let category = getExpenseCategory(input) || findCategoryById(input.id) || findCategoryByName(input.name) || input
    const adapter = getWritableAdapter()
    const nextStatus = category.status === 'inactive' || category.active === false ? 'active' : 'inactive'
    const previousCategories = categories.value
    const previousExpenses = expenses.value

    try {
      if (adapter?.ensureCategory && (!category.id || isLocalCategoryId(category.id))) {
        const persisted = await adapter.ensureCategory(category.name, {
          icon: category.icon || getCategoryIcon(category.name),
          status: category.status || 'active'
        })
        category = mergeCategoryRecord({
          ...category,
          ...persisted,
          id: persisted.id || category.id
        })
      }

      const nextCategory = mergeCategoryRecord({
        ...category,
        status: nextStatus,
        active: nextStatus !== 'inactive'
      })
      refreshExpenseCategoryMetadata()

      if (adapter?.updateCategory && nextCategory.id && !isLocalCategoryId(nextCategory.id)) {
        const updated = await adapter.updateCategory(nextCategory.id, {
          ...nextCategory,
          status: nextStatus
        })
        mergeCategoryRecord(updated)
        refreshExpenseCategoryMetadata()
      }

      return nextCategory
    } catch (error) {
      setOfflineStatus(error)
      categories.value = previousCategories
      expenses.value = previousExpenses
      return null
    }
  }

  const updateExpenseAmount = async (id, amount) => {
    const item = expenses.value.find((e) => String(e.id) === String(id))
    if (!item) return null

    const nextAmount = Number(amount)
    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      throw new Error('Enter a valid amount before saving the price change.')
    }

    const previous = expenses.value
    const nextExpense = {
      ...item,
      amount: nextAmount
    }
    const hydratedNextExpense = applyCategoryMetadata([nextExpense])[0]

    expenses.value = expenses.value.map((expense) =>
      String(expense.id) === String(id) ? hydratedNextExpense : expense
    )

    try {
      const adapter = getWritableAdapter()
      if (!adapter) return hydratedNextExpense

      const updated = await adapter.update(id, hydratedNextExpense)
      const hydrated = applyCategoryMetadata([updated])[0]
      expenses.value = applyCategoryMetadata(
        expenses.value.map((expense) =>
          String(expense.id) === String(id) ? hydrated : expense
        )
      )
      return hydrated
    } catch (error) {
      setOfflineStatus(error)
      expenses.value = previous
      throw error
    }
  }

  const saveExpense = async () => {
    if (editingId.value !== null) {
      return updateExpense()
    } else {
      return addExpense()
    }
  }

  // Get available date pattern types based on current frequency
  const availableDatePatternTypes = computed(() => {
    return datePatternTypes[form.frequency] || datePatternTypes.monthly
  })

  return {
    // State
    expenses,
    categories,
    status,
    statusError,
    saving,
    showAddModal,
    editingId,
    form,
    baseCategories,
    extraCategories,

    // Constants
    currencies,
    frequencyOptions,
    datePatternTypes,
    weekdays,
    ordinals,
    months,
    scheduleTypes,
    repeatUnits,
    repeatPatterns,

    // Computed
    availableDatePatternTypes,

    // Helpers
    getEffectiveAmount,
    getTimesPerYear,
    getYearlyAmount,
    getAutoTaxRate,
    getAutoTaxRateId,
    getTaxRateOptions,
    getSelectedTaxRateOption,
    getNormalizedRecurrence,
    getRecurrenceSummary,
    getNextOccurrence,
    getExpenseCategory,
    getExpenseCategoryName,
    getExpenseCategoryIcon,
    getExpenseCategoryStatus,
    isExpenseCategoryActive,
    isExpenseCounted,
    repeatUnitSupportsPattern,

    // Actions
    fetchExpenses,
    addExpense,
    updateExpense,
    updateExpenseAmount,
    deleteExpense,
    toggleExpenseActive,
    toggleCategoryActive,
    saveExpense,
    openAddModal,
    openEditModal,
    applyPreset,
    closeModal,
    resetForm
  }
}
