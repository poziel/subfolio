<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Tag from 'primevue/tag'
import { useExpenses } from '../composables/useExpenses'
import { useI18n } from '../composables/useI18n'
import { useSettings } from '../composables/useSettings'

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
  frequencyOptions,
  getNextOccurrence
} = useExpenses()

const { formatMoney, getConversionTooltip } = useSettings()
const { t, locale } = useI18n()

const paginatorEnabled = computed(() => props.showPagination && props.expenses.length > 10)

const formatFrequency = (expense) => {
  if (expense.frequency === 'custom') {
    return t('frequencies.timesPerYear', { count: expense.customTimesPerYear })
  }

  const freq = frequencyOptions.find((f) => f.value === expense.frequency)
  return freq ? t(`frequencies.${freq.value}`) : expense.frequency
}

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString(locale.value === 'fr' ? 'fr-CA' : 'en-US', {
    month: 'short',
    day: '2-digit'
  })
}

const nextOccurrence = (expense) => {
  const next = getNextOccurrence(expense)
  return next ? formatDate(next) : '-'
}

const rowClass = (item) => (item.active === false ? 'opacity-60' : '')
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
          <div class="flex items-center gap-2">
            <span class="font-semibold text-ink">{{ data.name }}</span>
            <Button
              v-if="data.url"
              as="a"
              :href="data.url"
              target="_blank"
              rel="noopener noreferrer"
              icon="pi pi-external-link"
              text
              rounded
              size="small"
              severity="secondary"
              :title="t('table.openService')"
              @click.stop
            />
          </div>
        </template>
      </Column>

      <Column v-if="showCategory" field="category" :header="t('table.category')" sortable>
        <template #body="{ data }">
          <Tag :value="data.category" severity="secondary" rounded />
        </template>
      </Column>

      <Column :header="t('table.frequency')" sortable sort-field="frequency">
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
            class="font-semibold text-accent-dark"
            :title="getConversionTooltip(data.amount, data.currency)"
          >
            {{ formatMoney(data.amount, data.currency) }}
          </span>
          <span
            class="ml-1 text-xs muted-copy"
            :title="getConversionTooltip(data.amount, data.currency)"
          >
            {{ data.currency }}
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
            <Button
              type="button"
              :icon="data.active !== false ? 'pi pi-power-off' : 'pi pi-play'"
              rounded
              text
              :severity="data.active !== false ? 'success' : 'secondary'"
              :title="data.active !== false ? t('table.deactivate') : t('table.activate')"
              @click="toggleExpenseActive(data.id)"
            />
            <Button
              type="button"
              icon="pi pi-pencil"
              rounded
              text
              severity="secondary"
              :title="t('table.edit')"
              @click="openEditModal(data)"
            />
            <Button
              type="button"
              icon="pi pi-trash"
              rounded
              text
              severity="danger"
              :title="t('table.delete')"
              @click="deleteExpense(data.id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
