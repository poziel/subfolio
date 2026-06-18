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
import { findKnownService, findKnownServiceById } from '../data/serviceCatalog'
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
  customTimesPerYear: 4,
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

  if (expense.frequency === 'custom') {
    return Math.max(0.01, Number(expense.customTimesPerYear) || 1)
  }

  if (expense.frequency === 'hourly') {
    return getTimesPerYearFromRepeat(expense)
  }

  const freq = frequencyOptions.find(f => f.value === expense.frequency)
  return freq ? freq.timesPerYear : getTimesPerYearFromRepeat(expense)
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

  const registerCategory = (value) => {
    const normalized = normalizeCategory(value)
    if (!normalized) return

    if (!baseCategories.includes(normalized) && !extraCategories.value.includes(normalized)) {
      extraCategories.value = [...extraCategories.value, normalized]
    }
  }

  const registerKnownCategories = (items) => {
    items.forEach((item) => registerCategory(item.category || ''))
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

    const categories = await adapter.listCategories()
    categories.forEach((category) => registerCategory(category.name || category.category || ''))
  }

  const ensurePayloadCategory = async (adapter, payload) => {
    if (!adapter?.ensureCategory || !payload.category) return payload

    const category = await adapter.ensureCategory(payload.category)
    return {
      ...payload,
      categoryId: category?.id || payload.categoryId || null
    }
  }

  const upsertExpense = (expense) => {
    expenses.value = [
      expense,
      ...expenses.value.filter((item) => item.id !== expense.id)
    ]
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
    form.category = item.category
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
    form.customTimesPerYear = item.customTimesPerYear || 4
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
      expenses.value = localFallback
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
          expenses.value = items
          registerKnownCategories(items)
          status.value = 'ready'
          clearStatusError()
        },
        (error) => {
          setOfflineStatus(error)
          if (!expenses.value.length) {
            expenses.value = localFallback
            registerKnownCategories(expenses.value)
          }
        }
      )
    } catch (error) {
      activeConnectionKey = null
      activeUnsubscribe = null
      expenses.value = localFallback
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
      customTimesPerYear: frequency === 'custom' ? getTimesPerYearFromRepeat(recurrenceSource) : undefined,
      datePattern,
      recurrenceSchedule,
      active: true
    }
  }

  const addExpense = async () => {
    if (saving.value) return

    saving.value = true
    const adapter = getWritableAdapter()
    let saved = false

    try {
      const payload = await ensurePayloadCategory(adapter, buildPayload())
      if (!payload.name || !payload.amount || !payload.paymentDate) return

      if (adapter) {
        const created = await adapter.create(payload)
        upsertExpense(created)
      } else {
        const fallbackItem = {
          id: String(Date.now()),
          createdAt: new Date().toISOString(),
          ...payload
        }
        expenses.value = [fallbackItem, ...expenses.value]
      }
      saved = true
      registerCategory(payload.category)
    } catch (error) {
      setOfflineStatus(error)
    } finally {
      saving.value = false
    }

    if (saved) {
      closeModal()
    }
  }

  const updateExpense = async () => {
    if (editingId.value === null) return
    if (saving.value) return

    saving.value = true
    const adapter = getWritableAdapter()
    let saved = false

    try {
      const payload = await ensurePayloadCategory(adapter, buildPayload())
      if (!payload.name || !payload.amount || !payload.paymentDate) return

      const updated = adapter
        ? await adapter.update(editingId.value, payload)
        : { id: editingId.value, ...payload }
      expenses.value = expenses.value.map((item) => (item.id === updated.id ? updated : item))
      saved = true
      registerCategory(payload.category)
    } catch (error) {
      setOfflineStatus(error)
    } finally {
      saving.value = false
    }

    if (saved) {
      closeModal()
    }
  }

  const deleteExpense = async (id) => {
    const existing = expenses.value
    expenses.value = expenses.value.filter((item) => item.id !== id)
    const adapter = getWritableAdapter()

    try {
      if (adapter) {
        await adapter.delete(id)
      }
    } catch (error) {
      setOfflineStatus(error)
      expenses.value = existing
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

  const saveExpense = async () => {
    if (editingId.value !== null) {
      await updateExpense()
    } else {
      await addExpense()
    }
  }

  // Get available date pattern types based on current frequency
  const availableDatePatternTypes = computed(() => {
    return datePatternTypes[form.frequency] || datePatternTypes.monthly
  })

  return {
    // State
    expenses,
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
    repeatUnitSupportsPattern,

    // Actions
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    toggleExpenseActive,
    saveExpense,
    openAddModal,
    openEditModal,
    applyPreset,
    closeModal,
    resetForm
  }
}
