<script setup>
import { computed, onMounted, ref } from 'vue'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Message from 'primevue/message'
import { getCategoryIcon } from '../data/serviceCatalog'
import ExpenseTable from '../components/ExpenseTable.vue'
import MetricSummaryCards from '../components/MetricSummaryCards.vue'
import SubfolioButton from '../components/SubfolioButton.vue'
import SubfolioIconTile from '../components/icons/SubfolioIconTile.vue'
import { useExpenses } from '../composables/useExpenses'
import { useI18n } from '../composables/useI18n'
import { useSettings } from '../composables/useSettings'

const { expenses, fetchExpenses, getYearlyAmount, toggleExpenseActive } = useExpenses()
const { formatMoney, convertToDisplayed, displayedCurrency } = useSettings()
const { t } = useI18n()

const expandedRows = ref({})

const isCategoryActive = (category) => category.activeCount > 0

const toggleCategoryActive = async (category) => {
  const shouldActivate = !isCategoryActive(category)
  const itemsToToggle = category.items.filter((item) => (item.active !== false) !== shouldActivate)
  await Promise.all(itemsToToggle.map((item) => toggleExpenseActive(item.id)))
}

const categoriesWithStats = computed(() => {
  const grouped = new Map()

  expenses.value.forEach((item) => {
    const category = item.category
    if (!grouped.has(category)) {
      grouped.set(category, {
        name: category,
        items: [],
        activeItems: [],
        yearly: 0
      })
    }

    const group = grouped.get(category)
    group.items.push(item)

    if (item.active !== false) {
      group.activeItems.push(item)
      group.yearly += convertToDisplayed(getYearlyAmount(item), item.currency || displayedCurrency.value)
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
    .sort((a, b) => b.yearly - a.yearly)
})

onMounted(fetchExpenses)
</script>

<template>
    <header class="grid gap-2">
      <h1 class="font-serif text-4xl text-ink">{{ t('categories.title') }}</h1>
      <p class="muted-copy">{{ t('categories.intro') }}</p>
    </header>

    <MetricSummaryCards :expenses="expenses" />

    <Card>
      <template #title>{{ t('categories.breakdownTitle') }}</template>
      <template #subtitle>{{ t('categories.breakdownSubtitle') }}</template>
      <template #content>
        <Message v-if="categoriesWithStats.length === 0" severity="info" :closable="false">
          {{ t('categories.empty') }}
        </Message>

        <DataTable
          v-else
          v-model:expanded-rows="expandedRows"
          :value="categoriesWithStats"
          data-key="name"
          class="subfolio-datatable"
          table-style="min-width: 58rem"
        >
            <Column expander style="width: 3rem" />
            <Column field="name" :header="t('table.category')" sortable>
              <template #body="{ data }">
                <div class="flex items-center gap-3">
                  <SubfolioIconTile
                    :icon="getCategoryIcon(data.name)"
                    size="sm"
                    tone="neutral"
                    :label="data.name"
                  />
                  <div>
                    <p class="font-semibold text-ink">{{ data.name }}</p>
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
                  @click="toggleCategoryActive(data)"
                />
              </template>
            </Column>

            <template #expansion="{ data }">
              <div class="grid gap-4 p-4">
                <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                  <Card
                    v-for="metric in [
                      [t('metrics.daily'), data.daily],
                      [t('metrics.weekly'), data.weekly],
                      [t('metrics.biWeekly'), data.biWeekly],
                      [t('metrics.monthly'), data.monthly],
                      [t('metrics.yearly'), data.yearly]
                    ]"
                    :key="metric[0]"
                  >
                    <template #content>
                      <p class="text-sm muted-copy">{{ metric[0] }}</p>
                      <p class="font-semibold text-accent-dark">
                        {{ formatMoney(metric[1], displayedCurrency) }}
                      </p>
                    </template>
                  </Card>
                  <Card>
                    <template #content>
                      <p class="text-sm muted-copy">{{ t('metrics.active') }}</p>
                      <p class="font-semibold text-ink">{{ data.activeCount }}</p>
                    </template>
                  </Card>
                </div>
                <ExpenseTable :expenses="data.items" :show-category="false" />
              </div>
            </template>
        </DataTable>
      </template>
    </Card>
</template>
