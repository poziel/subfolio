<script setup>
import { computed, onMounted, ref } from 'vue'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Message from 'primevue/message'
import AppPage from '../components/AppPage.vue'
import AppSectionSurface from '../components/AppSectionSurface.vue'
import ExpenseTable from '../components/ExpenseTable.vue'
import MetricSummaryCards from '../components/MetricSummaryCards.vue'
import SubfolioButton from '../components/SubfolioButton.vue'
import SubfolioSurfaceCard from '../components/SubfolioSurfaceCard.vue'
import SubfolioIconTile from '../components/icons/SubfolioIconTile.vue'
import { useExpenses } from '../composables/useExpenses'
import { useI18n } from '../composables/useI18n'
import { useSettings } from '../composables/useSettings'

const {
  expenses,
  fetchExpenses,
  getYearlyAmount,
  getExpenseCategory,
  getExpenseCategoryName,
  getExpenseCategoryIcon,
  toggleCategoryActive
} = useExpenses()
const { formatMoney, convertToDisplayed, displayedCurrency } = useSettings()
const { t } = useI18n()

const expandedRows = ref({})

const isCategoryActive = (category) => category.status !== 'inactive' && category.active !== false

const categoryRowClass = (category) => [
  'subfolio-category-row',
  isCategoryActive(category) ? '' : 'subfolio-category-row--inactive'
].filter(Boolean).join(' ')

const toggleExpandedCategory = (event) => {
  const target = event?.originalEvent?.target
  if (target?.closest?.('button,a,input,textarea,select,[role="button"],.p-row-toggler')) return

  const id = String(event?.data?.id || '')
  if (!id) return

  const next = { ...expandedRows.value }
  if (next[id]) {
    delete next[id]
  } else {
    next[id] = true
  }
  expandedRows.value = next
}

const categoriesWithStats = computed(() => {
  const grouped = new Map()

  expenses.value.forEach((item) => {
    const category = getExpenseCategory(item)
    const name = getExpenseCategoryName(item)
    const id = category?.id || item.categoryId || `category-${name}`

    if (!grouped.has(id)) {
      grouped.set(id, {
        id,
        name,
        status: category?.status || item.categoryStatus || 'active',
        active: category?.active !== false && item.categoryActive !== false,
        icon: category?.icon || getExpenseCategoryIcon(item),
        items: [],
        activeItems: [],
        yearly: 0
      })
    }

    const group = grouped.get(id)
    group.items.push(item)

    if (item.active !== false) {
      const yearly = convertToDisplayed(getYearlyAmount(item), item.currency || displayedCurrency.value)
      group.activeItems.push(item)
      group.yearly += yearly
    }
  })

  return Array.from(grouped.values())
    .map((group) => ({
      ...group,
      daily: group.yearly / 365,
      weekly: group.yearly / 52,
      biWeekly: group.yearly / 26,
      monthly: group.yearly / 12,
      activeCount: group.activeItems.length,
      totalCount: group.items.length
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

onMounted(fetchExpenses)
</script>

<template>
  <AppPage>
    <template #header>
      <header class="grid gap-1">
        <h1 class="font-serif text-4xl text-ink">{{ t('categories.title') }}</h1>
        <p class="muted-copy">{{ t('categories.intro') }}</p>
      </header>
    </template>

    <MetricSummaryCards :expenses="expenses" />

    <AppSectionSurface
      :title="t('categories.breakdownTitle')"
      :subtitle="t('categories.breakdownSubtitle')"
      surface-class="app-section-surface app-section-surface--table"
    >
      <Message v-if="categoriesWithStats.length === 0" severity="info" :closable="false">
        {{ t('categories.empty') }}
      </Message>

      <DataTable
        v-else
        v-model:expanded-rows="expandedRows"
        :value="categoriesWithStats"
        data-key="id"
        class="subfolio-datatable"
        :row-class="categoryRowClass"
        table-style="min-width: 58rem"
        @row-click="toggleExpandedCategory"
      >
        <Column expander style="width: 3rem" />
        <Column field="name" :header="t('table.category')" sortable>
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <SubfolioIconTile
                :icon="data.icon"
                size="sm"
                tone="neutral"
                :label="data.name"
              />
              <div>
                <div class="flex items-center gap-2">
                  <span
                    v-if="!isCategoryActive(data)"
                    class="subfolio-category-status-marker"
                    :title="t('categories.excluded')"
                    :aria-label="t('categories.excluded')"
                  />
                  <p class="font-semibold text-ink">{{ data.name }}</p>
                </div>
                <p class="text-sm muted-copy">
                  {{ t('categories.activeOfTotal', { active: data.activeCount, total: data.totalCount }) }}
                </p>
              </div>
            </div>
          </template>
        </Column>
        <Column :header="t('table.monthly')" body-class="text-right" sortable sort-field="monthly">
          <template #body="{ data }">
            <span class="font-semibold text-accent-dark">
              {{ formatMoney(data.monthly, displayedCurrency) }}
            </span>
          </template>
        </Column>
        <Column :header="t('table.yearly')" body-class="text-right" sortable sort-field="yearly">
          <template #body="{ data }">
            <span class="font-semibold text-accent-dark">
              {{ formatMoney(data.yearly, displayedCurrency) }}
            </span>
          </template>
        </Column>
        <Column :header="t('table.actions')" body-class="text-right">
          <template #body="{ data }">
            <SubfolioButton
              type="button"
              :icon="isCategoryActive(data) ? 'pi pi-power-off' : 'pi pi-play'"
              variant="tertiary"
              :theme="isCategoryActive(data) ? 'success' : 'secondary'"
              size="small"
              :title="isCategoryActive(data) ? t('table.deactivate') : t('table.activate')"
              :aria-label="isCategoryActive(data) ? t('table.deactivate') : t('table.activate')"
              @click.stop="toggleCategoryActive(data)"
            />
          </template>
        </Column>

        <template #expansion="{ data }">
          <div class="grid gap-4 p-4">
            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <SubfolioSurfaceCard
                v-for="metric in [
                  [t('metrics.daily'), data.daily],
                  [t('metrics.weekly'), data.weekly],
                  [t('metrics.biWeekly'), data.biWeekly],
                  [t('metrics.monthly'), data.monthly],
                  [t('metrics.yearly'), data.yearly]
                ]"
                :key="metric[0]"
                class="category-metric-card"
              >
                <p class="text-sm muted-copy">{{ metric[0] }}</p>
                <p class="font-semibold text-accent-dark">
                  {{ formatMoney(metric[1], displayedCurrency) }}
                </p>
              </SubfolioSurfaceCard>
              <SubfolioSurfaceCard class="category-metric-card">
                <p class="text-sm muted-copy">{{ t('metrics.active') }}</p>
                <p class="font-semibold text-ink">{{ data.activeCount }}</p>
              </SubfolioSurfaceCard>
            </div>
            <ExpenseTable :expenses="data.items" :show-category="false" />
          </div>
        </template>
      </DataTable>
    </AppSectionSurface>
  </AppPage>
</template>
