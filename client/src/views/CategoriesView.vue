<script setup>
import { computed, onMounted, ref } from 'vue'
import ExpenseTable from '../components/ExpenseTable.vue'
import { useExpenses } from '../composables/useExpenses'
import { useSettings } from '../composables/useSettings'

const { expenses, fetchExpenses, getYearlyAmount } = useExpenses()
const { formatMoney, convertToDisplayed, displayedCurrency } = useSettings()

const expandedCategory = ref(null)


// Group expenses by category with stats
const categoriesWithStats = computed(() => {
  const grouped = new Map()

  expenses.value.forEach((item) => {
    const category = item.category
    if (!grouped.has(category)) {
      grouped.set(category, {
        name: category,
        items: [],
        activeItems: [],
        yearly: 0
      })
    }

    const group = grouped.get(category)
    group.items.push(item)

    if (item.active !== false) {
      group.activeItems.push(item)
      group.yearly += convertToDisplayed(getYearlyAmount(item), item.currency || displayedCurrency.value)
    }
  })

  // Convert to array and add computed stats
  return Array.from(grouped.values())
    .map((group) => ({
      ...group,
      daily: group.yearly / 365,
      weekly: group.yearly / 52,
      biWeekly: group.yearly / 26,
      monthly: group.yearly / 12,
      activeCount: group.activeItems.length,
      totalCount: group.items.length
    }))
    .sort((a, b) => b.yearly - a.yearly)
})

// Global totals for header
const globalTotals = computed(() => {
  const yearly = categoriesWithStats.value.reduce((sum, cat) => sum + cat.yearly, 0)
  const activeCount = expenses.value.filter((item) => item.active !== false).length
  return {
    daily: yearly / 365,
    weekly: yearly / 52,
    biWeekly: yearly / 26,
    monthly: yearly / 12,
    yearly,
    active: activeCount,
    categories: categoriesWithStats.value.length
  }
})

const toggleCategory = (categoryName) => {
  if (expandedCategory.value === categoryName) {
    expandedCategory.value = null
  } else {
    expandedCategory.value = categoryName
  }
}

onMounted(fetchExpenses)
</script>

<template>
  <div class="grid gap-8 p-6 lg:p-8">
    <!-- Page Header -->
    <header>
      <h1 class="font-serif text-2xl text-ink">Categories</h1>
      <p class="text-muted">View your expenses organized by category.</p>
    </header>

    <!-- Global Summary Widgets -->
    <section class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <div class="rounded-2xl border border-border-strong bg-white p-4 shadow-card">
        <p class="text-xs font-medium text-muted">Daily</p>
        <p class="mt-1 text-xl font-semibold text-accent-dark">
          {{ formatMoney(globalTotals.daily, displayedCurrency) }}
        </p>
      </div>
      <div class="rounded-2xl border border-border-strong bg-white p-4 shadow-card">
        <p class="text-xs font-medium text-muted">Weekly</p>
        <p class="mt-1 text-xl font-semibold text-accent-dark">
          {{ formatMoney(globalTotals.weekly, displayedCurrency) }}
        </p>
      </div>
      <div class="rounded-2xl border border-border-strong bg-white p-4 shadow-card">
        <p class="text-xs font-medium text-muted">Bi-Weekly</p>
        <p class="mt-1 text-xl font-semibold text-accent-dark">
          {{ formatMoney(globalTotals.biWeekly, displayedCurrency) }}
        </p>
      </div>
      <div class="rounded-2xl border border-border-strong bg-white p-4 shadow-card">
        <p class="text-xs font-medium text-muted">Monthly</p>
        <p class="mt-1 text-xl font-semibold text-accent-dark">
          {{ formatMoney(globalTotals.monthly, displayedCurrency) }}
        </p>
      </div>
      <div class="rounded-2xl border border-border-strong bg-white p-4 shadow-card">
        <p class="text-xs font-medium text-muted">Yearly</p>
        <p class="mt-1 text-xl font-semibold text-accent-dark">
          {{ formatMoney(globalTotals.yearly, displayedCurrency) }}
        </p>
      </div>
      <div class="rounded-2xl border border-border-strong bg-white p-4 shadow-card">
        <p class="text-xs font-medium text-muted">Categories</p>
        <p class="mt-1 text-xl font-semibold text-ink">
          {{ globalTotals.categories }}
        </p>
      </div>
    </section>

    <!-- Categories List -->
  <section class="grid gap-4">
      <div
        v-for="category in categoriesWithStats"
        :key="category.name"
        class="rounded-3xl border border-border-strong bg-white shadow-card"
      >
        <!-- Category Header (Clickable) -->
        <button
          type="button"
          class="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-surface-muted/50"
          @click="toggleCategory(category.name)"
        >
          <div class="flex items-center gap-4">
            <div
              class="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-5 w-5"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-ink">{{ category.name }}</p>
              <p class="text-sm text-muted">
                {{ category.activeCount }} active of {{ category.totalCount }} expenses
              </p>
            </div>
          </div>
          <div class="flex items-center gap-6">
            <p class="text-lg font-semibold text-accent-dark">
              {{ formatMoney(category.monthly, displayedCurrency) }}<span class="text-sm font-normal text-muted">/mo</span>
            </p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-5 w-5 text-muted transition-transform"
              :class="expandedCategory === category.name ? 'rotate-180' : ''"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </button>

        <!-- Expanded Content -->
        <div
          v-if="expandedCategory === category.name"
          class="border-t border-border px-5 pb-5"
        >
          <!-- Category Stats -->
          <div class="grid grid-cols-2 gap-3 py-4 sm:grid-cols-3 lg:grid-cols-6">
            <div class="rounded-xl bg-surface-muted p-3">
              <p class="text-xs text-muted">Daily</p>
              <p class="font-semibold text-accent-dark">{{ formatMoney(category.daily, displayedCurrency) }}</p>
            </div>
            <div class="rounded-xl bg-surface-muted p-3">
              <p class="text-xs text-muted">Weekly</p>
              <p class="font-semibold text-accent-dark">{{ formatMoney(category.weekly, displayedCurrency) }}</p>
            </div>
            <div class="rounded-xl bg-surface-muted p-3">
              <p class="text-xs text-muted">Bi-Weekly</p>
              <p class="font-semibold text-accent-dark">{{ formatMoney(category.biWeekly, displayedCurrency) }}</p>
            </div>
            <div class="rounded-xl bg-surface-muted p-3">
              <p class="text-xs text-muted">Monthly</p>
              <p class="font-semibold text-accent-dark">{{ formatMoney(category.monthly, displayedCurrency) }}</p>
            </div>
            <div class="rounded-xl bg-surface-muted p-3">
              <p class="text-xs text-muted">Yearly</p>
              <p class="font-semibold text-accent-dark">{{ formatMoney(category.yearly, displayedCurrency) }}</p>
            </div>
            <div class="rounded-xl bg-surface-muted p-3">
              <p class="text-xs text-muted">Active</p>
              <p class="font-semibold text-ink">{{ category.activeCount }}</p>
            </div>
          </div>

          <ExpenseTable :expenses="category.items" :show-category="false" />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="categoriesWithStats.length === 0"
        class="rounded-3xl border border-border-strong bg-white p-12 text-center shadow-card"
      >
        <p class="text-muted">No categories yet.</p>
        <p class="text-sm text-muted">Add expenses to see them grouped by category.</p>
      </div>
    </section>
  </div>
</template>
