<script setup>
import { computed } from 'vue'
import Card from 'primevue/card'
import SubfolioIconTile from './icons/SubfolioIconTile.vue'
import { useExpenses } from '../composables/useExpenses'
import { useI18n } from '../composables/useI18n'
import { useSettings } from '../composables/useSettings'

const props = defineProps({
  expenses: {
    type: Array,
    default: () => []
  },
  metrics: {
    type: Array,
    default: null
  }
})

const { getEffectiveAmount, getYearlyAmount, getNextOccurrence } = useExpenses()
const { formatMoney, convertToDisplayed, displayedCurrency, selectedMetricIds } = useSettings()
const { t, locale } = useI18n()

const activeExpenses = computed(() =>
  props.expenses.filter((expense) => expense.active !== false)
)

const yearlyTotal = computed(() =>
  activeExpenses.value.reduce(
    (sum, expense) => sum + convertToDisplayed(getYearlyAmount(expense), expense.currency || displayedCurrency.value),
    0
  )
)

const upcomingRecurrence = computed(() =>
  activeExpenses.value
    .map((expense) => ({
      ...expense,
      nextOccurrenceDate: getNextOccurrence(expense)
    }))
    .filter((expense) => expense.nextOccurrenceDate)
    .sort((a, b) => a.nextOccurrenceDate - b.nextOccurrenceDate)[0] || null
)

const selectedIds = computed(() => {
  const requested = Array.isArray(props.metrics) && props.metrics.length
    ? props.metrics
    : selectedMetricIds.value
  return requested.filter(Boolean).slice(0, 4)
})

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString(locale.value === 'fr' ? 'fr-CA' : 'en-US', {
    month: 'short',
    day: '2-digit'
  })
}

const nextRecurrenceAmount = computed(() => {
  if (!upcomingRecurrence.value) return '-'
  return formatMoney(
    convertToDisplayed(getEffectiveAmount(upcomingRecurrence.value), upcomingRecurrence.value.currency),
    displayedCurrency.value
  )
})

const metricDefinitions = computed(() => ({
  activeRecurrences: {
    label: t('summaryMetrics.activeRecurrences'),
    value: activeExpenses.value.length,
    detail: t('summaryMetrics.activeRecurrencesDetail'),
    icon: 'pi pi-list-check'
  },
  monthlyTotal: {
    label: t('summaryMetrics.monthlyTotal'),
    value: formatMoney(yearlyTotal.value / 12, displayedCurrency.value),
    detail: t('summaryMetrics.monthlyTotalDetail'),
    icon: 'pi pi-wallet'
  },
  yearlyTotal: {
    label: t('summaryMetrics.yearlyTotal'),
    value: formatMoney(yearlyTotal.value, displayedCurrency.value),
    detail: t('summaryMetrics.yearlyTotalDetail'),
    icon: 'pi pi-chart-line'
  },
  nextRecurrence: {
    label: t('summaryMetrics.nextRecurrence'),
    value: nextRecurrenceAmount.value,
    detail: upcomingRecurrence.value
      ? `${upcomingRecurrence.value.name} / ${formatDate(upcomingRecurrence.value.nextOccurrenceDate)}`
      : t('summaryMetrics.noNextRecurrence'),
    icon: 'pi pi-calendar'
  },
  weeklyTotal: {
    label: t('summaryMetrics.weeklyTotal'),
    value: formatMoney(yearlyTotal.value / 52, displayedCurrency.value),
    detail: t('summaryMetrics.weeklyTotalDetail'),
    icon: 'pi pi-calendar'
  },
  dailyTotal: {
    label: t('summaryMetrics.dailyTotal'),
    value: formatMoney(yearlyTotal.value / 365, displayedCurrency.value),
    detail: t('summaryMetrics.dailyTotalDetail'),
    icon: 'pi pi-clock'
  },
  biWeeklyTotal: {
    label: t('summaryMetrics.biWeeklyTotal'),
    value: formatMoney(yearlyTotal.value / 26, displayedCurrency.value),
    detail: t('summaryMetrics.biWeeklyTotalDetail'),
    icon: 'pi pi-refresh'
  }
}))

const visibleMetrics = computed(() =>
  selectedIds.value
    .map((id) => metricDefinitions.value[id])
    .filter(Boolean)
)
</script>

<template>
  <section
    v-if="visibleMetrics.length"
    class="metric-summary-grid"
    :class="`metric-summary-grid--count-${visibleMetrics.length}`"
    :aria-label="t('summaryMetrics.ariaLabel')"
  >
    <Card v-for="metric in visibleMetrics" :key="metric.label" class="subfolio-card metric-card">
      <template #content>
        <div class="metric-card__top">
          <p class="metric-card__label">{{ metric.label }}</p>
          <SubfolioIconTile :icon="metric.icon" :tone="info" />
        </div>
        <p class="metric-value">{{ metric.value }}</p>
        <p class="text-sm muted-copy">{{ metric.detail }}</p>
      </template>
    </Card>
  </section>
</template>
