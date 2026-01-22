<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const { logout } = useAuth()

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const expenses = ref([])
const status = ref('idle')

const localFallback = [
  {
    id: 1,
    name: 'Streamline Pro',
    category: 'Subscriptions',
    frequency: 'Monthly',
    dueDate: '2026-03-18',
    amount: 32
  },
  {
    id: 2,
    name: 'Metro Utilities',
    category: 'Utilities',
    frequency: 'Monthly',
    dueDate: '2026-03-21',
    amount: 118
  },
  {
    id: 3,
    name: 'Pulse Gym',
    category: 'Wellness',
    frequency: 'Monthly',
    dueDate: '2026-03-26',
    amount: 64
  },
  {
    id: 4,
    name: 'Home Insurance',
    category: 'Housing',
    frequency: 'Yearly',
    dueDate: '2026-04-02',
    amount: 420
  }
]

const frequencyMultiplier = (frequency) => {
  switch (frequency) {
    case 'Weekly':
      return 52
    case 'Yearly':
      return 1
    default:
      return 12
  }
}

const yearlyAmount = (item) => Number(item.amount) * frequencyMultiplier(item.frequency)

const summaryTotals = computed(() => {
  const yearly = expenses.value.reduce((total, item) => total + yearlyAmount(item), 0)
  const monthly = yearly / 12
  const perPay = yearly / 26

  return {
    yearly,
    monthly,
    perPay
  }
})

const projectedRows = computed(() =>
  expenses.value.map((item) => {
    const yearly = yearlyAmount(item)
    return {
      ...item,
      yearly,
      monthly: yearly / 12,
      perPay: yearly / 26
    }
  })
)

const fetchExpenses = async () => {
  status.value = 'loading'
  try {
    const response = await fetch(`${apiBase}/expenses`)
    if (!response.ok) throw new Error('Failed request')
    expenses.value = await response.json()
    status.value = 'ready'
  } catch (error) {
    expenses.value = localFallback
    status.value = 'offline'
  }
}

const formatCurrency = (value) => `$${Number(value).toFixed(2)}`

onMounted(fetchExpenses)
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="brand">
        <span class="brand-mark">S</span>
        <div>
          <p class="brand-name">Subfolio</p>
          <p class="brand-tagline">Recurrence overview</p>
        </div>
      </div>
      <div class="app-actions">
        <RouterLink class="ghost" to="/app">Back to tracker</RouterLink>
        <span class="status-pill" :class="status">{{ status }}</span>
        <button class="ghost" type="button" @click="logout">Sign out</button>
      </div>
    </header>

    <section class="app-hero overview-hero">
      <div>
        <p class="section-eyebrow">Recurring totals</p>
        <h1>See your annual, monthly, and per-pay obligations.</h1>
        <p class="hero-copy">
          Subfolio calculates projected totals across the year and distributes them into
          month-by-month and paycheck-level views.
        </p>
      </div>
    </section>

    <section class="overview-grid">
      <div class="summary-card">
        <p class="summary-label">Projected yearly</p>
        <p class="summary-value">{{ formatCurrency(summaryTotals.yearly) }}</p>
        <p class="summary-meta">All recurring obligations</p>
      </div>
      <div class="summary-card">
        <p class="summary-label">Projected monthly</p>
        <p class="summary-value">{{ formatCurrency(summaryTotals.monthly) }}</p>
        <p class="summary-meta">Average per month</p>
      </div>
      <div class="summary-card">
        <p class="summary-label">Per paycheck</p>
        <p class="summary-value">{{ formatCurrency(summaryTotals.perPay) }}</p>
        <p class="summary-meta">Based on 26 pay periods</p>
      </div>
    </section>

    <section class="overview-table">
      <div class="table-header">
        <div>
          <p class="table-title">All recurrences</p>
          <p class="table-sub">Projected cost by cadence</p>
        </div>
      </div>
      <div class="table-grid">
        <div class="table-row table-head">
          <span>Expense</span>
          <span>Category</span>
          <span>Frequency</span>
          <span class="amount">Yearly</span>
          <span class="amount">Monthly</span>
          <span class="amount">Per pay</span>
        </div>
        <div v-for="item in projectedRows" :key="item.id" class="table-row">
          <span>{{ item.name }}</span>
          <span>{{ item.category }}</span>
          <span>{{ item.frequency }}</span>
          <span class="amount">{{ formatCurrency(item.yearly) }}</span>
          <span class="amount">{{ formatCurrency(item.monthly) }}</span>
          <span class="amount">{{ formatCurrency(item.perPay) }}</span>
        </div>
      </div>
    </section>
  </div>
</template>
