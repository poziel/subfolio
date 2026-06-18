<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import Message from 'primevue/message'
import SelectButton from 'primevue/selectbutton'
import Tag from 'primevue/tag'
import SubfolioIconTile from '../components/icons/SubfolioIconTile.vue'
import SubfolioButton from '../components/SubfolioButton.vue'
import { useExpenses } from '../composables/useExpenses'
import { useI18n } from '../composables/useI18n'
import { usePaymentHistory } from '../composables/usePaymentHistory'
import { useSettings } from '../composables/useSettings'
import { getExpenseIcon } from '../data/serviceCatalog'
import {
  getStartedPayingDate,
  hasPaymentDateShift,
  paymentChangeTypes
} from '../services/paymentHistory'

const route = useRoute()
const router = useRouter()
const {
  expenses,
  fetchExpenses,
  getRecurrenceSummary,
  openEditModal
} = useExpenses()
const {
  history,
  status,
  statusError,
  saving,
  loadPaymentHistory,
  savePaymentRecord,
  applyEffectiveFromPriceChange
} = usePaymentHistory()
const { formatMoney } = useSettings()
const { t, locale } = useI18n()

const expenseId = computed(() => String(route.params.id || ''))
const expense = computed(() =>
  expenses.value.find((item) => String(item.id) === expenseId.value)
)
const historyRows = computed(() =>
  [...history.value].sort((a, b) => String(b.scheduledDate).localeCompare(String(a.scheduledDate)))
)
const paymentEditorOpen = ref(false)
const editingRecord = ref(null)
const editPaidDate = ref(null)
const editAmount = ref(null)
const editScope = ref('single')

const editScopeOptions = computed(() => [
  { value: 'single', label: t('expenseDetail.singlePayment') },
  { value: 'effective-from', label: t('expenseDetail.thisAndLater') }
])

