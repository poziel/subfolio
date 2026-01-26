<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const { logout } = useAuth()

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const expenses = ref([])
const status = ref('idle')
const editingId = ref(null)
const categoryFilter = ref('All')
const baseCategories = ['Subscriptions', 'Utilities', 'Groceries', 'Housing', 'Wellness']
const extraCategories = ref([])

const form = reactive({
  name: '',
  category: 'Subscriptions',
  amount: '',
  frequency: 'Monthly',
  dueDate: ''
})

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

const isEditing = computed(() => editingId.value !== null)
const categoryOptions = computed(() => {
  const categories = new Set(baseCategories)

  extraCategories.value.forEach((item) => categories.add(item))
  expenses.value.forEach((item) => categories.add(item.category))

  return Array.from(categories)
})
const categoryTotals = computed(() => {
  const totals = new Map()

  expenses.value.forEach((item) => {
    const current = totals.get(item.category) || { total: 0, count: 0 }
    totals.set(item.category, {
      total: current.total + Number(item.amount),
      count: current.count + 1
    })
  })

  return Array.from(totals.entries())
    .map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count
    }))
    .sort((a, b) => b.total - a.total)
})

const visibleCategories = computed(() => {
  if (categoryFilter.value === 'All') return categoryTotals.value
  return categoryTotals.value.filter((item) => item.category === categoryFilter.value)
})

const categoryFilters = computed(() => ['All', ...categoryTotals.value.map((item) => item.category)])

const normalizeCategory = (value) => value.trim()

const registerCategory = (value) => {
  const normalized = normalizeCategory(value)
  if (!normalized) return

  if (!baseCategories.includes(normalized) && !extraCategories.value.includes(normalized)) {
    extraCategories.value = [...extraCategories.value, normalized]
  }
}

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit'
  })
}

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

const resetForm = () => {
  form.name = ''
  form.category = baseCategories[0]
  form.amount = ''
  form.frequency = 'Monthly'
  form.dueDate = ''
}

const startEdit = (item) => {
  editingId.value = item.id
  form.name = item.name
  form.category = item.category
  form.amount = Number(item.amount)
  form.frequency = item.frequency
  form.dueDate = item.dueDate
}

const cancelEdit = () => {
  editingId.value = null
  resetForm()
}

