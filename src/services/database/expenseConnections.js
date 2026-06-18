import { initializeApp, getApp, getApps } from 'firebase/app'
import { getDatabase, onValue, push, ref as firebaseRef, remove, set, update } from 'firebase/database'
import PocketBase from 'pocketbase'
import { normalizeRecurrenceSchedule } from '../../data/recurrenceRules'
import { normalizePaymentHistoryRecord } from '../paymentHistory'
import { getManagedPocketBaseClient, isManagedPocketBaseConnection } from '../pocketbaseClient'
import { ensurePocketBaseSchema } from './pocketbaseSchema'

const defaultExpensePath = 'subfolio/expenses'
const defaultCategoryCollection = 'categories'
const defaultPaymentHistoryCollection = 'expensePaymentHistory'

const cleanPath = (value) =>
  String(value || defaultExpensePath)
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
    .join('/')

const cleanRecord = (record) =>
  JSON.parse(
    JSON.stringify(record, (_key, value) => (value === undefined ? null : value))
  )

const cleanPartialRecord = (record) =>
  Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined)
  )

export const normalizeExpenseRecord = (record) => {
  const source = record || {}
  const id = source.id || source.key
  const datePattern =
    typeof source.datePattern === 'string'
      ? parseJsonField(source.datePattern)
      : source.datePattern || null
  const recurrenceSchedule =
    typeof source.recurrenceSchedule === 'string'
      ? parseJsonField(source.recurrenceSchedule)
      : source.recurrenceSchedule || null
  const normalizedSchedule = normalizeRecurrenceSchedule(recurrenceSchedule, {
    scheduleType: source.scheduleType,
    paymentDate: source.paymentDate || source.startDate || source.dueDate || null,
    repeatInterval: source.repeatInterval,
    repeatUnit: source.repeatUnit,
    repeatPattern: source.repeatPattern,
    frequency: source.frequency,
    customTimesPerYear: source.customTimesPerYear,
    startDate: source.startDate || source.dueDate || null,
    startTime: source.startTime || null,
    paymentTimezone: source.paymentTimezone || source.timezone || null,
    datePattern
  })
  const normalizedScheduleType = source.scheduleType || normalizedSchedule.scheduleType || 'recurring'

  return {
    id: String(id || ''),
    user: source.user || '',
    name: source.name || '',
    presetId: source.presetId || null,
    categoryId: source.categoryId || null,
    category: source.category || 'Subscriptions',
    amount: Number(source.amount) || 0,
    currency: source.currency || 'CAD',
    url: source.url || '',
    icon: source.icon || '',
    note: source.note || '',
    includesTax: source.includesTax !== false,
    taxRateId: source.taxRateId || null,
    taxRate: Number(source.taxRate) || 0,
    scheduleType: normalizedScheduleType,
    paymentDate: source.paymentDate || normalizedSchedule.paymentDate || source.startDate || source.dueDate || null,
    repeatInterval: normalizedScheduleType === 'one-time'
      ? null
      : Number(source.repeatInterval) || normalizedSchedule.repeat?.interval || normalizedSchedule.repeatInterval || 1,
    repeatUnit: normalizedScheduleType === 'one-time'
      ? null
      : source.repeatUnit || normalizedSchedule.repeat?.unit || normalizedSchedule.repeatUnit || 'month',
    repeatPattern: normalizedScheduleType === 'one-time'
      ? null
      : source.repeatPattern || normalizedSchedule.repeatPattern || null,
    recurrenceSummary: source.recurrenceSummary || normalizedSchedule.summary || '',
    frequency: source.frequency || 'monthly',
    customTimesPerYear: source.customTimesPerYear || null,
    startDate: source.startDate || source.dueDate || normalizedSchedule.paymentDate || null,
    startTime: source.startTime || null,
    paymentTimezone: source.paymentTimezone || source.timezone || normalizedSchedule.timezone,
    datePattern,
    recurrenceSchedule: normalizedSchedule,
    active: source.active !== false,
    createdAt: source.createdAt || null,
    updatedAt: source.updatedAt || null
  }
}

export const normalizeCategoryRecord = (record) => {
  const source = record || {}
  return {
    id: String(source.id || source.key || ''),
    user: source.user || '',
    name: source.name || source.category || '',
    normalizedName: source.normalizedName || normalizeCategoryName(source.name || source.category || ''),
    createdAt: source.createdAt || null,
    updatedAt: source.updatedAt || null
  }
}

