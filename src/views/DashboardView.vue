<script setup>
import { computed, onMounted, ref } from 'vue'
import Card from 'primevue/card'
import Message from 'primevue/message'
import { getCategoryIcon } from '../data/serviceCatalog'
import MetricSummaryCards from '../components/MetricSummaryCards.vue'
import SubfolioIconTile from '../components/icons/SubfolioIconTile.vue'
import { useExpenses } from '../composables/useExpenses'
import { useI18n } from '../composables/useI18n'
import { useSettings } from '../composables/useSettings'

const {
  expenses,
  fetchExpenses,
  getYearlyAmount
} = useExpenses()
const {
  formatMoney,
  convertToDisplayed,
  displayedCurrency,
  annualIncomeDisplayed,
  incomeType,
  hourlyRate,
  salaryCurrency
} = useSettings()
const { t } = useI18n()

const chartPalette = [
  '#00a594',
  '#d7af72',
  '#8fbdb1',
  '#5fb6a7',
  '#e8c58f',
  '#c65a5a',
  '#6f9f97',
  '#b89461'
]

const remainingIncomeColor = '#243834'
const hoveredSegmentId = ref('')

const activeExpenses = computed(() =>
  expenses.value.filter((expense) => expense.active !== false)
)

const categoryTotals = computed(() => {
  const grouped = new Map()

  activeExpenses.value.forEach((expense) => {
    const name = expense.category || t('dashboard.uncategorized')
    const yearly = convertToDisplayed(getYearlyAmount(expense), expense.currency)
    const current = grouped.get(name) || {
      name,
      count: 0,
      monthly: 0,
      yearly: 0
    }

    current.count += 1
    current.yearly += yearly
    current.monthly += yearly / 12
    grouped.set(name, current)
  })

  return Array.from(grouped.values()).sort((a, b) => b.yearly - a.yearly)
})

const yearlyTotal = computed(() =>
  categoryTotals.value.reduce((sum, category) => sum + category.yearly, 0)
)

const topCategory = computed(() => categoryTotals.value[0] || null)

const hasIncome = computed(() => annualIncomeDisplayed.value > 0)

const recurringIncomePercent = computed(() => {
  if (!hasIncome.value) return 0
  return (yearlyTotal.value / annualIncomeDisplayed.value) * 100
})

const annualIncomeRemaining = computed(() =>
  annualIncomeDisplayed.value - yearlyTotal.value
)

const displayedHourlyRate = computed(() => {
  if (incomeType.value !== 'hourly' || !hourlyRate.value) return 0
  return convertToDisplayed(hourlyRate.value, salaryCurrency.value)
})

const hoursToCoverRecurrences = computed(() => {
  if (!displayedHourlyRate.value) return 0
  return yearlyTotal.value / displayedHourlyRate.value
})

const chartRows = computed(() => {
  const topRows = categoryTotals.value.slice(0, 6)
  const remaining = categoryTotals.value.slice(6)

  if (!remaining.length) return topRows

  const other = remaining.reduce((acc, item) => ({
    name: t('dashboard.otherCategories'),
    count: acc.count + item.count,
    monthly: acc.monthly + item.monthly,
    yearly: acc.yearly + item.yearly
  }), { name: t('dashboard.otherCategories'), count: 0, monthly: 0, yearly: 0 })

  return [...topRows, other]
})

const chartTotal = computed(() => {
  if (hasIncome.value) {
    return Math.max(annualIncomeDisplayed.value, yearlyTotal.value)
  }

  return yearlyTotal.value
})

const remainingIncome = computed(() =>
  hasIncome.value ? Math.max(annualIncomeDisplayed.value - yearlyTotal.value, 0) : 0
)

const chartSegments = computed(() => {
  if (!chartTotal.value) return []

  let cursor = 0

  const categorySegments = chartRows.value.map((row, index) => {
    const percentage = (row.yearly / chartTotal.value) * 100
    const segment = {
      ...row,
      id: `category-${index}-${row.name}`,
      type: 'category',
      percentage,
      color: chartPalette[index % chartPalette.length],
      start: cursor,
      end: cursor + percentage,
      icon: getCategoryIcon(row.name)
    }
    cursor += percentage
    return segment
  })

  if (!hasIncome.value || !remainingIncome.value) return categorySegments

  const remainingPercentage = (remainingIncome.value / chartTotal.value) * 100
  return [
    ...categorySegments,
    {
      id: 'remaining-income',
      type: 'remaining',
      name: t('dashboard.remainingIncome'),
      count: 0,
      monthly: remainingIncome.value / 12,
      yearly: remainingIncome.value,
      percentage: remainingPercentage,
      color: remainingIncomeColor,
      start: cursor,
      end: cursor + remainingPercentage,
      icon: 'pi pi-sparkles'
    }
  ]
})

