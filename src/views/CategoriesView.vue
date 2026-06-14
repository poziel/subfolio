<script setup>
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import ExpenseTable from '../components/ExpenseTable.vue'
import { useExpenses } from '../composables/useExpenses'
import { useI18n } from '../composables/useI18n'
import { useSettings } from '../composables/useSettings'

const { expenses, fetchExpenses, getYearlyAmount } = useExpenses()
const { formatMoney, convertToDisplayed, displayedCurrency } = useSettings()
const { t } = useI18n()

const expandedRows = ref({})
const excludedCategories = ref(new Set())

const loadExcludedCategories = () => {
  const stored = localStorage.getItem('subfolio-excluded-categories')
  if (stored) {
    try {
      excludedCategories.value = new Set(JSON.parse(stored))
    } catch {
      excludedCategories.value = new Set()
    }
  }
}

const saveExcludedCategories = () => {
  localStorage.setItem('subfolio-excluded-categories', JSON.stringify([...excludedCategories.value]))
}

const toggleCategoryInclusion = (categoryName) => {
  if (excludedCategories.value.has(categoryName)) {
    excludedCategories.value.delete(categoryName)
  } else {
    excludedCategories.value.add(categoryName)
  }
  saveExcludedCategories()
}

const isCategoryIncluded = (categoryName) => !excludedCategories.value.has(categoryName)

loadExcludedCategories()

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

const globalTotals = computed(() => {
  const yearly = categoriesWithStats.value
    .filter((category) => isCategoryIncluded(category.name))
    .reduce((sum, category) => sum + category.yearly, 0)
  const activeCount = expenses.value.filter((item) =>
    item.active !== false && isCategoryIncluded(item.category)
  ).length
  const includedCategories = categoriesWithStats.value.filter((category) => isCategoryIncluded(category.name)).length

  return [
    { label: t('metrics.daily'), value: formatMoney(yearly / 365, displayedCurrency.value), severity: 'secondary' },
    { label: t('metrics.weekly'), value: formatMoney(yearly / 52, displayedCurrency.value), severity: 'secondary' },
    { label: t('metrics.biWeekly'), value: formatMoney(yearly / 26, displayedCurrency.value), severity: 'secondary' },
    { label: t('metrics.monthly'), value: formatMoney(yearly / 12, displayedCurrency.value), severity: 'info' },
    { label: t('metrics.yearly'), value: formatMoney(yearly, displayedCurrency.value), severity: 'success' },
    { label: t('metrics.categories'), value: includedCategories, severity: 'warning', detail: t('metrics.activeDetail', { count: activeCount }) }
  ]
})

onMounted(fetchExpenses)
</script>

<template>
  <div class="app-page">
    <header class="grid gap-2">
      <h1 class="font-serif text-3xl text-ink">{{ t('categories.title') }}</h1>
      <p class="muted-copy">{{ t('categories.intro') }}</p>
    </header>

    <section class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <Card v-for="item in globalTotals" :key="item.label" class="subfolio-card">
        <template #content>
          <div class="grid gap-2">
            <Tag :value="item.label" :severity="item.severity" rounded class="w-fit" />
            <p class="metric-value">{{ item.value }}</p>
            <p v-if="item.detail" class="text-sm muted-copy">{{ item.detail }}</p>
          </div>
        </template>
      </Card>
    </section>

    <Card>
      <template #title>{{ t('categories.breakdownTitle') }}</template>
      <template #subtitle>{{ t('categories.breakdownSubtitle') }}</template>
      <template #content>
        <Message v-if="categoriesWithStats.length === 0" severity="info" :closable="false">
          {{ t('categories.empty') }}
        </Message>

        <div v-else class="subfolio-table-wrap">
          <DataTable
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
                  <Tag severity="secondary" rounded>
                    <span class="pi pi-folder" />
                  </Tag>
                  <div>
                    <p class="font-semibold text-ink">{{ data.name }}</p>
                    <p class="text-sm muted-copy">
                      {{ t('categories.activeOfTotal', { active: data.activeCount, total: data.totalCount }) }}
                    </p>
                  </div>
                  <Tag
                    v-if="!isCategoryIncluded(data.name)"
                    :value="t('categories.excluded')"
                    severity="secondary"
                    rounded
                  />
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
                <Button
                  type="button"
                  :label="isCategoryIncluded(data.name) ? t('categories.included') : t('categories.excluded')"
                  :icon="isCategoryIncluded(data.name) ? 'pi pi-check-circle' : 'pi pi-circle'"
                  :severity="isCategoryIncluded(data.name) ? 'success' : 'secondary'"
                  outlined
                  size="small"
                  @click="toggleCategoryInclusion(data.name)"
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
        </div>
      </template>
    </Card>
  </div>
</template>
