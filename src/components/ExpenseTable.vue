<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Menu from 'primevue/menu'
import Tag from 'primevue/tag'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
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
  getNextOccurrence
} = useExpenses()

const { formatMoney, getConversionTooltip, convertToDisplayed, displayedCurrency } = useSettings()
const { t, locale } = useI18n()
const router = useRouter()
const confirm = useConfirm()
const toast = useToast()
const actionMenus = ref({})
const menuPassThrough = {
  root: {
    onClick: (event) => event.stopPropagation()
  }
}

const paginatorEnabled = computed(() => props.showPagination && props.expenses.length > 10)

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

const rowClass = (item) => [
  'subfolio-expense-row',
  item.active === false ? 'opacity-60' : ''
].filter(Boolean).join(' ')

const expenseDetailRoute = (expense) => ({
  name: 'expense-detail',
  params: { id: expense.id }
})

const openExpenseDetail = (event) => {
  const id = event?.data?.id
  if (!id) return
  router.push({ name: 'expense-detail', params: { id } })
}

const setActionMenuRef = (id, menu) => {
  if (!id || !menu) return
  actionMenus.value[String(id)] = menu
}

const toggleActionMenu = (event, id) => {
  event.stopPropagation()
  actionMenus.value[String(id)]?.toggle(event)
}

const confirmDeleteExpense = (expense, event) => {
  confirm.require({
    target: event?.currentTarget,
    header: t('confirm.deleteExpenseTitle'),
    message: t('confirm.deleteExpenseMessage', { name: expense.name }),
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: t('confirm.keepExpense'),
    acceptLabel: t('confirm.deleteExpense'),
    rejectProps: {
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      severity: 'danger',
      icon: 'pi pi-trash'
    },
    defaultFocus: 'reject',
    accept: async () => {
      const deleted = await deleteExpense(expense.id)
      if (!deleted) return

      toast.add({
        severity: 'success',
        summary: t('toast.expenseDeleted'),
        detail: t('toast.expenseDeletedDetail', { name: deleted.name }),
        life: 3500
      })
    }
  })
}

const rowActionItems = (expense) => [
  expense.url
    ? {
        key: 'open',
        label: t('table.openUrl'),
        icon: 'pi pi-external-link',
        url: expense.url,
        target: '_blank'
      }
    : null,
  {
    key: 'edit',
    label: t('table.edit'),
    icon: 'pi pi-pencil',
    command: () => openEditModal(expense)
  },
  {
    key: 'delete',
    label: t('table.delete'),
    icon: 'pi pi-trash',
    danger: true,
    command: ({ originalEvent }) => confirmDeleteExpense(expense, originalEvent)
  }
].filter(Boolean)

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
  <DataTable
    :value="expenses"
    data-key="id"
    class="subfolio-datatable"
    :row-class="rowClass"
    :paginator="paginatorEnabled"
    :rows="10"
    :rows-per-page-options="[5, 10, 20]"
    striped-rows
    table-style="min-width: 48rem"
    @row-click="openExpenseDetail"
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
            <RouterLink
              :to="expenseDetailRoute(data)"
              class="subfolio-expense-link"
              data-test-id="expense-detail-link"
              :data-expense-id="data.id"
              @click.stop
            >
              {{ data.name }}
            </RouterLink>
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

    <Column :header="t('table.nextDue')">
      <template #body="{ data }">
        <span class="muted-copy">{{ nextOccurrence(data) }}</span>
      </template>
    </Column>

    <Column :header="t('table.amount')" body-class="text-right">
      <template #body="{ data }">
        <span class="subfolio-amount-line">
          <span
            class="subfolio-amount"
            :title="getConversionTooltip(data.amount, data.currency)"
          >
            {{ displayedAmount(data) }}
          </span>
          <span
            class="text-xs muted-copy"
            :title="getConversionTooltip(data.amount, data.currency)"
          >
            {{ displayedCurrency }}
          </span>
        </span>
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
            data-test-id="expense-toggle-active"
            :data-expense-id="data.id"
            @click.stop="toggleExpenseActive(data.id)"
          />
          <SubfolioButton
            type="button"
            icon="pi pi-ellipsis-v"
            variant="tertiary"
            theme="secondary"
            :title="t('table.moreActions')"
            :aria-label="t('table.moreActions')"
            aria-haspopup="true"
            data-test-id="expense-more-actions"
            :data-expense-id="data.id"
            @click.stop="toggleActionMenu($event, data.id)"
          />
          <Menu
            :ref="(menu) => setActionMenuRef(data.id, menu)"
            :model="rowActionItems(data)"
            :pt="menuPassThrough"
            popup
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>