const hoveredSegment = computed(() =>
  chartSegments.value.find((segment) => segment.id === hoveredSegmentId.value) || chartSegments.value[0] || null
)

const polarPoint = (percentage, radius = 92) => {
  const angle = (percentage / 100) * 360 - 90
  const radians = (angle * Math.PI) / 180
  return {
    x: 100 + radius * Math.cos(radians),
    y: 100 + radius * Math.sin(radians)
  }
}

const pieSlicePath = (segment) => {
  const start = polarPoint(segment.start)
  const end = polarPoint(segment.end)
  const span = segment.end - segment.start

  if (span >= 99.999) {
    return 'M 100 100 L 100 8 A 92 92 0 1 1 99.99 8 A 92 92 0 1 1 100 8 Z'
  }

  const largeArcFlag = span > 50 ? 1 : 0
  return `M 100 100 L ${start.x} ${start.y} A 92 92 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`
}

const topCategoryShare = computed(() => {
  if (!topCategory.value || !yearlyTotal.value) return 0
  return Math.round((topCategory.value.yearly / yearlyTotal.value) * 100)
})

const categoryInsightCards = computed(() => {
  if (!categoryTotals.value.length) return []

  const highImpactCount = categoryTotals.value.filter((category) =>
    yearlyTotal.value && category.yearly / yearlyTotal.value >= 0.1
  ).length

  return [
    {
      key: 'largest',
      label: t('dashboard.largestCategory'),
      value: topCategory.value?.name || '-',
      detail: topCategory.value
        ? `${formatMoney(topCategory.value.yearly, displayedCurrency.value)} / ${topCategoryShare.value}%`
        : '-',
      icon: topCategory.value ? getCategoryIcon(topCategory.value.name) : 'pi pi-folder'
    },
    {
      key: 'count',
      label: t('dashboard.categoryCount'),
      value: categoryTotals.value.length,
      detail: t('dashboard.categoryCountDetail'),
      icon: 'pi pi-folder'
    },
    {
      key: 'average',
      label: t('dashboard.averageCategory'),
      value: formatMoney(yearlyTotal.value / categoryTotals.value.length, displayedCurrency.value),
      detail: t('dashboard.averageCategoryDetail'),
      icon: 'pi pi-calculator'
    },
    {
      key: 'impact',
      label: t('dashboard.highImpactCategories'),
      value: highImpactCount,
      detail: t('dashboard.highImpactCategoriesDetail'),
      icon: 'pi pi-gauge'
    }
  ]
})

const percentageLabel = (value) =>
  `${Math.round(value)}%`

const segmentValueLabel = (segment) => {
  if (!segment) return ''

  if (hasIncome.value) {
    return formatMoney(segment.yearly, displayedCurrency.value)
  }

  return `${formatMoney(segment.monthly, displayedCurrency.value)} / ${t('metrics.monthly')}`
}

onMounted(fetchExpenses)
</script>

