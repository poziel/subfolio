<script setup>
import { computed, onMounted, ref } from 'vue'
import Card from 'primevue/card'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import ExpenseTable from '../components/ExpenseTable.vue'
import MetricSummaryCards from '../components/MetricSummaryCards.vue'
import SubfolioButton from '../components/SubfolioButton.vue'
import { useExpenses } from '../composables/useExpenses'
import { useI18n } from '../composables/useI18n'

const {
  expenses,
  fetchExpenses,
  openAddModal,
  status,
  statusError
} = useExpenses()

const { t } = useI18n()

const searchQuery = ref('')

const filteredExpenses = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return expenses.value

  return expenses.value.filter((item) => (
    item.name.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query) ||
    (item.frequency && item.frequency.toLowerCase().includes(query)) ||
    (item.currency && item.currency.toLowerCase().includes(query))
  ))
})

onMounted(fetchExpenses)
</script>

<template>
    <header class="app-page__header">
      <div class="grid gap-2">
        <h1 class="font-serif text-4xl text-ink">{{ t('tracker.title') }}</h1>
        <p class="muted-copy">{{ t('tracker.intro') }}</p>
      </div>
      <SubfolioButton
        type="button"
        :label="t('appNav.addExpense')"
        icon="pi pi-plus"
        @click="openAddModal"
      />
    </header>

    <MetricSummaryCards :expenses="expenses" />

    <Card>
      <template #title>{{ t('tracker.ledgerTitle') }}</template>
      <template #subtitle>{{ t('tracker.ledgerSubtitle') }}</template>
      <template #content>
        <Message
          v-if="status === 'offline' && statusError"
          severity="warn"
          :closable="false"
          class="mb-5"
        >
          {{ statusError }}
        </Message>

        <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <IconField class="w-full sm:w-80">
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="searchQuery"
              :placeholder="t('tracker.searchPlaceholder')"
              class="w-full"
            />
          </IconField>
        </div>

        <Message
          v-if="expenses.length > 0 && filteredExpenses.length === 0"
          severity="warn"
          :closable="false"
        >
          {{ t('tracker.noSearchMatch', { query: searchQuery }) }}
        </Message>
        <ExpenseTable
          v-else
          :expenses="filteredExpenses"
          :show-pagination="true"
          :empty-message="t('tracker.empty')"
        />
      </template>
    </Card>
</template>
