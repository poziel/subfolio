import { initializeApp, getApp, getApps } from 'firebase/app'
import { getDatabase, onValue, push, ref as firebaseRef, remove, set, update } from 'firebase/database'
import PocketBase from 'pocketbase'
import { normalizeRecurrenceSchedule } from '../../data/recurrenceRules'
import { getManagedPocketBaseClient, isManagedPocketBaseConnection } from '../pocketbaseClient'
import { ensurePocketBaseSchema } from './pocketbaseSchema'

const defaultExpensePath = 'subfolio/expenses'
const defaultCategoryCollection = 'categories'

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
    frequency: source.frequency,
    customTimesPerYear: source.customTimesPerYear,
    startDate: source.startDate || source.dueDate || null,
    startTime: source.startTime || null,
    paymentTimezone: source.paymentTimezone || source.timezone || null,
    datePattern
  })

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
    frequency: source.frequency || 'monthly',
    customTimesPerYear: source.customTimesPerYear || null,
    startDate: source.startDate || source.dueDate || null,
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
    await ensurePocketBaseSchema(client, collection, categoryCollection)
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
