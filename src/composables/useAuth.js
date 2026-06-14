import { computed } from 'vue'
import { useDatabaseConnection } from './useDatabaseConnection'

const { hasConnection, saveConnection, clearConnection } = useDatabaseConnection()

const isAuthenticated = computed(() => hasConnection.value)

const login = (connection) => saveConnection(connection)

const logout = () => clearConnection()

export const useAuth = () => ({
  isAuthenticated,
  login,
  logout
})