const parseJsonField = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const serializeExpenseRecord = (expense, options = {}) => {
  const now = new Date().toISOString()
  const scheduleType = expense.scheduleType || expense.recurrenceSchedule?.scheduleType || 'recurring'
  return cleanRecord({
    user: options.userId || expense.user || undefined,
    name: expense.name,
    presetId: expense.presetId || null,
    categoryId: expense.categoryId || null,
    category: expense.category,
    amount: Number(expense.amount) || 0,
    currency: expense.currency || 'CAD',
    url: expense.url || '',
    icon: expense.icon || '',
    note: expense.note || '',
    includesTax: expense.includesTax !== false,
    taxRateId: expense.taxRateId || null,
    taxRate: Number(expense.taxRate) || 0,
    scheduleType,
    paymentDate: expense.paymentDate || expense.startDate || null,
    repeatInterval: scheduleType === 'one-time' ? null : Number(expense.repeatInterval) || null,
    repeatUnit: scheduleType === 'one-time' ? null : expense.repeatUnit || null,
    repeatPattern: scheduleType === 'one-time' ? null : expense.repeatPattern || null,
    recurrenceSummary: expense.recurrenceSummary || expense.recurrenceSchedule?.summary || '',
    frequency: expense.frequency || 'monthly',
    customTimesPerYear: expense.customTimesPerYear || null,
    startDate: expense.startDate || null,
    startTime: expense.startTime || null,
    paymentTimezone: expense.paymentTimezone || null,
    datePattern: expense.datePattern || null,
    recurrenceSchedule: expense.recurrenceSchedule || null,
    active: expense.active !== false,
    createdAt: expense.createdAt || now,
    updatedAt: now
  })
}

const normalizeCategoryName = (value) => String(value || '').trim().toLowerCase()

const serializeCategoryRecord = (name, userId, existing = {}) => {
  const now = new Date().toISOString()
  const trimmedName = String(name || '').trim()

  return cleanRecord({
    user: userId,
    name: trimmedName,
    normalizedName: normalizeCategoryName(trimmedName),
    createdAt: existing.createdAt || now,
    updatedAt: now
  })
}

const serializePaymentHistoryRecord = (record, options = {}) => {
  const now = new Date().toISOString()

  return cleanRecord({
    user: options.userId || record.user || undefined,
    expense: options.expenseId || record.expense || record.expenseId || undefined,
    scheduledDate: record.scheduledDate,
    paidDate: record.paidDate || null,
    amount: Number(record.amount) || 0,
    currency: record.currency || 'CAD',
    status: record.status || 'paid',
    source: record.source || 'generated',
    changeType: record.changeType || 'standard',
    details: record.details || null,
    createdAt: record.createdAt || now,
    updatedAt: now
  })
}

const serializePaymentHistoryPatch = (record) => {
  const now = new Date().toISOString()

  return cleanPartialRecord({
    scheduledDate: record.scheduledDate,
    paidDate: record.paidDate || null,
    amount: Number(record.amount) || 0,
    currency: record.currency || 'CAD',
    status: record.status || 'paid',
    source: record.source || 'manual',
    changeType: record.changeType || 'manual',
    details: record.details || null,
    updatedAt: now
  })
}

const sortExpenses = (items) =>
  [...items].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return bTime - aTime
  })

const firebaseAppName = (config) => `subfolio-${btoa(config.databaseURL).replace(/[^a-z0-9]/gi, '')}`

const getFirebaseApp = (config) => {
  const name = firebaseAppName(config)
  const existing = getApps().find((app) => app.name === name)

  if (existing) return getApp(name)

  return initializeApp(
    {
      apiKey: config.apiKey,
      authDomain: config.authDomain || undefined,
      projectId: config.projectId || undefined,
      appId: config.appId || undefined,
      databaseURL: config.databaseURL
    },
    name
  )
}

const createFirebaseExpenseConnection = (config) => {
  const app = getFirebaseApp(config)
  const database = getDatabase(app)
  const path = cleanPath(config.path)
  const collectionRef = firebaseRef(database, path)

  return {
    async subscribe(onChange, onError) {
      return onValue(
        collectionRef,
        (snapshot) => {
          const value = snapshot.val() || {}
          const items = Object.entries(value).map(([id, record]) =>
            normalizeExpenseRecord({ id, ...record })
          )
          onChange(sortExpenses(items))
        },
        onError
      )
    },

    async create(expense) {
      const itemRef = push(collectionRef)
      const record = serializeExpenseRecord(expense)
      await set(itemRef, record)
      return normalizeExpenseRecord({ id: itemRef.key, ...record })
    },

    async update(id, expense) {
      const record = serializeExpenseRecord(expense)
      await update(firebaseRef(database, `${path}/${id}`), record)
      return normalizeExpenseRecord({ id, ...record })
    },

    async delete(id) {
      await remove(firebaseRef(database, `${path}/${id}`))
    },

    async listCategories() {
      return []
    },

    async ensureCategory(name) {
      return { id: null, name }
    }
  }
}

