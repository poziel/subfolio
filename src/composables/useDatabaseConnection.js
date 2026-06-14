import { computed, ref } from 'vue'

const storageKey = 'subfolio-database-connection'

export const databaseProviders = [
  {
    value: 'firebase',
    label: 'Firebase Realtime Database'
  },
  {
    value: 'pocketbase',
    label: 'PocketBase'
  }
]

export const defaultFirebaseConnection = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  appId: '',
  databaseURL: '',
  path: 'subfolio/expenses'
}

export const defaultPocketBaseConnection = {
  url: '',
  collection: 'expenses'
}

const readStoredConnection = () => {
  if (typeof localStorage === 'undefined') return null

  try {
    const raw = localStorage.getItem(storageKey)
    return raw ? sanitizeConnection(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

const trimValue = (value) => String(value || '').trim()

const normalizeFirebaseConnection = (value) => {
  const firebase = {
    ...defaultFirebaseConnection,
    ...(value || {})
  }

  return {
    apiKey: trimValue(firebase.apiKey),
    authDomain: trimValue(firebase.authDomain),
    projectId: trimValue(firebase.projectId),
    appId: trimValue(firebase.appId),
    databaseURL: trimValue(firebase.databaseURL || firebase.databaseUrl),
    path: trimValue(firebase.path) || defaultFirebaseConnection.path
  }
}

const normalizePocketBaseConnection = (value) => {
  const pocketbase = {
    ...defaultPocketBaseConnection,
    ...(value || {})
  }

  return {
    url: trimValue(pocketbase.url).replace(/\/$/, ''),
    collection: trimValue(pocketbase.collection) || defaultPocketBaseConnection.collection
  }
}

const normalizeBase64Config = (base64) => {
  const withoutWhitespace = String(base64 || '').trim().replace(/\s/g, '')
  const standardBase64 = withoutWhitespace.replace(/-/g, '+').replace(/_/g, '/')
  const paddingLength = (4 - (standardBase64.length % 4)) % 4
  return `${standardBase64}${'='.repeat(paddingLength)}`
}

const parseConfigString = (configString) => {
  const normalizedBase64 = normalizeBase64Config(configString)
  const decoded = atob(normalizedBase64)
  return JSON.parse(decoded)
}

export const sanitizeConnection = (value) => {
  if (!value || typeof value !== 'object') return null

  if (value.provider === 'firebase') {
    const firebase = normalizeFirebaseConnection(value.firebase || value)

    const sanitized = {
      provider: 'firebase',
      firebase
    }

    return sanitized.firebase.apiKey && sanitized.firebase.databaseURL ? sanitized : null
  }

  if (value.provider === 'pocketbase') {
    const pocketbase = normalizePocketBaseConnection(value.pocketbase || value)

    const sanitized = {
      provider: 'pocketbase',
      pocketbase
    }

    return sanitized.pocketbase.url && sanitized.pocketbase.collection ? sanitized : null
  }

  if (value.apiKey && (value.databaseURL || value.databaseUrl)) {
    return sanitizeConnection({
      provider: 'firebase',
      firebase: value
    })
  }

  if (value.url && value.collection) {
    return sanitizeConnection({
      provider: 'pocketbase',
      pocketbase: value
    })
  }

  return null
}

const connection = ref(readStoredConnection())
const version = ref(0)

const saveConnection = (value) => {
  const sanitized = sanitizeConnection(value)

  if (!sanitized) {
    throw new Error('Database connection is incomplete.')
  }

  connection.value = sanitized
  version.value += 1

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(storageKey, JSON.stringify(sanitized))
  }
}

const applyConnectionFromBase64 = (configString) => {
  try {
    saveConnection(parseConfigString(configString))
    return true
  } catch {
    return false
  }
}

const clearConnection = () => {
  connection.value = null
  version.value += 1

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(storageKey)
  }
}

const hasConnection = computed(() => Boolean(connection.value))

const providerLabel = computed(() => {
  const provider = databaseProviders.find((item) => item.value === connection.value?.provider)
  return provider?.label || 'Demo data'
})

export const useDatabaseConnection = () => ({
  connection,
  connectionVersion: version,
  hasConnection,
  providerLabel,
  saveConnection,
  applyConnectionFromBase64,
  clearConnection
})
