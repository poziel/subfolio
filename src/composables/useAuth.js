import { ref } from 'vue'

const storedAuth = localStorage.getItem('subfolio-auth') === 'true'
const isAuthenticated = ref(storedAuth)

const login = () => {
  isAuthenticated.value = true
  localStorage.setItem('subfolio-auth', 'true')
}

const logout = () => {
  isAuthenticated.value = false
  localStorage.setItem('subfolio-auth', 'false')
}

export const useAuth = () => ({
  isAuthenticated,
  login,
  logout
})
