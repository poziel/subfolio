<script setup>
import { computed, onMounted, ref } from 'vue'
import ExpenseTable from '../components/ExpenseTable.vue'
import { useExpenses } from '../composables/useExpenses'
import { useSettings } from '../composables/useSettings'

const {
  expenses,
  fetchExpenses,
  getYearlyAmount
} = useExpenses()

const { formatMoney, convertToDisplayed, displayedCurrency } = useSettings()

const searchQuery = ref('')

// Calculate total yearly expense from all ACTIVE items only
const totalYearly = computed(() => {
  return expenses.value
    .filter((item) => item.active !== false)
    .reduce((sum, item) => sum + convertToDisplayed(getYearlyAmount(item), item.currency || displayedCurrency.value), 0)
})

// Summary widgets showing expenses at different time scales
const expenseSummary = computed(() => {
  const yearly = totalYearly.value
  const activeCount = expenses.value.filter((item) => item.active !== false).length
  return {
    daily: yearly / 365,
    weekly: yearly / 52,
    biWeekly: yearly / 26,
    monthly: yearly / 12,
    yearly: yearly,
    active: activeCount
  }
})


// Filter expenses based on search query
const filteredExpenses = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return expenses.value

  return expenses.value.filter((item) => {
    return (
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      (item.frequency && item.frequency.toLowerCase().includes(query)) ||
      (item.currency && item.currency.toLowerCase().includes(query))
    )
  })
})

onMounted(fetchExpenses)
</script>

<template>
  <div class="grid gap-8 p-6 lg:p-8">
    <!-- Page Header -->
    <header>
      <h1 class="font-serif text-2xl text-ink">Expenses</h1>
      <p class="text-muted">Track all your recurring payments at a glance.</p>
    </header>

    <!-- Expense Summary Widgets -->
    <section class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <div class="rounded-2xl border border-border-strong bg-white p-4 shadow-card">
        <p class="text-xs font-medium text-muted">Daily</p>
        <p class="mt-1 text-xl font-semibold text-accent-dark">
          {{ formatMoney(expenseSummary.daily, displayedCurrency) }}
        </p>
      </div>
      <div class="rounded-2xl border border-border-strong bg-white p-4 shadow-card">
        <p class="text-xs font-medium text-muted">Weekly</p>
        <p class="mt-1 text-xl font-semibold text-accent-dark">
          {{ formatMoney(expenseSummary.weekly, displayedCurrency) }}
        </p>
      </div>
      <div class="rounded-2xl border border-border-strong bg-white p-4 shadow-card">
        <p class="text-xs font-medium text-muted">Bi-Weekly</p>
        <p class="mt-1 text-xl font-semibold text-accent-dark">
          {{ formatMoney(expenseSummary.biWeekly, displayedCurrency) }}
        </p>
      </div>
      <div class="rounded-2xl border border-border-strong bg-white p-4 shadow-card">
        <p class="text-xs font-medium text-muted">Monthly</p>
        <p class="mt-1 text-xl font-semibold text-accent-dark">
          {{ formatMoney(expenseSummary.monthly, displayedCurrency) }}
        </p>
      </div>
      <div class="rounded-2xl border border-border-strong bg-white p-4 shadow-card">
        <p class="text-xs font-medium text-muted">Yearly</p>
        <p class="mt-1 text-xl font-semibold text-accent-dark">
          {{ formatMoney(expenseSummary.yearly, displayedCurrency) }}
        </p>
      </div>
      <div class="rounded-2xl border border-border-strong bg-white p-4 shadow-card">
        <p class="text-xs font-medium text-muted">Active</p>
        <p class="mt-1 text-xl font-semibold text-ink">
          {{ expenseSummary.active }}
        </p>
      </div>
    </section>

    <!-- Expense Table -->
    <section class="grid gap-5 rounded-3xl border border-border-strong bg-white p-6 shadow-card">
      <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p class="text-lg font-semibold text-ink">Expense ledger</p>
          <p class="text-sm text-muted">All recurring expenses</p>
        </div>
        <!-- Search Bar -->
        <div class="relative w-full sm:w-64">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search expenses..."
            class="w-full rounded-xl border border-border bg-surface-muted py-2 pl-10 pr-4 text-sm text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
          />
        </div>
      </div>
      <div class="grid gap-3">
        <div v-if="expenses.length === 0" class="py-12 text-center text-muted">
          <p>No expenses yet.</p>
          <p class="text-sm">Click "Add Expense" to get started.</p>
        </div>
        <div
          v-else-if="filteredExpenses.length === 0"
          class="py-12 text-center text-muted"
        >
          <p>No expenses match "{{ searchQuery }}"</p>
          <p class="text-sm">Try a different search term.</p>
        </div>
        <ExpenseTable v-else :expenses="filteredExpenses" :show-pagination="true" />
      </div>
    </section>
  </div>
</template>
