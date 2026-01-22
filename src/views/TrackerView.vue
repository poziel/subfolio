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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    expenses.value = existing
  }
}

onMounted(fetchExpenses)
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="brand">
        <span class="brand-mark">S</span>
        <div>
          <p class="brand-name">Subfolio</p>
          <p class="brand-tagline">Expense tracker</p>
        </div>
      </div>
      <div class="app-actions">
        <RouterLink class="ghost" to="/app/recurrences">Recurrence overview</RouterLink>
        <span class="status-pill" :class="status">{{ status }}</span>
        <button class="ghost" type="button" @click="logout">Sign out</button>
      </div>
    </header>

    <section class="app-hero">
      <div>
        <p class="section-eyebrow">Tracker workspace</p>
        <h1>Stay on top of every recurring expense.</h1>
        <p class="hero-copy">
          Add expenses, tag categories, and instantly see what is coming up next across the
          month or year.
        </p>
      </div>
      <div class="app-summary">
        <div>
          <p class="metric-value">$1,634</p>
          <p class="metric-label">Monthly expenses</p>
        </div>
        <div>
          <p class="metric-value">$19,580</p>
          <p class="metric-label">Yearly total</p>
        </div>
      </div>
    </section>

    <section class="expenses">
      <div class="expenses-layout">
        <form class="expense-form" @submit.prevent="isEditing ? updateExpense() : addExpense()">
          <div>
            <label for="expense-name">Expense name</label>
            <input id="expense-name" v-model="form.name" type="text" placeholder="Streaming service" />
          </div>
          <div>
            <label for="expense-category">Category</label>
            <input
              id="expense-category"
              v-model="form.category"
              list="category-options"
              type="text"
              placeholder="Subscriptions or add new"
            />
            <datalist id="category-options">
              <option v-for="option in categoryOptions" :key="option" :value="option" />
            </datalist>
          </div>
          <div>
            <label for="expense-amount">Amount</label>
            <input id="expense-amount" v-model="form.amount" type="number" placeholder="42.00" />
          </div>
          <div>
            <label for="expense-frequency">Frequency</label>
            <select id="expense-frequency" v-model="form.frequency">
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Yearly</option>
            </select>
          </div>
          <div>
            <label for="expense-date">Next due</label>
            <input id="expense-date" v-model="form.dueDate" type="date" />
          </div>
          <div class="form-actions">
            <button class="primary" type="submit">
              {{ isEditing ? 'Save changes' : 'Add expense' }}
            </button>
            <button v-if="isEditing" class="ghost" type="button" @click="cancelEdit">
              Cancel
            </button>
          </div>
        </form>
        <div class="expense-table">
          <div class="table-header">
            <div>
              <p class="table-title">Expense ledger</p>
              <p class="table-sub">March 2026 overview</p>
            </div>
            <div class="table-filters">
              <button class="ghost" type="button">Monthly</button>
              <button class="ghost" type="button">Yearly</button>
            </div>
          </div>
          <div class="table-grid">
            <div class="table-row table-head">
              <span>Expense</span>
              <span>Category</span>
              <span>Frequency</span>
              <span>Next due</span>
              <span class="amount">Amount</span>
              <span>Actions</span>
            </div>
            <div
              v-for="item in expenses"
              :key="item.id"
              class="table-row"
              :class="{ 'is-editing': editingId === item.id }"
            >
              <span>{{ item.name }}</span>
              <span>{{ item.category }}</span>
              <span>{{ item.frequency }}</span>
              <span>{{ formatDate(item.dueDate) }}</span>
              <span class="amount">${{ Number(item.amount).toFixed(2) }}</span>
              <span class="table-actions">
                <button class="ghost small" type="button" @click="startEdit(item)">
                  Edit
                </button>
                <button class="ghost small" type="button" @click="deleteExpense(item.id)">
                  Delete
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="category-summary">
      <div class="section-header">
        <p class="section-eyebrow">Category insight</p>
        <h2>Totals by category.</h2>
        <p>See where your recurring spend concentrates and how many items live in each bucket.</p>
      </div>
      <div class="category-filters">
        <button
          v-for="filter in categoryFilters"
          :key="filter"
          class="ghost small"
          type="button"
          :class="{ active: categoryFilter === filter }"
          @click="categoryFilter = filter"
        >
          {{ filter }}
        </button>
      </div>
      <div class="category-grid">
        <div v-for="category in visibleCategories" :key="category.category" class="category-card">
          <p class="category-title">{{ category.category }}</p>
          <p class="category-total">${{ category.total.toFixed(2) }}</p>
          <p class="category-meta">{{ category.count }} recurring items</p>
        </div>
        <div v-if="visibleCategories.length === 0" class="category-card empty">
          <p class="category-title">No categories yet</p>
          <p class="category-meta">Add expenses to see totals.</p>
        </div>
      </div>
    </section>
  </div>
</template>
