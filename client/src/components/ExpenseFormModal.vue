<script setup>
import { computed, watch } from 'vue'
import AppModal from './AppModal.vue'
import UiSelect from './UiSelect.vue'
import UiAutocompleteSelect from './UiAutocompleteSelect.vue'
import { useExpenses } from '../composables/useExpenses'

const {
  showAddModal,
  editingId,
  form,
  baseCategories,
  extraCategories,
  expenses,
  saving,
  closeModal,
  saveExpense,
  currencies,
  frequencyOptions,
  weekdays,
  ordinals,
  months,
  availableDatePatternTypes,
  getAutoTaxRate
} = useExpenses()

const isEditing = computed(() => editingId.value !== null)

const categoryOptions = computed(() => {
  const categories = new Set(baseCategories)
  extraCategories.value.forEach((item) => categories.add(item))
  expenses.value.forEach((item) => categories.add(item.category))
  return Array.from(categories).map((item) => ({ value: item, label: item }))
})

const modalTitle = computed(() => (isEditing.value ? 'Edit Expense' : 'Add Expense'))
const buttonLabel = computed(() => (isEditing.value ? 'Save changes' : 'Add expense'))

const currencyOptions = computed(() => currencies.value.map((curr) => ({ value: curr, label: curr })))
const frequencySelectOptions = computed(() => frequencyOptions.map((freq) => ({ value: freq.value, label: freq.label })))
const patternTypeOptions = computed(() => availableDatePatternTypes.value.map((pt) => ({ value: pt.value, label: pt.label })))
const dayOptions = computed(() => daysInMonth.map((day) => ({ value: day, label: String(day) })))
const weekdayOptions = computed(() => weekdays.map((day, idx) => ({ value: idx, label: day })))
const ordinalOptions = computed(() => ordinals.map((ord, idx) => ({ value: idx + 1, label: ord })))
const monthOptions = computed(() => months.map((month, idx) => ({ value: idx, label: month })))
const autoTaxRate = computed(() => getAutoTaxRate(form.currency))
const addTax = computed(() => !form.includesTax)

// Reset date pattern type when frequency changes
watch(() => form.frequency, () => {
  const availableTypes = availableDatePatternTypes.value
  if (!availableTypes.find(t => t.value === form.datePattern.type)) {
    form.datePattern.type = availableTypes[0]?.value || 'day-of-month'
  }
})

watch(() => form.currency, () => {
  if (!form.includesTax) {
    form.taxRate = getAutoTaxRate(form.currency)
  }
})

watch(() => form.includesTax, (includes) => {
  form.taxRate = includes ? 0 : getAutoTaxRate(form.currency)
})

// Days in month for day-of-month selector
const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1)
</script>

