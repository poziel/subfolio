<script setup>
import { computed } from 'vue'
import UiSelect from '../components/UiSelect.vue'
import UiMultiSelect from '../components/UiMultiSelect.vue'
import { useSettings } from '../composables/useSettings'

const {
  displayedCurrency,
  availableCurrencies,
  allCurrencies,
  setDisplayedCurrency,
  setAvailableCurrencies,
  conversionStatus
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
        <UiSelect
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
        <UiMultiSelect
          v-model="availableModel"
          :options="currencyOptions"
          searchable
          placeholder="Select currencies"
        />
      </div>
    </section>
  </div>
</template>
