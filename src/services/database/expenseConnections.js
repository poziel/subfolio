import { initializeApp, getApp, getApps } from 'firebase/app'
import { getDatabase, onValue, push, ref as firebaseRef, remove, set, update } from 'firebase/database'
import PocketBase from 'pocketbase'
import { ensurePocketBaseSchema } from './pocketbaseSchema'

const defaultExpensePath = 'subfolio/expenses'

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

  return {
    id: String(id || ''),
    name: source.name || '',
    category: source.category || 'Subscriptions',
    amount: Number(source.amount) || 0,
    currency: source.currency || 'CAD',
    url: source.url || '',
    icon: source.icon || '',
    note: source.note || '',
    includesTax: source.includesTax !== false,
    taxRate: Number(source.taxRate) || 0,
    frequency: source.frequency || 'monthly',
    customTimesPerYear: source.customTimesPerYear || null,
    startDate: source.startDate || source.dueDate || null,
    datePattern:
      typeof source.datePattern === 'string'
        ? parseJsonField(source.datePattern)
        : source.datePattern || null,
    active: source.active !== false,
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

const serializeExpenseRecord = (expense) => {
  const now = new Date().toISOString()
  return cleanRecord({
    name: expense.name,
    category: expense.category,
    amount: Number(expense.amount) || 0,
    currency: expense.currency || 'CAD',
    url: expense.url || '',
    icon: expense.icon || '',
    note: expense.note || '',
    includesTax: expense.includesTax !== false,
    taxRate: Number(expense.taxRate) || 0,
    frequency: expense.frequency || 'monthly',
    customTimesPerYear: expense.customTimesPerYear || null,
    startDate: expense.startDate || null,
    datePattern: expense.datePattern || null,
    active: expense.active !== false,
    createdAt: expense.createdAt || now,
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
    }
  }
}

const createPocketBaseExpenseConnection = (config) => {
  const client = new PocketBase(config.url)
  const collection = config.collection
  let schemaReady = false

  const ensureReady = async () => {
    if (schemaReady) return
    await ensurePocketBaseSchema(client, collection)
    schemaReady = true
  }

  const listExpenses = async () => {
    await ensureReady()
    const records = await client.collection(collection).getFullList({
      sort: '-createdAt'
    })

    return records.map(normalizeExpenseRecord)
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
      const created = await client.collection(collection).create(serializeExpenseRecord(expense))
      return normalizeExpenseRecord(created)
    },

    async update(id, expense) {
      await ensureReady()
      const updated = await client.collection(collection).update(id, serializeExpenseRecord(expense))
      return normalizeExpenseRecord(updated)
    },

    async delete(id) {
      await ensureReady()
      await client.collection(collection).delete(id)
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