<template>
  <AppModal :open="showAddModal" :title="modalTitle" @close="closeModal">
    <form class="grid gap-4" @submit.prevent="saveExpense">
      <!-- Name -->
      <div>
        <label for="modal-expense-name" class="mb-1.5 block text-sm text-muted">
          Expense name
        </label>
        <input
          id="modal-expense-name"
          v-model="form.name"
          type="text"
          placeholder="Netflix, Spotify, etc."
          :disabled="saving"
          class="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none disabled:opacity-50"
        />
      </div>

      <!-- Service URL -->
      <div>
        <label for="modal-expense-url" class="mb-1.5 block text-sm text-muted">
          Service URL <span class="text-muted/50">(optional)</span>
        </label>
        <input
          id="modal-expense-url"
          v-model="form.url"
          type="url"
          placeholder="https://example.com"
          :disabled="saving"
          class="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none disabled:opacity-50"
        />
      </div>

      <!-- Category -->
      <div>
        <label for="modal-expense-category" class="mb-1.5 block text-sm text-muted">
          Category
        </label>
        <UiAutocompleteSelect
          id="modal-expense-category"
          v-model="form.category"
          :options="categoryOptions"
          placeholder="Subscriptions, Utilities, etc."
          :disabled="saving"
          class="w-full"
        />
      </div>

      <!-- Amount + Currency -->
      <div class="grid grid-cols-[1fr_auto] gap-3">
        <div>
          <label for="modal-expense-amount" class="mb-1.5 block text-sm text-muted">Amount</label>
          <input
            id="modal-expense-amount"
            v-model="form.amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="19.99"
            :disabled="saving"
            class="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none disabled:opacity-50"
          />
        </div>
        <div>
          <label for="modal-expense-currency" class="mb-1.5 block text-sm text-muted">Currency</label>
          <UiSelect
            id="modal-expense-currency"
            v-model="form.currency"
            :options="currencyOptions"
            placeholder="Currency"
            :disabled="saving"
          />
        </div>
      </div>

      <!-- Tax Toggle -->
      <div class="flex items-center justify-between rounded-xl border border-border bg-surface-muted px-4 py-3">
        <div>
          <p class="text-sm font-medium text-ink">Add taxes</p>
          <p class="text-xs text-muted">When off, the amount already includes tax.</p>
        </div>
        <button
          type="button"
          :disabled="saving"
          class="relative h-6 w-11 rounded-full transition-colors"
          :class="addTax ? 'bg-accent' : 'bg-border'"
          @click="form.includesTax = !form.includesTax"
        >
          <span
            class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
            :class="addTax ? 'left-[22px]' : 'left-0.5'"
          />
        </button>
      </div>

      <div v-if="addTax" class="rounded-xl border border-border bg-surface-muted px-4 py-3">
        <p class="text-sm font-medium text-ink">Auto tax rate</p>
        <p class="text-xs text-muted">{{ autoTaxRate.toFixed(2) }}% applied based on currency.</p>
      </div>

      <!-- Frequency -->
      <div>
        <label for="modal-expense-frequency" class="mb-1.5 block text-sm text-muted">
          Frequency
        </label>
        <UiSelect
          id="modal-expense-frequency"
          v-model="form.frequency"
          :options="frequencySelectOptions"
          placeholder="Select frequency"
          :disabled="saving"
        />
      </div>

      <!-- Custom frequency times per year -->
      <div v-if="form.frequency === 'custom'">
        <label for="modal-expense-custom-freq" class="mb-1.5 block text-sm text-muted">
          Times per year
        </label>
        <input
          id="modal-expense-custom-freq"
          v-model="form.customTimesPerYear"
          type="number"
          min="1"
          max="365"
          placeholder="4"
          :disabled="saving"
          class="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none disabled:opacity-50"
        />
      </div>

      <!-- Date Pattern Section -->
      <div class="rounded-xl border border-border bg-surface-muted p-4">
        <p class="mb-3 text-sm font-medium text-ink">Payment schedule</p>

        <div class="mb-3">
          <label for="modal-start-date" class="mb-1.5 block text-xs text-muted">
            Start date
          </label>
          <input
            id="modal-start-date"
            v-model="form.startDate"
            type="date"
            :disabled="saving"
            class="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none disabled:opacity-50"
          />
        </div>

        <!-- Date Pattern Type -->
        <div class="mb-3">
          <label for="modal-pattern-type" class="mb-1.5 block text-xs text-muted">
            Pattern type
          </label>
          <UiSelect
            id="modal-pattern-type"
            v-model="form.datePattern.type"
            :options="patternTypeOptions"
            placeholder="Select pattern"
            :disabled="saving"
            class="ui-select-white"
          />
        </div>

        <!-- Day of Month -->
        <div v-if="form.datePattern.type === 'day-of-month'" class="grid gap-3">
          <div>
            <label for="modal-pattern-day" class="mb-1.5 block text-xs text-muted">
              Day of month
            </label>
            <UiSelect
              id="modal-pattern-day"
              v-model="form.datePattern.dayOfMonth"
              :options="dayOptions"
              placeholder="Day"
              :disabled="saving"
              class="ui-select-white"
            />
          </div>
        </div>

        <!-- Day of Week (for weekly/bi-weekly) -->
        <div v-if="form.datePattern.type === 'day-of-week'" class="grid gap-3">
          <div>
            <label for="modal-pattern-weekday" class="mb-1.5 block text-xs text-muted">
              Day of week
            </label>
            <UiSelect
              id="modal-pattern-weekday"
              v-model="form.datePattern.dayOfWeek"
              :options="weekdayOptions"
              placeholder="Weekday"
              :disabled="saving"
            />
          </div>
        </div>

        <!-- Nth Weekday of Month -->
        <div v-if="form.datePattern.type === 'nth-weekday'" class="grid grid-cols-2 gap-3">
          <div>
            <label for="modal-pattern-nth" class="mb-1.5 block text-xs text-muted">
              Which week
            </label>
            <UiSelect
              id="modal-pattern-nth"
              v-model="form.datePattern.nthWeek"
              :options="ordinalOptions"
              placeholder="Week"
              :disabled="saving"
            />
          </div>
          <div>
            <label for="modal-pattern-weekday2" class="mb-1.5 block text-xs text-muted">
              Day of week
            </label>
            <UiSelect
              id="modal-pattern-weekday2"
              v-model="form.datePattern.dayOfWeek"
              :options="weekdayOptions"
              placeholder="Weekday"
              :disabled="saving"
            />
          </div>
        </div>

        <!-- Day of Year (for yearly) -->
        <div v-if="form.datePattern.type === 'day-of-year'" class="grid grid-cols-2 gap-3">
          <div>
            <label for="modal-pattern-month" class="mb-1.5 block text-xs text-muted">
              Month
            </label>
            <UiSelect
              id="modal-pattern-month"
              v-model="form.datePattern.month"
              :options="monthOptions"
              placeholder="Month"
              :disabled="saving"
            />
          </div>
          <div>
            <label for="modal-pattern-day-year" class="mb-1.5 block text-xs text-muted">
              Day
            </label>
            <UiSelect
              id="modal-pattern-day-year"
              v-model="form.datePattern.dayOfMonth"
              :options="dayOptions"
              placeholder="Day"
              :disabled="saving"
            />
          </div>
        </div>

        <!-- Nth Weekday of Year (for yearly) -->
        <div v-if="form.datePattern.type === 'nth-weekday-year'" class="grid gap-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="modal-pattern-nth-year" class="mb-1.5 block text-xs text-muted">
                Which week
              </label>
              <UiSelect
                id="modal-pattern-nth-year"
                v-model="form.datePattern.nthWeek"
                :options="ordinalOptions"
                placeholder="Week"
                :disabled="saving"
              />
            </div>
            <div>
              <label for="modal-pattern-weekday-year" class="mb-1.5 block text-xs text-muted">
                Day of week
              </label>
              <UiSelect
                id="modal-pattern-weekday-year"
                v-model="form.datePattern.dayOfWeek"
                :options="weekdayOptions"
                placeholder="Weekday"
                :disabled="saving"
              />
            </div>
          </div>
          <div>
            <label for="modal-pattern-month-year" class="mb-1.5 block text-xs text-muted">
              Month
            </label>
            <UiSelect
              id="modal-pattern-month-year"
              v-model="form.datePattern.month"
              :options="monthOptions"
              placeholder="Month"
              :disabled="saving"
            />
          </div>
        </div>

        <!-- Interval (every X days) -->
        <div v-if="form.datePattern.type === 'interval'" class="grid gap-3">
          <div>
            <label for="modal-pattern-interval" class="mb-1.5 block text-xs text-muted">
              Every X days
            </label>
            <input
              id="modal-pattern-interval"
              v-model="form.datePattern.intervalDays"
              type="number"
              min="1"
              max="365"
              placeholder="30"
              :disabled="saving"
              class="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-2 flex gap-3">
        <button
          type="submit"
          :disabled="saving"
          class="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 font-semibold text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30 disabled:pointer-events-none disabled:opacity-70"
        >
          <svg
            v-if="saving"
            class="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {{ saving ? 'Saving...' : buttonLabel }}
        </button>
        <button
          type="button"
          :disabled="saving"
          class="inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-ink transition hover:border-accent hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-50"
          @click="closeModal"
        >
          Cancel
        </button>
      </div>
    </form>
  </AppModal>
</template>