const addExpense = async () => {
  if (!form.name || !form.amount || !form.dueDate) return

  const normalizedCategory = normalizeCategory(form.category) || baseCategories[0]

  const payload = {
    name: form.name,
    category: normalizedCategory,
    amount: Number(form.amount),
    frequency: form.frequency,
    dueDate: form.dueDate
  }

  try {
    const response = await fetch(`${apiBase}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) throw new Error('Failed request')

    const created = await response.json()
    expenses.value = [created, ...expenses.value]
  } catch {
    const fallbackItem = {
      id: Date.now(),
      ...payload
    }
    expenses.value = [fallbackItem, ...expenses.value]
  }

  registerCategory(normalizedCategory)

  resetForm()
}

const updateExpense = async () => {
  if (!form.name || !form.amount || !form.dueDate || editingId.value === null) return

  const normalizedCategory = normalizeCategory(form.category) || baseCategories[0]

  const payload = {
    name: form.name,
    category: normalizedCategory,
    amount: Number(form.amount),
    frequency: form.frequency,
    dueDate: form.dueDate
  }

  try {
    const response = await fetch(`${apiBase}/expenses/${editingId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) throw new Error('Failed request')

    const updated = await response.json()
    expenses.value = expenses.value.map((item) => (item.id === updated.id ? updated : item))
  } catch {
    expenses.value = expenses.value.map((item) =>
      item.id === editingId.value ? { ...item, ...payload } : item
    )
  }

  registerCategory(normalizedCategory)

  cancelEdit()
}

const deleteExpense = async (id) => {
  const existing = expenses.value
  expenses.value = expenses.value.filter((item) => item.id !== id)

  try {
    const response = await fetch(`${apiBase}/expenses/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) throw new Error('Failed request')
  } catch {
    expenses.value = existing
  }
}

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
          <p class="text-sm text-muted">Expense tracker</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <RouterLink
          to="/app/recurrences"
          class="inline-flex items-center gap-2 rounded-full border border-border bg-white/60 px-4 py-2 text-sm text-ink transition hover:border-accent hover:bg-white"
        >
          Recurrence overview
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
      class="flex flex-col items-start justify-between gap-6 rounded-3xl border border-border-strong bg-white p-7 shadow-card sm:flex-row sm:items-center"
    >
      <div>
        <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-dark">
          Tracker workspace
        </p>
        <h1 class="mb-2 font-serif text-3xl text-ink sm:text-4xl">
          Stay on top of every recurring expense.
        </h1>
        <p class="max-w-lg text-muted">
          Add expenses, tag categories, and instantly see what is coming up next across the month or
          year.
        </p>
      </div>
      <div class="grid gap-4 text-right max-sm:text-left">
        <div>
          <p class="text-2xl font-semibold text-ink">$1,634</p>
          <p class="text-sm text-muted">Monthly expenses</p>
        </div>
        <div>
          <p class="text-2xl font-semibold text-ink">$19,580</p>
          <p class="text-sm text-muted">Yearly total</p>
        </div>
      </div>
    </section>

    <!-- Expenses Section -->
    <section class="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
      <!-- Form -->
      <form
        class="grid gap-4 rounded-3xl border border-border-strong bg-white p-6 shadow-card"
        @submit.prevent="isEditing ? updateExpense() : addExpense()"
      >
        <div>
          <label for="expense-name" class="mb-1.5 block text-sm text-muted">Expense name</label>
          <input
            id="expense-name"
            v-model="form.name"
            type="text"
            placeholder="Streaming service"
            class="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label for="expense-category" class="mb-1.5 block text-sm text-muted">Category</label>
          <input
            id="expense-category"
            v-model="form.category"
            list="category-options"
            type="text"
            placeholder="Subscriptions or add new"
            class="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
          />
          <datalist id="category-options">
            <option v-for="option in categoryOptions" :key="option" :value="option" />
          </datalist>
        </div>
        <div>
          <label for="expense-amount" class="mb-1.5 block text-sm text-muted">Amount</label>
          <input
            id="expense-amount"
            v-model="form.amount"
            type="number"
            placeholder="42.00"
            class="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label for="expense-frequency" class="mb-1.5 block text-sm text-muted">Frequency</label>
          <select
            id="expense-frequency"
            v-model="form.frequency"
            class="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-ink focus:border-accent focus:outline-none"
          >
            <option>Monthly</option>
            <option>Weekly</option>
            <option>Yearly</option>
          </select>
        </div>
        <div>
          <label for="expense-date" class="mb-1.5 block text-sm text-muted">Next due</label>
          <input
            id="expense-date"
            v-model="form.dueDate"
            type="date"
            class="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-ink focus:border-accent focus:outline-none"
          />
        </div>
        <div class="flex flex-wrap gap-2.5 pt-1">
          <button
            type="submit"
            class="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 font-semibold text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30"
          >
            {{ isEditing ? 'Save changes' : 'Add expense' }}
          </button>
          <button
            v-if="isEditing"
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-border bg-white/60 px-4 py-2.5 text-ink transition hover:border-accent hover:bg-white"
            @click="cancelEdit"
          >
            Cancel
          </button>
        </div>
      </form>

      <!-- Table -->
      <div class="grid gap-5 rounded-3xl border border-border-strong bg-white p-6 shadow-card">
        <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p class="text-lg font-semibold text-ink">Expense ledger</p>
            <p class="text-sm text-muted">March 2026 overview</p>
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-full border border-border bg-white/60 px-3 py-1.5 text-sm text-ink transition hover:border-accent hover:bg-white"
            >
              Monthly
            </button>
            <button
              type="button"
              class="rounded-full border border-border bg-white/60 px-3 py-1.5 text-sm text-ink transition hover:border-accent hover:bg-white"
            >
              Yearly
            </button>
          </div>
        </div>
        <div class="grid gap-3">
          <!-- Table Header -->
          <div
            class="hidden grid-cols-[1.4fr_1fr_0.9fr_0.9fr_0.7fr_1fr] items-center gap-3 px-1.5 pb-1 text-xs uppercase tracking-wide text-muted sm:grid"
          >
            <span>Expense</span>
            <span>Category</span>
            <span>Frequency</span>
            <span>Next due</span>
            <span class="text-right">Amount</span>
            <span class="text-right">Actions</span>
          </div>
          <!-- Table Rows -->
          <div
            v-for="item in expenses"
            :key="item.id"
            class="grid grid-cols-1 items-center gap-3 rounded-2xl border bg-surface-muted px-4 py-3 text-sm sm:grid-cols-[1.4fr_1fr_0.9fr_0.9fr_0.7fr_1fr]"
            :class="
              editingId === item.id
                ? 'border-accent/40 shadow-lg shadow-accent/10'
                : 'border-border'
            "
          >
            <span class="font-medium text-ink">{{ item.name }}</span>
            <span class="text-muted">{{ item.category }}</span>
            <span class="text-muted">{{ item.frequency }}</span>
            <span class="text-muted">{{ formatDate(item.dueDate) }}</span>
            <span class="font-semibold text-accent-dark sm:text-right">
              ${{ Number(item.amount).toFixed(2) }}
            </span>
            <span class="flex justify-start gap-2 sm:justify-end">
              <button
                type="button"
                class="rounded-full border border-border bg-white/60 px-3 py-1 text-xs text-ink transition hover:border-accent hover:bg-white"
                @click="startEdit(item)"
              >
                Edit
              </button>
              <button
                type="button"
                class="rounded-full border border-border bg-white/60 px-3 py-1 text-xs text-ink transition hover:border-red-400 hover:bg-white"
                @click="deleteExpense(item.id)"
              >
                Delete
              </button>
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Category Summary Section -->
    <section class="grid gap-6">
      <div class="max-w-xl">
        <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-dark">
          Category insight
        </p>
        <h2 class="mb-1 font-serif text-2xl text-ink">Totals by category.</h2>
        <p class="text-muted">
          See where your recurring spend concentrates and how many items live in each bucket.
        </p>
      </div>
      <div class="flex flex-wrap gap-2.5">
        <button
          v-for="filter in categoryFilters"
          :key="filter"
          type="button"
          class="rounded-full border px-3 py-1.5 text-sm transition"
          :class="
            categoryFilter === filter
              ? 'border-accent/40 bg-accent/10 text-accent-dark'
              : 'border-border bg-white/60 text-ink hover:border-accent hover:bg-white'
          "
          @click="categoryFilter = filter"
        >
          {{ filter }}
        </button>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="category in visibleCategories"
          :key="category.category"
          class="grid gap-2 rounded-2xl border border-border-strong bg-white p-5 shadow-card"
        >
          <p class="font-semibold text-ink">{{ category.category }}</p>
          <p class="text-2xl font-semibold text-accent-dark">${{ category.total.toFixed(2) }}</p>
          <p class="text-sm text-muted">{{ category.count }} recurring items</p>
        </div>
        <div
          v-if="visibleCategories.length === 0"
          class="grid place-items-center gap-2 rounded-2xl border border-border-strong bg-white p-5 text-center shadow-card"
        >
          <p class="font-semibold text-muted">No categories yet</p>
          <p class="text-sm text-muted">Add expenses to see totals.</p>
        </div>
      </div>
    </section>
  </div>
</template>
