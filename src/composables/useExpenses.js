import { reactive, ref, computed } from 'vue'
import { useSettings } from './useSettings'
import { useDatabaseConnection } from './useDatabaseConnection'
import { getTaxRateForCurrency } from '../data/taxRates'
import { createExpenseConnection } from '../services/database/expenseConnections'

const { displayedCurrency, availableCurrencies, allCurrencies } = useSettings()
const { connection, connectionVersion } = useDatabaseConnection()

// Supported currencies (full list for validation)
const currencyUniverse = allCurrencies

// Frequency options
const frequencyOptions = [
  { value: 'weekly', label: 'Weekly', timesPerYear: 52 },
  { value: 'bi-weekly', label: 'Bi-Weekly', timesPerYear: 26 },
  { value: 'monthly', label: 'Monthly', timesPerYear: 12 },
  { value: 'quarterly', label: 'Quarterly', timesPerYear: 4 },
  { value: 'semi-annually', label: 'Semi-Annually', timesPerYear: 2 },
  { value: 'yearly', label: 'Yearly', timesPerYear: 1 },
  { value: 'custom', label: 'Custom', timesPerYear: null }
]

// Date pattern types based on frequency
const datePatternTypes = {
  weekly: [
    { value: 'day-of-week', label: 'Day of week' } // e.g., Every Monday
  ],
  'bi-weekly': [
    { value: 'day-of-week', label: 'Day of week' } // e.g., Every other Monday
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

// Default form state
const getDefaultForm = () => ({
  name: '',
  category: 'Subscriptions',
  amount: '',
  currency: displayedCurrency.value || 'CAD',
  url: '',
  includesTax: true,
  taxRate: 0,
  frequency: 'monthly',
  customTimesPerYear: 4,
  startDate: new Date().toISOString().slice(0, 10),
  datePattern: {
    type: 'day-of-month',
    dayOfMonth: 1,
    dayOfWeek: 1, // Monday
    nthWeek: 1, // 1st
    month: 0, // January
    intervalDays: 30
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
  if (expense.frequency === 'custom') {
    return expense.customTimesPerYear || 1
  }
  const freq = frequencyOptions.find(f => f.value === expense.frequency)
  return freq ? freq.timesPerYear : 12
}

// Calculate yearly amount for an expense
const getYearlyAmount = (expense) => {
  const effectiveAmount = getEffectiveAmount(expense)
  const timesPerYear = getTimesPerYear(expense)
  return effectiveAmount * timesPerYear
}

const toDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
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

const getNextOccurrence = (expense, referenceDate = new Date()) => {
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate())
  const startDate = toDate(expense.startDate)
  const pattern = expense.datePattern || {}
  const frequency = expense.frequency || 'monthly'

  if (pattern.type === 'interval') {
    const intervalDays = Number(pattern.intervalDays) || 1
    if (!startDate) return null
    const diffDays = Math.max(0, Math.floor((today - startDate) / 86400000))
    const steps = Math.ceil(diffDays / intervalDays)
    return addDays(startDate, steps * intervalDays)
  }

  if (frequency === 'weekly' || frequency === 'bi-weekly') {
    const targetDay = pattern.dayOfWeek ?? (startDate ? startDate.getDay() : 1)
    const currentDay = today.getDay()
    const offset = (targetDay - currentDay + 7) % 7
    let candidate = addDays(today, offset)
    if (frequency === 'bi-weekly' && startDate) {
      const diffWeeks = Math.floor((candidate - startDate) / (86400000 * 7))
      if (diffWeeks % 2 !== 0) {
        candidate = addDays(candidate, 7)
      }
    }
    return candidate
  }

  if (frequency === 'monthly' || frequency === 'quarterly' || frequency === 'semi-annually') {
    const intervalMonths = frequency === 'monthly' ? 1 : frequency === 'quarterly' ? 3 : 6
    if (pattern.type === 'nth-weekday') {
      const nthWeek = pattern.nthWeek || 1
      const dayOfWeek = pattern.dayOfWeek ?? 1
      let candidate = getNthWeekdayOfMonth(today.getFullYear(), today.getMonth(), nthWeek, dayOfWeek)
      if (candidate < today) {
        const nextMonth = addMonths(new Date(today.getFullYear(), today.getMonth(), 1), intervalMonths)
        candidate = getNthWeekdayOfMonth(nextMonth.getFullYear(), nextMonth.getMonth(), nthWeek, dayOfWeek)
      }
      return candidate
    }

    const dayOfMonth = pattern.dayOfMonth || (startDate ? startDate.getDate() : 1)
    const baseMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    let candidate = new Date(baseMonth.getFullYear(), baseMonth.getMonth(), dayOfMonth)
    const max = new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0).getDate()
    candidate.setDate(Math.min(dayOfMonth, max))
    if (candidate < today) {
      const nextMonth = addMonths(baseMonth, intervalMonths)
      const nextMax = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()
      candidate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(dayOfMonth, nextMax))
    }
    return candidate
  }

  if (frequency === 'yearly') {
    if (pattern.type === 'nth-weekday-year') {
      const nthWeek = pattern.nthWeek || 1
      const dayOfWeek = pattern.dayOfWeek ?? 1
      const month = pattern.month ?? (startDate ? startDate.getMonth() : 0)
      let candidate = getNthWeekdayOfMonth(today.getFullYear(), month, nthWeek, dayOfWeek)
      if (candidate < today) {
        candidate = getNthWeekdayOfMonth(today.getFullYear() + 1, month, nthWeek, dayOfWeek)
      }
      return candidate
    }

    const month = pattern.month ?? (startDate ? startDate.getMonth() : 0)
    const dayOfMonth = pattern.dayOfMonth || (startDate ? startDate.getDate() : 1)
    let candidate = new Date(today.getFullYear(), month, dayOfMonth)
    const max = new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0).getDate()
    candidate.setDate(Math.min(dayOfMonth, max))
    if (candidate < today) {
      candidate = new Date(today.getFullYear() + 1, month, Math.min(dayOfMonth, max))
    }
    return candidate
  }

  if (startDate) {
    let candidate = new Date(startDate)
    if (frequency === 'custom') {
      const intervalDays = Math.max(1, Math.round(365 / (expense.customTimesPerYear || 1)))
      while (candidate < today) {
        candidate = addDays(candidate, intervalDays)
      }
      return candidate
    }
    const intervalMonths = frequencyOptions.find((f) => f.value === frequency)?.timesPerYear
    if (intervalMonths) {
      const months = Math.round(12 / intervalMonths)
      while (candidate < today) {
        candidate = addMonths(candidate, months)
      }
      return candidate
    }
  }

  return null
}

