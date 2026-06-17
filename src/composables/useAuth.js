import { computed, ref } from 'vue'
import { managedPocketBaseConfig } from '../config/pocketbase'
import { getManagedPocketBaseClient } from '../services/pocketbaseClient'
import { useDatabaseConnection } from './useDatabaseConnection'

const client = getManagedPocketBaseClient()
const { saveManagedConnection, clearConnection } = useDatabaseConnection()

const authRecord = ref(client.authStore.record ? { ...client.authStore.record } : null)
const authToken = ref(client.authStore.token)
const isRestoring = ref(false)
let restorePromise = null

const trimValue = (value) => String(value || '').trim()

const syncManagedConnection = () => {
  if (client.authStore.isValid && client.authStore.record?.verified === true) {
    saveManagedConnection()
    return
  }

  clearConnection()
}

const syncAuthState = () => {
  authToken.value = client.authStore.token
  authRecord.value = client.authStore.record ? { ...client.authStore.record } : null
  syncManagedConnection()
}

client.authStore.onChange(syncAuthState, true)

const getFieldMessages = (error) => {
  const data = error?.response?.data || error?.data?.data || {}

  return Object.values(data)
    .map((item) => item?.message)
    .filter(Boolean)
}

export const getAuthErrorMessage = (error, fallback = 'Authentication failed.') => {
  const fieldMessage = getFieldMessages(error)[0]
  return fieldMessage || error?.response?.message || error?.message || fallback
}

const authCollection = () => client.collection(managedPocketBaseConfig.authCollection)

const restoreSession = async () => {
  if (!client.authStore.isValid || !client.authStore.record) {
    client.authStore.clear()
    syncAuthState()
    return false
  }

  if (restorePromise) return restorePromise

  isRestoring.value = true
  restorePromise = authCollection()
    .authRefresh({ requestKey: 'subfolio-auth-refresh' })
    .then(({ record }) => {
      syncAuthState()
      return record?.verified === true
    })
    .catch(() => {
      client.authStore.clear()
      syncAuthState()
      return false
    })
    .finally(() => {
      isRestoring.value = false
      restorePromise = null
    })

  return restorePromise
}

const createAccount = async ({ username, email, password, passwordConfirm, name }) => {
  const normalizedUsername = trimValue(username).toLowerCase()
  const normalizedEmail = trimValue(email).toLowerCase()

  if (!normalizedUsername || !normalizedEmail || !password || !passwordConfirm) {
    throw new Error('Username, email, password, and password confirmation are required.')
  }

  const body = {
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    passwordConfirm
  }

  const displayName = trimValue(name)
  if (displayName) body.name = displayName

  await authCollection().create(body)
  await authCollection().requestVerification(normalizedEmail)

  return normalizedEmail
}

const signIn = async ({ identity, password }) => {
  const normalizedIdentity = trimValue(identity).toLowerCase()

  if (!normalizedIdentity || !password) {
    throw new Error('Username or email and password are required.')
  }

  const result = await authCollection().authWithPassword(normalizedIdentity, password, {
    requestKey: 'subfolio-auth-sign-in'
  })
  syncAuthState()
  return result.record
}

const resendVerification = async (email) => {
  const normalizedEmail = trimValue(email || authRecord.value?.email).toLowerCase()

  if (!normalizedEmail) {
    throw new Error('Enter the email address to verify.')
  }

  await authCollection().requestVerification(normalizedEmail, {
    requestKey: 'subfolio-auth-verification'
  })

  return normalizedEmail
}

const confirmVerification = async (token) => {
  const normalizedToken = trimValue(token)

  if (!normalizedToken) {
    throw new Error('Verification token is required.')
  }

  await authCollection().confirmVerification(normalizedToken, {
    requestKey: 'subfolio-auth-confirm-verification'
  })

  if (client.authStore.isValid) {
    await restoreSession()
  }

  return true
}

const logout = () => {
  client.authStore.clear()
  syncAuthState()
}

const currentUser = computed(() => authRecord.value)
const isSessionValid = computed(() => Boolean(authToken.value && client.authStore.isValid))
const isEmailVerified = computed(() => currentUser.value?.verified === true)
const needsVerification = computed(() => Boolean(isSessionValid.value && currentUser.value && !isEmailVerified.value))
const isAuthenticated = computed(() => Boolean(isSessionValid.value && isEmailVerified.value))

export const useAuth = () => ({
  client,
  currentUser,
  isSessionValid,
  isEmailVerified,
  needsVerification,
  isAuthenticated,
  isRestoring,
  createAccount,
  signIn,
  resendVerification,
  confirmVerification,
  restoreSession,
  logout
})
