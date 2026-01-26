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
  } catch {
    expenses.value = localFallback
    status.value = 'offline'
  }
}

const formatCurrency = (value) => `$${Number(value).toFixed(2)}`

onMounted(fetchExpenses)
</script>

<template>
  <div class="mx-auto grid max-w-6xl gap-10 px-6 py-8 lg:px-8">
    <!-- Header -->
    <header class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div class="flex items-center gap-3">
        <span
          class="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-accent to-teal-400 text-xl font-semibold text-white shadow-lg shadow-accent/25"
        >
          S
        </span>
        <div>
          <p class="text-lg font-semibold text-ink">Subfolio</p>
          <p class="text-sm text-muted">Recurrence overview</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <RouterLink
          to="/app"
          class="inline-flex items-center gap-2 rounded-full border border-border bg-white/60 px-4 py-2 text-sm text-ink transition hover:border-accent hover:bg-white"
        >
          Back to tracker
        </RouterLink>
        <span
          class="rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
          :class="{
            'bg-accent/10 text-accent-dark': status === 'ready' || status === 'loading',
            'bg-sun/20 text-amber-700': status === 'offline',
            'bg-gray-100 text-muted': status === 'idle'
          }"
        >
          {{ status }}
        </span>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-border bg-white/60 px-4 py-2 text-sm text-ink transition hover:border-accent hover:bg-white"
          @click="logout"
        >
          Sign out
        </button>
      </div>
    </header>

    <!-- Hero Section -->
    <section
      class="flex flex-col items-start gap-6 rounded-3xl border border-border-strong bg-white p-7 shadow-card"
    >
      <div>
        <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-dark">
          Recurring totals
        </p>
        <h1 class="mb-2 font-serif text-3xl text-ink sm:text-4xl">
          See your annual, monthly, and per-pay obligations.
        </h1>
        <p class="max-w-2xl text-muted">
          Subfolio calculates projected totals across the year and distributes them into
          month-by-month and paycheck-level views.
        </p>
      </div>
    </section>

    <!-- Summary Cards -->
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div class="grid gap-2 rounded-2xl border border-border-strong bg-white p-5 shadow-card">
        <p class="text-xs font-semibold uppercase tracking-wide text-muted">Projected yearly</p>
        <p class="text-2xl font-semibold text-accent-dark">{{ formatCurrency(summaryTotals.yearly) }}</p>
        <p class="text-sm text-muted">All recurring obligations</p>
      </div>
      <div class="grid gap-2 rounded-2xl border border-border-strong bg-white p-5 shadow-card">
        <p class="text-xs font-semibold uppercase tracking-wide text-muted">Projected monthly</p>
        <p class="text-2xl font-semibold text-accent-dark">{{ formatCurrency(summaryTotals.monthly) }}</p>
        <p class="text-sm text-muted">Average per month</p>
      </div>
      <div class="grid gap-2 rounded-2xl border border-border-strong bg-white p-5 shadow-card">
        <p class="text-xs font-semibold uppercase tracking-wide text-muted">Per paycheck</p>
        <p class="text-2xl font-semibold text-accent-dark">{{ formatCurrency(summaryTotals.perPay) }}</p>
        <p class="text-sm text-muted">Based on 26 pay periods</p>
      </div>
    </section>

    <!-- Table -->
    <section class="grid gap-5 rounded-3xl border border-border-strong bg-white p-6 shadow-card">
      <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p class="text-lg font-semibold text-ink">All recurrences</p>
          <p class="text-sm text-muted">Projected cost by cadence</p>
        </div>
      </div>
      <div class="grid gap-3">
        <!-- Table Header -->
        <div
          class="hidden grid-cols-[1.4fr_1fr_0.9fr_0.8fr_0.8fr_0.8fr] items-center gap-3 px-1.5 pb-1 text-xs uppercase tracking-wide text-muted sm:grid"
        >
          <span>Expense</span>
          <span>Category</span>
          <span>Frequency</span>
          <span class="text-right">Yearly</span>
          <span class="text-right">Monthly</span>
          <span class="text-right">Per pay</span>
        </div>
        <!-- Table Rows -->
        <div
          v-for="item in projectedRows"
          :key="item.id"
          class="grid grid-cols-1 items-center gap-3 rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm sm:grid-cols-[1.4fr_1fr_0.9fr_0.8fr_0.8fr_0.8fr]"
        >
          <span class="font-medium text-ink">{{ item.name }}</span>
          <span class="text-muted">{{ item.category }}</span>
          <span class="text-muted">{{ item.frequency }}</span>
          <span class="font-semibold text-accent-dark sm:text-right">
            {{ formatCurrency(item.yearly) }}
          </span>
          <span class="font-semibold text-accent-dark sm:text-right">
            {{ formatCurrency(item.monthly) }}
          </span>
          <span class="font-semibold text-accent-dark sm:text-right">
            {{ formatCurrency(item.perPay) }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>
