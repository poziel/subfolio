<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const { logout } = useAuth()

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const expenses = ref([])
const status = ref('idle')

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

const addExpense = async () => {
  if (!form.name || !form.amount || !form.dueDate) return

  const payload = {
    name: form.name,
    category: form.category,
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

  form.name = ''
  form.amount = ''
  form.dueDate = ''
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
        <form class="expense-form" @submit.prevent="addExpense">
          <div>
            <label for="expense-name">Expense name</label>
            <input id="expense-name" v-model="form.name" type="text" placeholder="Streaming service" />
          </div>
          <div>
            <label for="expense-category">Category</label>
            <select id="expense-category" v-model="form.category">
              <option>Subscriptions</option>
              <option>Utilities</option>
              <option>Groceries</option>
              <option>Housing</option>
              <option>Wellness</option>
            </select>
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
          <button class="primary" type="submit">Add expense</button>
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
            </div>
            <div v-for="item in expenses" :key="item.id" class="table-row">
              <span>{{ item.name }}</span>
              <span>{{ item.category }}</span>
              <span>{{ item.frequency }}</span>
              <span>{{ formatDate(item.dueDate) }}</span>
              <span class="amount">${{ Number(item.amount).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