const formatInputDate = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return ''
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toDateModel = (value) => {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDate = (value, options = {}) => {
  if (!value) return '-'

  const date = typeof value === 'string' ? toDateModel(value) : value
  if (!date) return '-'

  return date.toLocaleDateString(locale.value === 'fr' ? 'fr-CA' : 'en-US', {
    month: options.long ? 'long' : 'short',
    day: '2-digit',
    year: 'numeric'
  })
}

const startedPayingDate = computed(() => getStartedPayingDate(expense.value, history.value))
const totalPaidAmount = computed(() =>
  history.value.reduce((total, record) => total + (Number(record.amount) || 0), 0)
)
const totalPaid = computed(() =>
  expense.value ? formatMoney(totalPaidAmount.value, expense.value.currency, { withCode: true }) : '-'
)
const pricePointCount = computed(() => {
  const points = new Set()
  history.value.forEach((record) => {
    const amount = Number(record.amount)
    if (!Number.isFinite(amount)) return
    points.add(`${record.currency || expense.value?.currency || ''}:${amount.toFixed(2)}`)
  })

  return points.size || (expense.value ? 1 : 0)
})
const currentAmount = computed(() =>
  expense.value ? formatMoney(expense.value.amount, expense.value.currency, { withCode: true }) : '-'
)
const recurrenceSummary = computed(() =>
  expense.value ? getRecurrenceSummary(expense.value, locale.value) : ''
)
const taxRate = computed(() => Math.max(0, Number(expense.value?.taxRate) || 0))
const hasTaxColumn = computed(() => taxRate.value > 0)
const activeStatusLabel = computed(() =>
  expense.value?.active === false ? t('expenseDetail.inactive') : t('metrics.active')
)
const activeStatusSeverity = computed(() =>
  expense.value?.active === false ? 'danger' : 'success'
)

const taxAmountFor = (record) => {
  if (!taxRate.value) return 0

  const amount = Number(record?.amount) || 0
  if (!amount) return 0

  if (expense.value?.includesTax === false) {
    return amount * (taxRate.value / 100)
  }

  return amount - amount / (1 + taxRate.value / 100)
}

const formatTaxAmount = (record) => {
  const taxAmount = taxAmountFor(record)
  return taxAmount > 0
    ? formatMoney(taxAmount, record.currency || expense.value?.currency, { withCode: true })
    : '-'
}

const paymentDisplayDate = (record) => record.paidDate || record.scheduledDate

const changeTag = (record) => {
  if (record.changeType === paymentChangeTypes.effectiveFrom) {
    return { value: t('expenseDetail.effectiveFrom'), severity: 'warn' }
  }

  if (record.changeType === paymentChangeTypes.oneTime) {
    return { value: t('expenseDetail.oneTime'), severity: 'info' }
  }

  if (record.changeType === paymentChangeTypes.manual || hasPaymentDateShift(record)) {
    return { value: t('expenseDetail.manualCorrection'), severity: 'secondary' }
  }

  return { value: t('expenseDetail.scheduled'), severity: 'success' }
}

const openPaymentEditor = (record) => {
  editingRecord.value = record
  editPaidDate.value = toDateModel(record.paidDate || record.scheduledDate)
  editAmount.value = Number(record.amount) || 0
  editScope.value = 'single'
  paymentEditorOpen.value = true
}

const closePaymentEditor = () => {
  paymentEditorOpen.value = false
  editingRecord.value = null
  editPaidDate.value = null
  editAmount.value = null
  editScope.value = 'single'
}

const savePaymentEdit = async () => {
  if (!expense.value || !editingRecord.value) return

  if (editScope.value === 'effective-from') {
    const updated = await applyEffectiveFromPriceChange(expense.value, {
      effectiveDate: editingRecord.value.scheduledDate,
      amount: editAmount.value
    })

    if (updated.length) closePaymentEditor()
    return
  }

  const updated = await savePaymentRecord(expense.value, editingRecord.value, {
    paidDate: formatInputDate(editPaidDate.value),
    amount: editAmount.value
  })

  if (updated) closePaymentEditor()
}

watch(expense, async (item) => {
  if (!item) return
  await loadPaymentHistory(item)
}, { immediate: true })

onMounted(fetchExpenses)
</script>

<template>
  <header class="app-page__header">
    <div class="expense-detail-heading">
      <SubfolioIconTile
        v-if="expense && getExpenseIcon(expense)"
        :icon="getExpenseIcon(expense)"
        tone="neutral"
      />
      <span v-else-if="expense" class="subfolio-avatar">{{ expense.name.slice(0, 2).toUpperCase() }}</span>
      <div class="min-w-0">
        <h1 class="font-serif text-4xl text-ink">{{ expense?.name || t('expenseDetail.title') }}</h1>
        <div v-if="expense" class="expense-detail-meta">
          <Tag :value="expense.category" severity="secondary" rounded />
          <Tag :value="activeStatusLabel" :severity="activeStatusSeverity" rounded />
        </div>
        <p v-else class="muted-copy">{{ t('expenseDetail.intro') }}</p>
      </div>
    </div>

    <div v-if="expense" class="expense-detail-header-actions">
      <SubfolioButton
        type="button"
        icon="pi pi-pencil"
        :title="t('table.edit')"
        :aria-label="t('table.edit')"
        variant="tertiary"
        theme="secondary"
        data-test-id="expense-detail-edit"
        @click="openEditModal(expense)"
      />
      <SubfolioButton
        type="button"
        icon="pi pi-times"
        :title="t('expenseDetail.close')"
        :aria-label="t('expenseDetail.close')"
        variant="tertiary"
        theme="secondary"
        data-test-id="expense-detail-back"
        @click="router.push({ name: 'expenses' })"
      />
    </div>
  </header>

  <Message v-if="status === 'error' && statusError" severity="warn" :closable="false">
    {{ statusError }}
  </Message>

  <Message v-if="!expense && expenses.length" severity="warn" :closable="false">
    {{ t('expenseDetail.notFound') }}
  </Message>

  <template v-else-if="expense">
    <Card>
      <template #title>{{ t('expenseDetail.coreInfo') }}</template>
      <template #subtitle>{{ recurrenceSummary }}</template>
      <template #content>
        <dl class="expense-detail-facts">
          <div>
            <dt>{{ t('expenseDetail.currentPrice') }}</dt>
            <dd>{{ currentAmount }}</dd>
          </div>
          <div>
            <dt>{{ t('expenseDetail.startedPaying') }}</dt>
            <dd>{{ formatDate(startedPayingDate, { long: true }) }}</dd>
          </div>
          <div>
            <dt>{{ t('expenseDetail.historyRecords') }}</dt>
            <dd>{{ history.length }}</dd>
          </div>
          <div>
            <dt>{{ t('expenseDetail.totalPaid') }}</dt>
            <dd>{{ totalPaid }}</dd>
          </div>
          <div>
            <dt>{{ t('expenseDetail.pricePoints') }}</dt>
            <dd>{{ pricePointCount }}</dd>
          </div>
          <div v-if="expense.url">
            <dt>{{ t('expenseDetail.serviceLink') }}</dt>
            <dd>
              <a
                :href="expense.url"
                target="_blank"
                rel="noopener noreferrer"
                class="subfolio-inline-link"
                data-test-id="expense-detail-open-service"
              >
                <span>{{ expense.url }}</span>
              </a>
            </dd>
          </div>
        </dl>

        <p v-if="expense.note" class="mt-4 muted-copy">{{ expense.note }}</p>
      </template>
    </Card>

    <Card>
      <template #title>{{ t('expenseDetail.historyTitle') }}</template>
      <template #subtitle>
        {{ t('expenseDetail.historySubtitle', { date: formatDate(startedPayingDate, { long: true }) }) }}
      </template>
      <template #content>
        <Message v-if="status === 'loading'" severity="info" :closable="false">
          {{ t('expenseDetail.loadingHistory') }}
        </Message>

        <Message v-else-if="!historyRows.length" severity="info" :closable="false">
          {{ t('expenseDetail.emptyHistory') }}
        </Message>

        <DataTable
          v-else
          :value="historyRows"
          data-key="id"
          class="subfolio-datatable"
          table-style="min-width: 48rem"
        >
          <Column :header="t('expenseDetail.paidDate')" field="paidDate" sortable>
            <template #body="{ data }">
              <span class="font-extrabold text-ink">{{ formatDate(paymentDisplayDate(data)) }}</span>
            </template>
          </Column>

          <Column :header="t('expenseDetail.amountPaid')" field="amount" body-class="text-right" sortable>
            <template #body="{ data }">
              <span class="subfolio-amount">{{ formatMoney(data.amount, data.currency, { withCode: true }) }}</span>
            </template>
          </Column>

          <Column v-if="hasTaxColumn" :header="t('expenseDetail.taxAmount')" body-class="text-right">
            <template #body="{ data }">
              <span class="muted-copy">{{ formatTaxAmount(data) }}</span>
            </template>
          </Column>

          <Column :header="t('expenseDetail.currency')" field="currency" sortable>
            <template #body="{ data }">
              <Tag :value="data.currency" severity="secondary" rounded />
            </template>
          </Column>

          <Column :header="t('expenseDetail.change')" field="changeType" sortable>
            <template #body="{ data }">
              <Tag
                :value="changeTag(data).value"
                :severity="changeTag(data).severity"
                rounded
              />
            </template>
          </Column>

          <Column :header="t('table.actions')" body-class="text-right">
            <template #body="{ data }">
              <SubfolioButton
                type="button"
                icon="pi pi-pencil"
                variant="tertiary"
                theme="secondary"
                :title="t('expenseDetail.editPayment')"
                data-test-id="payment-edit"
                :data-payment-id="data.id"
                @click="openPaymentEditor(data)"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </template>

  <Dialog
    :visible="paymentEditorOpen"
    modal
    :header="t('expenseDetail.editPaymentTitle')"
    class="w-[min(94vw,32rem)]"
    @update:visible="(visible) => { if (!visible) closePaymentEditor() }"
  >
    <form v-if="editingRecord" class="expense-detail-price-form" @submit.prevent="savePaymentEdit">
      <p class="muted-copy">
        {{ t('expenseDetail.editPaymentSubtitle', { date: formatDate(editingRecord.scheduledDate, { long: true }) }) }}
      </p>

      <label class="grid gap-2" for="payment-edit-scope">
        <span class="text-sm font-extrabold text-ink">{{ t('expenseDetail.applyTo') }}</span>
        <SelectButton
          v-model="editScope"
          :options="editScopeOptions"
          option-label="label"
          option-value="value"
          data-test-id="payment-edit-scope"
        />
      </label>

      <label v-if="editScope === 'single'" class="grid gap-2" for="payment-edit-paid-date">
        <span class="text-sm font-extrabold text-ink">{{ t('expenseDetail.paidDate') }}</span>
        <DatePicker
          v-model="editPaidDate"
          input-id="payment-edit-paid-date"
          date-format="yy-mm-dd"
          show-icon
          fluid
          data-test-id="payment-edit-paid-date"
        />
      </label>

      <label class="grid gap-2" for="payment-edit-amount">
        <span class="text-sm font-extrabold text-ink">{{ t('expenseDetail.amountPaid') }}</span>
        <InputNumber
          v-model="editAmount"
          input-id="payment-edit-amount"
          mode="decimal"
          :min="0"
          :min-fraction-digits="2"
          :max-fraction-digits="2"
          fluid
          data-test-id="payment-edit-amount"
        />
      </label>

      <div class="flex flex-wrap justify-end gap-2">
        <SubfolioButton
          type="button"
          :label="t('expenseForm.cancel')"
          variant="tertiary"
          theme="secondary"
          @click="closePaymentEditor"
        />
        <SubfolioButton
          type="submit"
          icon="pi pi-check"
          :label="t('expenseDetail.savePayment')"
          :loading="saving"
          data-test-id="payment-edit-save"
        />
      </div>
    </form>
  </Dialog>
</template>