<template>
    <header class="app-page__header">
      <div>
        <h1 class="font-serif text-4xl text-ink">{{ t('dashboard.title') }}</h1>
        <p class="muted-copy">{{ t('dashboard.intro') }}</p>
      </div>
    </header>

    <MetricSummaryCards :expenses="expenses" />

    <Card class="dashboard-income-card">
      <template #title>{{ t('dashboard.incomeComparisonTitle') }}</template>
      <template #subtitle>{{ t('dashboard.incomeComparisonSubtitle') }}</template>
      <template #content>
        <div v-if="hasIncome" class="dashboard-income-grid">
          <div class="dashboard-income-metric">
            <span class="dashboard-income-metric__label">{{ t('dashboard.annualIncome') }}</span>
            <span class="dashboard-income-metric__value">
              {{ formatMoney(annualIncomeDisplayed, displayedCurrency) }}
            </span>
          </div>
          <div class="dashboard-income-metric">
            <span class="dashboard-income-metric__label">{{ t('dashboard.recurringIncomeShare') }}</span>
            <span class="dashboard-income-metric__value">
              {{ recurringIncomePercent.toFixed(1) }}%
            </span>
          </div>
          <div class="dashboard-income-metric">
            <span class="dashboard-income-metric__label">{{ t('dashboard.remainingAfterRecurrences') }}</span>
            <span class="dashboard-income-metric__value">
              {{ formatMoney(annualIncomeRemaining, displayedCurrency) }}
            </span>
          </div>
          <div v-if="hoursToCoverRecurrences" class="dashboard-income-metric">
            <span class="dashboard-income-metric__label">{{ t('dashboard.hoursToCoverRecurrences') }}</span>
            <span class="dashboard-income-metric__value">
              {{ hoursToCoverRecurrences.toFixed(1) }}
            </span>
          </div>
        </div>
        <Message v-else severity="info" :closable="false">
          {{ t('dashboard.incomeMissing') }}
        </Message>
      </template>
    </Card>

    <Message v-if="!categoryTotals.length" severity="info" :closable="false">
      {{ t('dashboard.empty') }}
    </Message>

    <section v-else class="dashboard-grid">
      <Card class="dashboard-chart-card dashboard-chart-card--wide">
        <template #title>{{ t('dashboard.categorySplitTitle') }}</template>
        <template #subtitle>{{ t('dashboard.categorySplitSubtitle') }}</template>
        <template #content>
          <div class="dashboard-pie-layout">
            <figure class="dashboard-pie-figure">
              <svg
                class="dashboard-pie"
                viewBox="0 0 200 200"
                role="img"
                :aria-label="t('dashboard.categorySplitAria')"
              >
                <path
                  v-for="segment in chartSegments"
                  :key="segment.id"
                  class="dashboard-pie-slice"
                  :class="{ 'dashboard-pie-slice--active': hoveredSegment?.id === segment.id }"
                  :d="pieSlicePath(segment)"
                  :fill="segment.color"
                  tabindex="0"
                  @mouseenter="hoveredSegmentId = segment.id"
                  @mouseleave="hoveredSegmentId = ''"
                  @focus="hoveredSegmentId = segment.id"
                  @blur="hoveredSegmentId = ''"
                >
                  <title>
                    {{ segment.name }} - {{ segmentValueLabel(segment) }} - {{ percentageLabel(segment.percentage) }}
                  </title>
                </path>
              </svg>
              <figcaption class="dashboard-pie-caption">
                <span class="dashboard-pie-caption__value">{{ percentageLabel(hoveredSegment?.percentage || 0) }}</span>
                <span>
                  {{ hoveredSegment?.name }}
                  <span class="dashboard-pie-caption__amount">{{ segmentValueLabel(hoveredSegment) }}</span>
                </span>
              </figcaption>
            </figure>

            <div class="dashboard-category-legend">
              <button
                v-for="segment in chartSegments"
                :key="segment.id"
                type="button"
                class="dashboard-category-legend__item"
                :class="{ 'dashboard-category-legend__item--active': hoveredSegment?.id === segment.id }"
                @mouseenter="hoveredSegmentId = segment.id"
                @mouseleave="hoveredSegmentId = ''"
                @focus="hoveredSegmentId = segment.id"
                @blur="hoveredSegmentId = ''"
              >
                <span
                  class="dashboard-category-swatch"
                  :style="{ background: segment.color }"
                  aria-hidden="true"
                />
                <div class="min-w-0">
                  <p class="truncate font-extrabold text-ink">{{ segment.name }}</p>
                  <p class="text-sm muted-copy">
                    {{ segmentValueLabel(segment) }}
                  </p>
                </div>
                <span class="dashboard-category-legend__share">
                  {{ percentageLabel(segment.percentage) }}
                </span>
              </button>
            </div>
          </div>
        </template>
      </Card>

      <Card class="dashboard-insights-card">
        <template #title>{{ t('dashboard.categoryInsightsTitle') }}</template>
        <template #subtitle>{{ t('dashboard.categoryInsightsSubtitle') }}</template>
        <template #content>
          <div class="dashboard-insight-grid">
            <article
              v-for="insight in categoryInsightCards"
              :key="insight.key"
              class="dashboard-insight-card"
            >
              <SubfolioIconTile :icon="insight.icon" tone="neutral" />
              <div class="min-w-0">
                <p class="dashboard-insight-card__label">{{ insight.label }}</p>
                <p class="dashboard-insight-card__value">{{ insight.value }}</p>
                <p class="text-sm muted-copy">{{ insight.detail }}</p>
              </div>
            </article>
          </div>
        </template>
      </Card>
    </section>
</template>