const createPocketBaseExpenseConnection = (config) => {
  const client = isManagedPocketBaseConnection(config)
    ? getManagedPocketBaseClient()
    : new PocketBase(config.url)
  const collection = config.collection
  const categoryCollection = config.categoryCollection || defaultCategoryCollection
  const paymentHistoryCollection = config.paymentHistoryCollection || defaultPaymentHistoryCollection
  let schemaReady = false

  const getAuthUserId = () => client.authStore.record?.id || ''

  const serializePocketBaseExpense = (expense) => {
    const userId = getAuthUserId()

    if (!userId) {
      throw new Error('Sign in before changing PocketBase expenses.')
    }

    return serializeExpenseRecord(expense, { userId })
  }

  const ensureReady = async () => {
    if (schemaReady) return
    await ensurePocketBaseSchema(client, collection, categoryCollection, paymentHistoryCollection)
    schemaReady = true
  }

  const listExpenses = async () => {
    await ensureReady()
    const records = await client.collection(collection).getFullList({
      sort: '-createdAt'
    })

    return records.map(normalizeExpenseRecord)
  }

  const listCategories = async () => {
    await ensureReady()
    const records = await client.collection(categoryCollection).getFullList({
      sort: 'name'
    })

    return records.map(normalizeCategoryRecord)
  }

  const getCategoryByName = async (name) => {
    const userId = getAuthUserId()
    const normalizedName = normalizeCategoryName(name)

    if (!userId || !normalizedName) return null

    try {
      const filter = client.filter('user = {:userId} && normalizedName = {:normalizedName}', {
        userId,
        normalizedName
      })
      const record = await client.collection(categoryCollection).getFirstListItem(filter, {
        requestKey: null
      })
      return normalizeCategoryRecord(record)
    } catch (error) {
      if (error?.status === 404) return null
      throw error
    }
  }

  const listPaymentHistory = async (expenseId) => {
    await ensureReady()

    const userId = getAuthUserId()
    if (!userId) {
      throw new Error('Sign in before reading payment history.')
    }

    const filter = client.filter('user = {:userId} && expense = {:expenseId}', {
      userId,
      expenseId
    })
    const records = await client.collection(paymentHistoryCollection).getFullList({
      filter,
      sort: 'scheduledDate',
      requestKey: null
    })

    return records.map(normalizePaymentHistoryRecord)
  }

  return {
    async subscribe(onChange, onError) {
      let disposed = false
      let unsubscribe = null

      const refresh = async () => {
        try {
          const items = await listExpenses()
          if (!disposed) onChange(items)
        } catch (error) {
          if (!disposed && onError) onError(error)
        }
      }

      await refresh()
      unsubscribe = await client.collection(collection).subscribe('*', refresh)

      return () => {
        disposed = true
        if (unsubscribe) unsubscribe()
      }
    },

    async create(expense) {
      await ensureReady()
      const created = await client.collection(collection).create(serializePocketBaseExpense(expense))
      return normalizeExpenseRecord(created)
    },

    async update(id, expense) {
      await ensureReady()
      const updated = await client.collection(collection).update(id, serializePocketBaseExpense(expense))
      return normalizeExpenseRecord(updated)
    },

    async delete(id) {
      await ensureReady()
      await client.collection(collection).delete(id)
    },

    async listCategories() {
      return listCategories()
    },

    async ensureCategory(name) {
      await ensureReady()

      const userId = getAuthUserId()
      if (!userId) {
        throw new Error('Sign in before changing PocketBase categories.')
      }

      const existing = await getCategoryByName(name)
      if (existing) return existing

      const created = await client.collection(categoryCollection).create(serializeCategoryRecord(name, userId))
      return normalizeCategoryRecord(created)
    },

    async listPaymentHistory(expenseId) {
      return listPaymentHistory(expenseId)
    },

    async createPaymentHistoryRecords(expenseId, records) {
      await ensureReady()

      const userId = getAuthUserId()
      if (!userId) {
        throw new Error('Sign in before creating payment history.')
      }

      const created = []
      for (const record of records) {
        const saved = await client.collection(paymentHistoryCollection).create(
          serializePaymentHistoryRecord(record, { userId, expenseId })
        )
        created.push(normalizePaymentHistoryRecord(saved))
      }

      return created
    },

    async updatePaymentHistoryRecord(id, record) {
      await ensureReady()

      const updated = await client.collection(paymentHistoryCollection).update(
        id,
        serializePaymentHistoryPatch(record)
      )

      return normalizePaymentHistoryRecord(updated)
    }
  }
}

export const createExpenseConnection = (connection) => {
  if (connection?.provider === 'firebase') {
    return createFirebaseExpenseConnection(connection.firebase)
  }

  if (connection?.provider === 'pocketbase') {
    return createPocketBaseExpenseConnection(connection.pocketbase)
  }

  return null
}
