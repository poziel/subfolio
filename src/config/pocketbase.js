const trimEnv = (value) => String(value || '').trim()
const trimTrailingSlash = (value) => trimEnv(value).replace(/\/+$/, '')

export const managedPocketBaseConfig = Object.freeze({
  url: trimTrailingSlash(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090'),
  collection: trimEnv(import.meta.env.VITE_POCKETBASE_EXPENSES_COLLECTION) || 'expenses'
})

export const createManagedPocketBaseConnection = () => ({
  provider: 'pocketbase',
  pocketbase: {
    url: managedPocketBaseConfig.url,
    collection: managedPocketBaseConfig.collection
  }
})
