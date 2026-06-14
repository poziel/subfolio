<script setup>
import { computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Tag from 'primevue/tag'
import { useExpenses } from '../composables/useExpenses'
import { useI18n } from '../composables/useI18n'
import { useSettings } from '../composables/useSettings'

const { expenses, fetchExpenses, getYearlyAmount, frequencyOptions } = useExpenses()
const { formatMoney, getConversionTooltip, convertToDisplayed, displayedCurrency } = useSettings()
const { t } = useI18n()

const getFrequencyLabel = (frequency) => {
  const option = frequencyOptions.find((item) => item.value === frequency)
  return option ? t(`frequencies.${option.value}`) : frequency
}

const summaryTotals = computed(() => {
  const activeExpenses = expenses.value.filter((item) => item.active !== false)
  const yearly = activeExpenses.reduce(
    (total, item) => total + convertToDisplayed(getYearlyAmount(item), item.currency || displayedCurrency.value),
    0
  )

  return [
    {
      label: t('recurrences.yearlyLabel'),
      value: formatMoney(yearly, displayedCurrency.value),
      detail: t('recurrences.yearlyDetail'),
      severity: 'success'
    },
    {
      label: t('recurrences.monthlyLabel'),
      value: formatMoney(yearly / 12, displayedCurrency.value),
      detail: t('recurrences.monthlyDetail'),
      severity: 'info'
    },
    {
      label: t('recurrences.payLabel'),
      value: formatMoney(yearly / 26, displayedCurrency.value),
      detail: t('recurrences.payDetail'),
      severity: 'warning'
    }
  ]
})

const projectedRows = computed(() =>
  expenses.value
    .filter((item) => item.active !== false)
    .map((item) => {
      const yearly = getYearlyAmount(item)
      return {
        ...item,
        yearly,
        monthly: yearly / 12,
        perPay: yearly / 26
      }
    })
)

const amountTooltip = (amount, currency) => getConversionTooltip(amount, currency)

onMounted(fetchExpenses)
</script>

<template>
  <div class="app-page">
    <Card>
      <template #content>
        <div class="grid gap-3">
          <h1 class="font-serif text-4xl text-ink">
            {{ t('recurrences.title') }}
          </h1>
          <p class="max-w-2xl muted-copy">
            {{ t('recurrences.intro') }}
          </p>
        </div>
      </template>
    </Card>

    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card v-for="item in summaryTotals" :key="item.label" class="subfolio-card">
        <template #content>
          <div class="grid gap-2">
            <Tag :value="item.label" :severity="item.severity" rounded class="w-fit" />
            <p class="metric-value">{{ item.value }}</p>
            <p class="text-sm muted-copy">{{ item.detail }}</p>
          </div>
        </template>
      </Card>
    </section>

    <Card>
      <template #title>{{ t('recurrences.allTitle') }}</template>
      <template #subtitle>{{ t('recurrences.allSubtitle') }}</template>
      <template #content>
        <div class="subfolio-table-wrap">
          <DataTable
            :value="projectedRows"
            class="subfolio-datatable"
            data-key="id"
            striped-rows
            table-style="min-width: 58rem"
          >
            <template #empty>
              <div class="py-10 text-center muted-copy">{{ t('recurrences.empty') }}</div>
            </template>
            <Column field="name" :header="t('table.expense')" sortable>
              <template #body="{ data }">
                <span class="font-semibold text-ink">{{ data.name }}</span>
              </template>
            </Column>
            <Column field="category" :header="t('table.category')" sortable>
              <template #body="{ data }">
                <Tag :value="data.category" severity="secondary" rounded />
              </template>
            </Column>
            <Column :header="t('table.frequency')" sortable sort-field="frequency">
              <template #body="{ data }">
                {{ getFrequencyLabel(data.frequency) }}
              </template>
            </Column>
            <Column :header="t('table.yearly')" body-class="text-right">
              <template #body="{ data }">
                <span
                  class="font-semibold text-accent-dark"
                  :title="amountTooltip(data.yearly, data.currency)"
                >
                  {{ formatMoney(data.yearly, data.currency) }}
                </span>
              </template>
            </Column>
            <Column :header="t('table.monthly')" body-class="text-right">
              <template #body="{ data }">
                <span
                  class="font-semibold text-accent-dark"
                  :title="amountTooltip(data.monthly, data.currency)"
                >
                  {{ formatMoney(data.monthly, data.currency) }}
                </span>
              </template>
            </Column>
            <Column :header="t('table.perPay')" body-class="text-right">
              <template #body="{ data }">
                <span
                  class="font-semibold text-accent-dark"
                  :title="amountTooltip(data.perPay, data.currency)"
                >
                  {{ formatMoney(data.perPay, data.currency) }}
                </span>
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </Card>
  </div>
</template>
