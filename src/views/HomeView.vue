<script setup>
import { computed, onMounted } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import { useExpenses } from '../composables/useExpenses'
import { useI18n } from '../composables/useI18n'
import { useSettings } from '../composables/useSettings'

const { expenses, fetchExpenses, getYearlyAmount } = useExpenses()
const { formatMoney } = useSettings()
const { t } = useI18n()

const activeExpenses = computed(() =>
  expenses.value.filter((expense) => expense.active !== false)
)

const activeCount = computed(() => activeExpenses.value.length)

const monthlyTotal = computed(() =>
  activeExpenses.value.reduce((sum, expense) => sum + getYearlyAmount(expense) / 12, 0)
)

const yearlyTotal = computed(() =>
  activeExpenses.value.reduce((sum, expense) => sum + getYearlyAmount(expense), 0)
)

const stats = computed(() => [
  {
    label: t('home.activeExpenses'),
    value: activeCount.value,
    detail: t('home.activeExpensesDetail'),
    icon: 'pi pi-list-check',
    severity: 'info'
  },
  {
    label: t('home.monthlyTotal'),
    value: formatMoney(monthlyTotal.value),
    detail: t('home.monthlyTotalDetail'),
    icon: 'pi pi-wallet',
    severity: 'success'
  },
  {
    label: t('home.yearlyTotal'),
    value: formatMoney(yearlyTotal.value),
    detail: t('home.yearlyTotalDetail'),
    icon: 'pi pi-chart-line',
    severity: 'warning'
  }
])

const actions = computed(() => [
  {
    to: '/app/expenses',
    label: t('home.viewExpenses'),
    detail: t('home.viewExpensesDetail'),
    icon: 'pi pi-table'
  },
  {
    to: '/app/categories',
    label: t('home.browseCategories'),
    detail: t('home.browseCategoriesDetail'),
    icon: 'pi pi-folder'
  },
  {
    to: '/app/recurrences',
    label: t('home.reviewRecurrences'),
    detail: t('home.reviewRecurrencesDetail'),
    icon: 'pi pi-refresh'
  },
  {
    to: '/app/settings',
    label: t('appNav.settings'),
    detail: t('home.settingsDetail'),
    icon: 'pi pi-cog'
  }
])

onMounted(fetchExpenses)
</script>

<template>
  <div class="app-page">
    <section class="grid gap-3">
      <h1 class="font-serif text-4xl text-ink">{{ t('home.title') }}</h1>
      <p class="max-w-2xl muted-copy">
        {{ t('home.intro') }}
      </p>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <Card v-for="stat in stats" :key="stat.label" class="subfolio-card">
        <template #content>
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-semibold muted-copy">{{ stat.label }}</p>
              <p class="mt-2 metric-value">{{ stat.value }}</p>
              <p class="mt-2 text-sm muted-copy">{{ stat.detail }}</p>
            </div>
            <Tag :severity="stat.severity" rounded>
              <span :class="stat.icon" />
            </Tag>
          </div>
        </template>
      </Card>
    </section>

    <Card>
      <template #title>{{ t('home.quickActions') }}</template>
      <template #subtitle>{{ t('home.quickActionsSubtitle') }}</template>
      <template #content>
        <div class="grid gap-4 md:grid-cols-2">
          <RouterLink
            v-for="action in actions"
            :key="action.to"
            :to="action.to"
            class="rounded-xl border border-[var(--p-surface-200)] p-4 transition hover:border-[var(--p-primary-300)] hover:bg-[var(--p-primary-50)]"
          >
            <div class="flex items-center gap-3">
              <Tag severity="secondary" rounded>
                <span :class="action.icon" />
              </Tag>
              <div>
                <p class="font-semibold text-ink">{{ action.label }}</p>
                <p class="text-sm muted-copy">{{ action.detail }}</p>
              </div>
            </div>
          </RouterLink>
        </div>
      </template>
      <template #footer>
        <RouterLink v-slot="{ navigate }" to="/app/expenses" custom>
          <Button :label="t('home.openTracker')" icon="pi pi-arrow-right" icon-pos="right" @click="navigate" />
        </RouterLink>
      </template>
    </Card>
  </div>
</template>
