import { computed, ref } from 'vue'
import { useDatabaseConnection } from './useDatabaseConnection'
import { useExpenses } from './useExpenses'
import { createExpenseConnection } from '../services/database/expenseConnections'
import {
  buildEffectiveFromPaymentUpdates,
  buildManualPaymentHistoryUpdate,
  buildPaymentHistoryRecords,
  getMissingPaymentHistoryRecords,
  normalizePaymentHistoryRecord,
  sortPaymentHistoryRecords
} from '../services/paymentHistory'

const { connection } = useDatabaseConnection()

const activeExpenseId = ref('')
const historiesByExpense = ref({})
const status = ref('idle')
const statusError = ref('')
const saving = ref(false)

const localHistoryByExpense = new Map()

const getAdapter = () => {
  if (!connection.value) return null
  return createExpenseConnection(connection.value)
}

const setHistory = (expenseId, records) => {
  historiesByExpense.value = {
    ...historiesByExpense.value,
    [expenseId]: sortPaymentHistoryRecords(records)
  }
}

const createLocalId = (expenseId, scheduledDate) =>
  `local-${expenseId}-${scheduledDate}-${Math.random().toString(36).slice(2, 8)}`

const ensureLocalHistory = (expense) => {
  const expenseId = String(expense.id)
  const existing = localHistoryByExpense.get(expenseId) || []
  const merged = buildPaymentHistoryRecords(expense, existing).map((record) => ({
    ...record,
    id: record.id || createLocalId(expenseId, record.scheduledDate)
  }))

  localHistoryByExpense.set(expenseId, merged)
  return merged
}

const updateLocalRecord = (expense, nextRecord) => {
  const expenseId = String(expense.id)
  const existing = ensureLocalHistory(expense)
  const nextRecords = existing.map((record) => (
    record.id === nextRecord.id ? normalizePaymentHistoryRecord(nextRecord, expense) : record
  ))

  localHistoryByExpense.set(expenseId, nextRecords)
  setHistory(expenseId, nextRecords)
}

export function usePaymentHistory() {
  const { updateExpenseAmount } = useExpenses()

  const history = computed(() => historiesByExpense.value[activeExpenseId.value] || [])

  const clearStatusError = () => {
    statusError.value = ''
  }

  const loadPaymentHistory = async (expense) => {
    if (!expense?.id) return []

    const expenseId = String(expense.id)
    activeExpenseId.value = expenseId
    status.value = 'loading'
    clearStatusError()

    try {
      const adapter = getAdapter()

      if (!adapter?.listPaymentHistory) {
        const records = ensureLocalHistory(expense)
        setHistory(expenseId, records)
        status.value = 'ready'
        return records
      }

      const existing = await adapter.listPaymentHistory(expenseId)
      const missing = getMissingPaymentHistoryRecords(expense, existing)
      const created = missing.length
        ? await adapter.createPaymentHistoryRecords(expenseId, missing)
        : []
      const records = buildPaymentHistoryRecords(expense, [...existing, ...created])

      setHistory(expenseId, records)
      status.value = 'ready'
      return records
    } catch (error) {
      status.value = 'error'
      statusError.value = error?.message || 'Payment history is not available.'
      return []
    }
  }

  const savePaymentRecord = async (expense, record, patch) => {
    if (!expense?.id || !record) return null

    saving.value = true
    clearStatusError()
    const nextRecord = buildManualPaymentHistoryUpdate(record, patch)

    try {
      const adapter = getAdapter()

      if (adapter?.updatePaymentHistoryRecord && nextRecord.id) {
        const updated = await adapter.updatePaymentHistoryRecord(nextRecord.id, nextRecord)
        const records = history.value.map((item) => (
          item.id === updated.id ? normalizePaymentHistoryRecord(updated, expense) : item
        ))
        setHistory(String(expense.id), records)
        status.value = 'ready'
        return updated
      }

      updateLocalRecord(expense, nextRecord)
      status.value = 'ready'
      return nextRecord
    } catch (error) {
      status.value = 'error'
      statusError.value = error?.message || 'Payment history could not be saved.'
      return null
    } finally {
      saving.value = false
    }
  }

  const applyEffectiveFromPriceChange = async (expense, { effectiveDate, amount }) => {
    if (!expense?.id) return []

    saving.value = true
    clearStatusError()
    const expenseId = String(expense.id)

    try {
      const records = history.value.length
        ? history.value
        : await loadPaymentHistory(expense)
      const updates = buildEffectiveFromPaymentUpdates(records, {
        effectiveDate,
        amount,
        currency: expense.currency
      })

      await updateExpenseAmount(expenseId, amount)

      const adapter = getAdapter()

      if (adapter?.updatePaymentHistoryRecord) {
        const updatedRecords = await Promise.all(
          updates.map((record) => adapter.updatePaymentHistoryRecord(record.id, record))
        )
        const updatedById = new Map(updatedRecords.map((record) => [record.id, record]))
        const merged = records.map((record) =>
          updatedById.has(record.id)
            ? normalizePaymentHistoryRecord(updatedById.get(record.id), { ...expense, amount })
            : record
        )
        setHistory(expenseId, merged)
        status.value = 'ready'
        return updatedRecords
      }

      const updatedById = new Map(updates.map((record) => [record.id, record]))
      const merged = records.map((record) => updatedById.get(record.id) || record)
      localHistoryByExpense.set(expenseId, merged)
      setHistory(expenseId, merged)
      status.value = 'ready'
      return updates
    } catch (error) {
      status.value = 'error'
      statusError.value = error?.message || 'The effective price change could not be applied.'
      return []
    } finally {
      saving.value = false
    }
  }

  return {
    history,
    status,
    statusError,
    saving,
    activeExpenseId,
    loadPaymentHistory,
    savePaymentRecord,
    applyEffectiveFromPriceChange
  }
}
