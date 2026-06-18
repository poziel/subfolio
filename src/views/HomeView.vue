<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import { getExpenseIcon } from '../data/serviceCatalog'
import MetricSummaryCards from '../components/MetricSummaryCards.vue'
import SubfolioIconTile from '../components/icons/SubfolioIconTile.vue'
import { useExpenses } from '../composables/useExpenses'
import { useI18n } from '../composables/useI18n'
import { useSettings } from '../composables/useSettings'

const {
  expenses,
  status,
  fetchExpenses,
  getEffectiveAmount,
  getNextOccurrence,
  getRecurrenceSummary,
  openAddModal
} = useExpenses()
const { formatMoney, displayedCurrency, convertToDisplayed } = useSettings()
const { t, locale } = useI18n()
const router = useRouter()

const activeExpenses = computed(() =>
  expenses.value.filter((expense) => expense.active !== false)
)

const upcomingExpenses = computed(() =>
  ['demo', 'offline'].includes(status.value)
    ? []
    : activeExpenses.value
    .map((expense) => ({
      ...expense,
      nextOccurrenceDate: getNextOccurrence(expense)
    }))
    .sort((a, b) => {
      if (!a.nextOccurrenceDate) return 1
      if (!b.nextOccurrenceDate) return -1
      return a.nextOccurrenceDate - b.nextOccurrenceDate
    })
    .slice(0, 5)
)

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString(locale.value === 'fr' ? 'fr-CA' : 'en-US', {
    month: 'short',
    day: '2-digit'
  })
}

const formatFrequency = (expense) => getRecurrenceSummary(expense, locale.value)

const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

const nextRecurrenceAmount = (expense) =>
  formatMoney(
    convertToDisplayed(getEffectiveAmount(expense), expense.currency),
    displayedCurrency.value
  )

const runQuickAction = (action) => {
  if (action.handler) {
    action.handler()
    return
  }

  if (action.to) router.push(action.to)
}

const actions = computed(() => [
  {
    key: 'add',
    label: t('home.addRecurrence'),
    detail: t('home.addRecurrenceDetail'),
    icon: 'pi pi-plus',
    handler: openAddModal
  },
  {
    key: 'categories',
    to: '/app/categories',
    label: t('home.browseCategories'),
    detail: t('home.browseCategoriesDetail'),
    icon: 'pi pi-folder'
  },
  {
    key: 'dashboard',
    to: '/app/dashboard',
    label: t('appNav.dashboard'),
    detail: t('home.dashboardDetail'),
    icon: 'pi pi-chart-pie'
  },
  {
    key: 'settings',
    to: '/app/settings',
    label: t('appNav.settings'),
    detail: t('home.settingsDetail'),
    icon: 'pi pi-cog'
  }
])

onMounted(fetchExpenses)
</script>

<template>
    <section class="grid gap-3">
      <h1 class="font-serif text-5xl text-ink">{{ t('home.title') }}</h1>
      <p class="max-w-2xl muted-copy">
        {{ t('home.intro') }}
      </p>
    </section>

    <MetricSummaryCards :expenses="expenses" />

    <section class="grid items-start gap-5 lg:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <template #title>{{ t('home.quickActions') }}</template>
        <template #subtitle>{{ t('home.quickActionsSubtitle') }}</template>
        <template #content>
          <div class="quick-action-grid">
            <button
              v-for="action in actions"
              :key="action.key"
              type="button"
              class="quick-action"
              @click="runQuickAction(action)"
            >
              <SubfolioIconTile :icon="action.icon" />
              <span class="min-w-0">
                <span class="block font-extrabold text-ink">{{ action.label }}</span>
                <span class="block text-sm muted-copy">{{ action.detail }}</span>
              </span>
            </button>
          </div>
        </template>
      </Card>

      <Card>
        <template #title>{{ t('home.upcomingRecurrencesTitle') }}</template>
        <template #subtitle>{{ t('home.upcomingRecurrencesSubtitle') }}</template>
        <template #content>
          <div class="recurrence-preview-list">
            <template v-if="upcomingExpenses.length">
              <RouterLink
                v-for="expense in upcomingExpenses"
                :key="expense.id"
                :to="{ name: 'expense-detail', params: { id: expense.id } }"
                class="recurrence-preview-item"
              >
                <div class="recurrence-preview-item__main">
                  <SubfolioIconTile
                    v-if="getExpenseIcon(expense)"
                    :icon="getExpenseIcon(expense)"
                    size="sm"
                    tone="neutral"
                  />
                  <span v-else class="subfolio-avatar">{{ initials(expense.name) }}</span>
                  <div class="min-w-0">
                    <p class="truncate font-extrabold text-ink">{{ expense.name }}</p>
                    <p class="truncate text-sm muted-copy">
                      {{ expense.category }} / {{ formatFrequency(expense) }} / {{ formatDate(expense.nextOccurrenceDate) }}
                    </p>
                  </div>
                </div>
                <div class="grid justify-items-end gap-1">
                  <span class="subfolio-amount">{{ nextRecurrenceAmount(expense) }}</span>
                  <Tag :value="expense.active === false ? t('categories.excluded') : t('metrics.active')" severity="info" rounded />
                </div>
              </RouterLink>
            </template>
            <p v-else class="py-8 text-sm muted-copy">
              {{ t('home.noUpcomingRecurrences') }}
            </p>
          </div>
        </template>
      </Card>
    </section>
</template>
