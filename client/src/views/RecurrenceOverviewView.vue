<script setup>
import { computed, onMounted } from 'vue'
import { useExpenses } from '../composables/useExpenses'
import { useSettings } from '../composables/useSettings'

const { expenses, fetchExpenses, getYearlyAmount, frequencyOptions } = useExpenses()
const { formatMoney, getConversionTooltip, convertToDisplayed, displayedCurrency } = useSettings()

// Get display label for frequency
const getFrequencyLabel = (frequency) => {
  const option = frequencyOptions.find((f) => f.value === frequency)
  return option ? option.label : frequency
}

const summaryTotals = computed(() => {
  const activeExpenses = expenses.value.filter((item) => item.active !== false)
  const yearly = activeExpenses.reduce(
    (total, item) => total + convertToDisplayed(getYearlyAmount(item), item.currency || displayedCurrency),
    0
  )
  const monthly = yearly / 12
  const perPay = yearly / 26

  return {
    yearly,
    monthly,
    perPay
  }
})

const projectedRows = computed(() =>
  expenses.value
    .filter((item) => item.active !== false)
    .map((item) => {
      const yearly = getYearlyAmount(item)
      const yearlyDisplayed = convertToDisplayed(yearly, item.currency || displayedCurrency)
      return {
        ...item,
        yearly,
        monthly: yearly / 12,
        perPay: yearly / 26,
        yearlyDisplayed,
        monthlyDisplayed: yearlyDisplayed / 12,
        perPayDisplayed: yearlyDisplayed / 26
      }
    })
)

const formatCurrency = (value) => formatMoney(value, displayedCurrency)
const formatRowAmount = (value, currency) => formatMoney(value, currency)
const amountTooltip = (amount, currency) => getConversionTooltip(amount, currency)

onMounted(fetchExpenses)
</script>

<template>
  <div class="grid gap-8 p-6 lg:p-8">
    <!-- Page Header -->
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
          <span class="text-muted">{{ getFrequencyLabel(item.frequency) }}</span>
          <span
            class="font-semibold text-accent-dark sm:text-right"
            :title="amountTooltip(item.yearly, item.currency)"
          >
            {{ formatRowAmount(item.yearly, item.currency) }}
          </span>
          <span
            class="font-semibold text-accent-dark sm:text-right"
            :title="amountTooltip(item.monthly, item.currency)"
          >
            {{ formatRowAmount(item.monthly, item.currency) }}
          </span>
          <span
            class="font-semibold text-accent-dark sm:text-right"
            :title="amountTooltip(item.perPay, item.currency)"
          >
            {{ formatRowAmount(item.perPay, item.currency) }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>
