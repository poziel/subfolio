<script setup>
import { computed, ref } from 'vue'
import { useExpenses } from '../composables/useExpenses'
import { useSettings } from '../composables/useSettings'

const props = defineProps({
  expenses: {
    type: Array,
    default: () => []
  },
  showCategory: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: true
  },
  emptyMessage: {
    type: String,
    default: 'No expenses yet.'
  },
  showPagination: {
    type: Boolean,
    default: false
  }
})

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10)
const itemsPerPageOptions = [5, 10, 20]

const {
  openEditModal,
  deleteExpense,
  toggleExpenseActive,
  frequencyOptions,
  getNextOccurrence
} = useExpenses()

const { formatMoney, getConversionTooltip } = useSettings()

const columns = computed(() => {
  const cols = ['1.5fr']
  if (props.showCategory) cols.push('1fr')
  cols.push('0.8fr', '0.9fr', '0.8fr')
  if (props.showActions) cols.push('auto')
  return cols.join(' ')
})

const formatFrequency = (expense) => {
  if (expense.frequency === 'custom') {
    return `${expense.customTimesPerYear}x/year`
  }
  const freq = frequencyOptions.find((f) => f.value === expense.frequency)
  return freq ? freq.label : expense.frequency
}

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit'
  })
}

const nextOccurrence = (expense) => {
  const next = getNextOccurrence(expense)
  return next ? formatDate(next) : '-'
}

// Pagination computed properties
const totalPages = computed(() => {
  if (!props.showPagination) return 1
  return Math.ceil(props.expenses.length / itemsPerPage.value)
})

const paginatedExpenses = computed(() => {
  if (!props.showPagination) return props.expenses
  
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return props.expenses.slice(start, end)
})

const displayExpenses = computed(() => {
  return props.showPagination ? paginatedExpenses.value : props.expenses
})

// Pagination functions
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const changeItemsPerPage = (value) => {
  itemsPerPage.value = value
  currentPage.value = 1 // Reset to first page
}

const startItem = computed(() => {
  if (!props.expenses.length) return 0
  return (currentPage.value - 1) * itemsPerPage.value + 1
})

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value
  return Math.min(end, props.expenses.length)
})
</script>

<template>
  <div class="grid gap-3">
    <div
      class="hidden items-center gap-3 px-1.5 pb-1 text-xs uppercase tracking-wide text-muted sm:grid"
      :style="{ gridTemplateColumns: columns }"
    >
      <span>Expense</span>
      <span v-if="showCategory">Category</span>
      <span>Frequency</span>
      <span>Next due</span>
      <span class="text-right">Amount</span>
      <span v-if="showActions" class="w-24 text-right">Actions</span>
    </div>
    <div
      v-for="item in displayExpenses"
      :key="item.id"
      class="grid grid-cols-1 items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition sm:grid"
      :style="{ gridTemplateColumns: columns }"
      :class="
        item.active === false
          ? 'border-border bg-surface-muted/50 opacity-60'
          : 'border-border bg-surface-muted'
      "
    >
      <div class="flex items-center gap-2">
        <span class="font-medium text-ink">{{ item.name }}</span>
        <a
          v-if="item.url"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-muted hover:text-accent"
          title="Open service"
          @click.stop
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-3.5 w-3.5"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" x2="21" y1="14" y2="3" />
          </svg>
        </a>
      </div>
      <span v-if="showCategory" class="text-muted">{{ item.category }}</span>
      <span class="text-muted">{{ formatFrequency(item) }}</span>
      <span class="text-muted">{{ nextOccurrence(item) }}</span>
      <div class="sm:text-right">
        <span
          class="font-semibold text-accent-dark"
          :title="getConversionTooltip(item.amount, item.currency)"
        >
          {{ formatMoney(item.amount, item.currency) }}
        </span>
        <span 
          class="ml-1 text-xs text-muted"
          :title="getConversionTooltip(item.amount, item.currency)"
        >
          {{ item.currency }}
        </span>
        <span 
          v-if="!item.includesTax && item.taxRate" 
          class="ml-1 text-xs text-muted"
          :title="getConversionTooltip(item.amount, item.currency)"
        >
          +tax
        </span>
      </div>
      <span v-if="showActions" class="flex w-24 justify-start gap-1 sm:justify-end">
        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-lg border transition"
          :class="
            item.active === false
              ? 'border-border bg-white/60 text-muted hover:border-accent hover:text-accent'
              : 'border-accent/30 bg-accent/10 text-accent hover:bg-accent/20'
          "
          :title="item.active === false ? 'Activate' : 'Deactivate'"
          @click="toggleExpenseActive(item.id)"
        >
          <svg
            v-if="item.active !== false"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </button>
        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-lg border border-border bg-white/60 text-muted transition hover:border-accent hover:text-accent"
          title="Edit"
          @click="openEditModal(item)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>
        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-lg border border-border bg-white/60 text-muted transition hover:border-red-400 hover:text-red-500"
          title="Delete"
          @click="deleteExpense(item.id)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
          </svg>
        </button>
      </span>
    </div>
    <div v-if="!expenses.length" class="py-12 text-center text-muted">
      <p>{{ emptyMessage }}</p>
    </div>

    <!-- Pagination Controls -->
    <div v-if="showPagination && expenses.length > 0" class="mt-4 flex items-center justify-between border-t border-border pt-4">
      <div class="flex items-center gap-3">
        <span class="text-sm text-muted">Items per page:</span>
        <select
          v-model="itemsPerPage"
          class="rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-ink transition hover:border-accent focus:border-accent focus:outline-none"
          @change="changeItemsPerPage(Number($event.target.value))"
        >
          <option v-for="option in itemsPerPageOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
        <span class="text-sm text-muted">
          {{ startItem }} - {{ endItem }} of {{ expenses.length }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          :disabled="currentPage === 1"
          class="grid h-8 w-8 place-items-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40"
          :class="currentPage === 1 ? 'border-border bg-white/60 text-muted' : 'border-border bg-white text-ink hover:border-accent hover:text-accent'"
          title="Previous page"
          @click="goToPage(currentPage - 1)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div class="flex items-center gap-1">
          <template v-for="page in totalPages" :key="page">
            <button
              v-if="page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)"
              type="button"
              class="grid h-8 min-w-[2rem] place-items-center rounded-lg border px-2 text-sm transition"
              :class="page === currentPage ? 'border-accent bg-accent/10 font-medium text-accent' : 'border-border bg-white text-ink hover:border-accent hover:text-accent'"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <span v-else-if="page === currentPage - 2 || page === currentPage + 2" class="px-1 text-muted">...</span>
          </template>
        </div>

        <button
          type="button"
          :disabled="currentPage === totalPages"
          class="grid h-8 w-8 place-items-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40"
          :class="currentPage === totalPages ? 'border-border bg-white/60 text-muted' : 'border-border bg-white text-ink hover:border-accent hover:text-accent'"
          title="Next page"
          @click="goToPage(currentPage + 1)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
