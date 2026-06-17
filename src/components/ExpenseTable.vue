<script setup>
import { computed } from 'vue'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Tag from 'primevue/tag'
import { getExpenseIcon } from '../data/serviceCatalog'
import { useExpenses } from '../composables/useExpenses'
import { useI18n } from '../composables/useI18n'
import { useSettings } from '../composables/useSettings'
import SubfolioIconTile from './icons/SubfolioIconTile.vue'
import SubfolioButton from './SubfolioButton.vue'

const props = defineProps({
  expenses: {
    type: Array,
    default: () => []
  },
  showCategory: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: true
  },
  emptyMessage: {
    type: String,
    default: 'No expenses yet.'
  },
  showPagination: {
    type: Boolean,
    default: false
  }
})

const {
  openEditModal,
  deleteExpense,
  toggleExpenseActive,
  getRecurrenceSummary,
  getNextOccurrence
} = useExpenses()

const { formatMoney, getConversionTooltip, convertToDisplayed, displayedCurrency } = useSettings()
const { t, locale } = useI18n()

const paginatorEnabled = computed(() => props.showPagination && props.expenses.length > 10)

const formatFrequency = (expense) => getRecurrenceSummary(expense, locale.value)

const formatDate = (value) => {
  if (!value) return '-'
  const options = {
    month: 'short',
    day: '2-digit'
  }

  return new Date(value).toLocaleDateString(locale.value === 'fr' ? 'fr-CA' : 'en-US', options)
}

const nextOccurrence = (expense) => {
  const next = getNextOccurrence(expense)
  return next ? formatDate(next) : '-'
}

const displayedAmount = (expense) =>
  formatMoney(convertToDisplayed(expense.amount, expense.currency), displayedCurrency.value)

const originalAmount = (expense) =>
  formatMoney(expense.amount, expense.currency, { withCode: true })

const rowClass = (item) => (item.active === false ? 'opacity-60' : '')

const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
</script>

<template>
  <div class="subfolio-table-wrap">
    <DataTable
      :value="expenses"
      data-key="id"
      class="subfolio-datatable"
      :row-class="rowClass"
      :paginator="paginatorEnabled"
      :rows="10"
      :rows-per-page-options="[5, 10, 20]"
      striped-rows
      table-style="min-width: 58rem"
    >
      <template #empty>
        <div class="py-10 text-center muted-copy">
          {{ emptyMessage }}
        </div>
      </template>

      <Column field="name" :header="t('table.expense')" sortable>
        <template #body="{ data }">
          <div class="flex items-center gap-3">
            <SubfolioIconTile
              v-if="getExpenseIcon(data)"
              :icon="getExpenseIcon(data)"
              size="sm"
              tone="neutral"
            />
            <span v-else class="subfolio-avatar">{{ initials(data.name) }}</span>
            <span class="min-w-0">
              <a
                v-if="data.url"
                :href="data.url"
                target="_blank"
                rel="noopener noreferrer"
                class="subfolio-expense-link"
                @click.stop
              >
                {{ data.name }}
              </a>
              <span v-else class="block truncate font-extrabold text-ink">{{ data.name }}</span>
              <span class="block text-xs muted-copy">{{ originalAmount(data) }}</span>
              <span v-if="data.note" class="subfolio-expense-note">{{ data.note }}</span>
            </span>
          </div>
        </template>
      </Column>

      <Column v-if="showCategory" field="category" :header="t('table.category')" sortable>
        <template #body="{ data }">
          <Tag :value="data.category" severity="secondary" rounded />
        </template>
      </Column>

      <Column :header="t('table.frequency')" sortable sort-field="recurrenceSummary">
        <template #body="{ data }">
          {{ formatFrequency(data) }}
        </template>
      </Column>

      <Column :header="t('table.nextDue')">
        <template #body="{ data }">
          <span class="muted-copy">{{ nextOccurrence(data) }}</span>
        </template>
      </Column>

      <Column :header="t('table.amount')" body-class="text-right">
        <template #body="{ data }">
          <span
            class="subfolio-amount"
            :title="getConversionTooltip(data.amount, data.currency)"
          >
            {{ displayedAmount(data) }}
          </span>
          <span
            class="ml-1 text-xs muted-copy"
            :title="getConversionTooltip(data.amount, data.currency)"
          >
            {{ displayedCurrency }}
          </span>
          <Tag
            v-if="!data.includesTax && data.taxRate"
            :value="t('table.tax')"
            severity="info"
            rounded
            class="ml-2"
          />
        </template>
      </Column>

      <Column v-if="showActions" :header="t('table.actions')" body-class="text-right">
        <template #body="{ data }">
          <div class="flex justify-end gap-1">
            <SubfolioButton
              type="button"
              :icon="data.active !== false ? 'pi pi-power-off' : 'pi pi-play'"
              variant="tertiary"
              :theme="data.active !== false ? 'success' : 'secondary'"
              :title="data.active !== false ? t('table.deactivate') : t('table.activate')"
              @click="toggleExpenseActive(data.id)"
            />
            <SubfolioButton
              type="button"
              icon="pi pi-pencil"
              variant="tertiary"
              theme="secondary"
              :title="t('table.edit')"
              @click="openEditModal(data)"
            />
            <SubfolioButton
              type="button"
              icon="pi pi-trash"
              variant="tertiary"
              theme="danger"
              :title="t('table.delete')"
              @click="deleteExpense(data.id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
