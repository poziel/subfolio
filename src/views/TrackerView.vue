<script setup>
import { computed, onMounted, ref } from 'vue'
import Card from 'primevue/card'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import ExpenseTable from '../components/ExpenseTable.vue'
import { useExpenses } from '../composables/useExpenses'
import { useI18n } from '../composables/useI18n'
import { useSettings } from '../composables/useSettings'

const {
  expenses,
  fetchExpenses,
  getYearlyAmount
} = useExpenses()

const { formatMoney, convertToDisplayed, displayedCurrency } = useSettings()
const { t } = useI18n()

const searchQuery = ref('')

const totalYearly = computed(() =>
  expenses.value
    .filter((item) => item.active !== false)
    .reduce((sum, item) => sum + convertToDisplayed(getYearlyAmount(item), item.currency || displayedCurrency.value), 0)
)

const expenseSummary = computed(() => {
  const yearly = totalYearly.value
  const activeCount = expenses.value.filter((item) => item.active !== false).length
  return [
    { label: t('metrics.daily'), value: formatMoney(yearly / 365, displayedCurrency.value), severity: 'secondary' },
    { label: t('metrics.weekly'), value: formatMoney(yearly / 52, displayedCurrency.value), severity: 'secondary' },
    { label: t('metrics.biWeekly'), value: formatMoney(yearly / 26, displayedCurrency.value), severity: 'secondary' },
    { label: t('metrics.monthly'), value: formatMoney(yearly / 12, displayedCurrency.value), severity: 'info' },
    { label: t('metrics.yearly'), value: formatMoney(yearly, displayedCurrency.value), severity: 'success' },
    { label: t('metrics.active'), value: activeCount, severity: 'warning' }
  ]
})

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
  <div class="app-page">
    <header class="grid gap-2">
      <h1 class="font-serif text-3xl text-ink">{{ t('tracker.title') }}</h1>
      <p class="muted-copy">{{ t('tracker.intro') }}</p>
    </header>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <Card v-for="item in expenseSummary" :key="item.label" class="subfolio-card">
        <template #content>
          <div class="grid gap-2">
            <Tag :value="item.label" :severity="item.severity" rounded class="w-fit" />
            <p class="metric-value">{{ item.value }}</p>
          </div>
        </template>
      </Card>
    </section>

    <Card>
      <template #title>{{ t('tracker.ledgerTitle') }}</template>
      <template #subtitle>{{ t('tracker.ledgerSubtitle') }}</template>
      <template #content>
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
  </div>
</template>