export function useExpenses() {
  const normalizeCategory = (value) => value.trim()

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

  const getWritableAdapter = () => {
    if (!connection.value) return null
    return createExpenseConnection(connection.value)
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
    form.name = item.name
    form.category = item.category
    form.amount = Number(item.amount)
    form.currency = item.currency || displayedCurrency.value || 'CAD'
    form.url = item.url || ''
    form.includesTax = item.includesTax ?? true
    form.taxRate = form.includesTax ? 0 : getAutoTaxRate(form.currency)
    form.startDate = item.startDate || getDefaultForm().startDate
    form.frequency = item.frequency || 'monthly'
    form.customTimesPerYear = item.customTimesPerYear || 4
    form.datePattern = item.datePattern ? { ...getDefaultForm().datePattern, ...item.datePattern } : getDefaultForm().datePattern
    showAddModal.value = true
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
      return
    }

    const connectionKey = getConnectionKey()

    if (activeUnsubscribe && activeConnectionKey === connectionKey) {
      return
    }

    stopActiveSubscription()
    status.value = 'loading'

    try {
      const adapter = createExpenseConnection(connection.value)
      if (!adapter) throw new Error('Missing database adapter')

      activeConnectionKey = connectionKey
      activeUnsubscribe = await adapter.subscribe(
        (items) => {
          expenses.value = items
          registerKnownCategories(items)
          status.value = 'ready'
        },
        () => {
          status.value = 'offline'
          if (!expenses.value.length) {
            expenses.value = localFallback
            registerKnownCategories(expenses.value)
          }
        }
      )
    } catch {
      activeConnectionKey = null
      activeUnsubscribe = null
      expenses.value = localFallback
      registerKnownCategories(expenses.value)
      status.value = 'offline'
    }
  }

  const buildPayload = () => {
    const normalizedCategory = normalizeCategory(form.category) || baseCategories[0]
    const resolvedTaxRate = form.includesTax
      ? 0
      : (form.taxRate === '' || form.taxRate === null || form.taxRate === undefined)
        ? getAutoTaxRate(form.currency)
        : Number(form.taxRate) || 0
    return {
      name: form.name,
      category: normalizedCategory,
      amount: Number(form.amount),
      currency: form.currency,
      url: form.url || '',
      includesTax: form.includesTax,
      taxRate: resolvedTaxRate,
      startDate: form.startDate || null,
      frequency: form.frequency,
      customTimesPerYear: form.frequency === 'custom' ? Number(form.customTimesPerYear) || 1 : undefined,
      datePattern: { ...form.datePattern },
      active: true
    }
  }

  const addExpense = async () => {
    if (!form.name || !form.amount) return
    if (saving.value) return

    saving.value = true
    const payload = buildPayload()
    const adapter = getWritableAdapter()
    let saved = false

    try {
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
    } catch {
      status.value = 'offline'
    } finally {
      saving.value = false
    }

    if (saved) {
      registerCategory(payload.category)
      closeModal()
    }
  }

  const updateExpense = async () => {
    if (!form.name || !form.amount || editingId.value === null) return
    if (saving.value) return

    saving.value = true
    const payload = buildPayload()
    const adapter = getWritableAdapter()
    let saved = false

    try {
      const updated = adapter
        ? await adapter.update(editingId.value, payload)
        : { id: editingId.value, ...payload }
      expenses.value = expenses.value.map((item) => (item.id === updated.id ? updated : item))
      saved = true
    } catch {
      status.value = 'offline'
    } finally {
      saving.value = false
    }

    if (saved) {
      registerCategory(payload.category)
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
    } catch {
      status.value = 'offline'
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
    } catch {
      status.value = 'offline'
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

    // Computed
    availableDatePatternTypes,

    // Helpers
    getEffectiveAmount,
    getTimesPerYear,
    getYearlyAmount,
    getAutoTaxRate,
    getNextOccurrence,

    // Actions
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    toggleExpenseActive,
    saveExpense,
    openAddModal,
    openEditModal,
    closeModal,
    resetForm
  }
}
