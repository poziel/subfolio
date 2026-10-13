<script setup>
import { computed, onMounted, ref } from 'vue'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import AppPage from '../components/AppPage.vue'
import AppSectionSurface from '../components/AppSectionSurface.vue'
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
  statusError,
  getExpenseCategoryName,
  getRecurrenceSummary
} = useExpenses()

const { t, locale } = useI18n()

const searchQuery = ref('')

const filteredExpenses = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return expenses.value

  return expenses.value.filter((item) => (
    item.name.toLowerCase().includes(query) ||
    getExpenseCategoryName(item).toLowerCase().includes(query) ||
    getRecurrenceSummary(item, locale.value).toLowerCase().includes(query) ||
    (item.frequency && item.frequency.toLowerCase().includes(query)) ||
    (item.currency && item.currency.toLowerCase().includes(query))
  ))
})

onMounted(fetchExpenses)
</script>

<template>
  <AppPage>
    <template #header>
      <header class="app-page__header">
        <div class="grid gap-1">
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
    </template>

    <MetricSummaryCards :expenses="expenses" />

    <AppSectionSurface
      :title="t('tracker.ledgerTitle')"
      :subtitle="t('tracker.ledgerSubtitle')"
      surface-class="app-section-surface app-section-surface--table"
    >
      <template #actions>
        <IconField class="expense-ledger-search">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchQuery"
            :placeholder="t('tracker.searchPlaceholder')"
            class="w-full"
          />
        </IconField>
      </template>

      <Message
        v-if="status === 'offline' && statusError"
        severity="warn"
        :closable="false"
        class="expense-ledger-message"
      >
        {{ statusError }}
      </Message>

      <Message
        v-if="expenses.length > 0 && filteredExpenses.length === 0"
        severity="warn"
        :closable="false"
        class="expense-ledger-message"
      >
        {{ t('tracker.noSearchMatch', { query: searchQuery }) }}
      </Message>
      <ExpenseTable
        v-else
        :expenses="filteredExpenses"
        :show-pagination="true"
        :empty-message="t('tracker.empty')"
      />
    </AppSectionSurface>
  </AppPage>
</template>
