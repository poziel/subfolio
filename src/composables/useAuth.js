import { computed } from 'vue'
import { useDatabaseConnection } from './useDatabaseConnection'

const { hasConnection, saveManagedConnection, clearConnection } = useDatabaseConnection()

const isAuthenticated = computed(() => hasConnection.value)

const login = () => saveManagedConnection()

const logout = () => clearConnection()

export const useAuth = () => ({
  isAuthenticated,
  login,
  logout
})
