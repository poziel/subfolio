<script setup>
import { computed } from 'vue'
import { Select, MultiSelect } from '@subfolio/vue-components'
import { useSettings } from '../composables/useSettings'

const {
  displayedCurrency,
  availableCurrencies,
  allCurrencies,
  setDisplayedCurrency,
  setAvailableCurrencies,
  conversionStatus,
  defaultOrdering,
  setDefaultOrdering
} = useSettings()

const sortedCurrencies = computed(() => [...allCurrencies].sort())
const currencyOptions = computed(() => sortedCurrencies.value.map((curr) => ({ value: curr, label: curr })))

const displayedModel = computed({
  get: () => displayedCurrency.value,
  set: (next) => {
    setDisplayedCurrency(next)
    if (!availableCurrencies.value.includes(next)) {
      setAvailableCurrencies([...availableCurrencies.value, next])
    }
  }
})

const availableModel = computed({
  get: () => availableCurrencies.value,
  set: (next) => {
    const merged = new Set(next)
    merged.add(displayedCurrency.value)
    const ensured = Array.from(merged)
    setAvailableCurrencies(ensured)
  }
})

const statusLabel = computed(() => {
  if (conversionStatus.value === 'loading') return 'Refreshing rates…'
  if (conversionStatus.value === 'error') return 'Offline — using cached rates'
  return 'Rates up to date'
})

const orderingOptions = [
  { value: 'dateAdded', label: 'Date Added' },
  { value: 'amountAsc', label: 'Amount (Low to High)' },
  { value: 'amountDesc', label: 'Amount (High to Low)' },
  { value: 'category', label: 'Category' },
  { value: 'manual', label: 'Manual (Drag & Drop)' }
]

const orderingModel = computed({
  get: () => defaultOrdering.value,
  set: (value) => setDefaultOrdering(value)
})
</script>

<template>
  <div class="grid gap-8 p-6 lg:p-8">
    <header class="grid gap-2">
      <h1 class="font-serif text-2xl text-ink">Settings</h1>
      <p class="text-muted">Set your default currency and choose which currencies appear in forms.</p>
      <p class="text-xs text-muted">Saved locally — will sync to the database later.</p>
    </header>

    <section class="grid gap-6 rounded-3xl border border-border-strong bg-white p-6 shadow-card">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-ink">Displayed currency</p>
          <p class="text-sm text-muted">Totals and tooltips use this as the base currency.</p>
        </div>
        <Select
          v-model="displayedModel"
          :options="currencyOptions"
          placeholder="Currency"
          class="w-48"
        />
      </div>

      <div class="h-px bg-border" />

      <div class="grid gap-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-ink">Available currencies</p>
            <p class="text-sm text-muted">Control which currencies show up in the add/edit modal.</p>
          </div>
          <p class="text-xs text-muted">{{ statusLabel }}</p>
        </div>
        <MultiSelect
          v-model="availableModel"
          :options="currencyOptions"
          searchable
          placeholder="Select currencies"
        />
      </div>
    </section>

    <section class="grid gap-6 rounded-3xl border border-border-strong bg-white p-6 shadow-card">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-ink">Default expense ordering</p>
          <p class="text-sm text-muted">Control how expenses are sorted by default.</p>
        </div>
        <Select
          v-model="orderingModel"
          :options="orderingOptions"
          placeholder="Ordering"
          class="w-64"
        />
      </div>

      <div v-if="defaultOrdering === 'manual'" class="rounded-lg border border-border bg-blue-50 p-4">
        <div class="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 text-blue-600 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <div>
            <p class="text-sm font-medium text-blue-900">Manual ordering enabled</p>
            <p class="text-sm text-blue-700 mt-1">Drag and drop functionality will be available in expense lists. Note: This feature is currently in development and will be fully functional in a future update.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
