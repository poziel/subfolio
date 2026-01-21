<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const handleLogin = () => {
  login()
  router.push('/app')
}
</script>

<template>
  <div class="auth-page">
    <header class="auth-header">
      <RouterLink class="brand" to="/">
        <span class="brand-mark">S</span>
        <div>
          <p class="brand-name">Subfolio</p>
          <p class="brand-tagline">Smart subscription finance</p>
        </div>
      </RouterLink>
    </header>
    <div class="auth-card">
      <div>
        <p class="section-eyebrow">Account access</p>
        <h1>Welcome back.</h1>
        <p class="auth-copy">
          Sign in to view your subscriptions, expenses, and forecasts. Authentication is mocked
          for now.
        </p>
      </div>
      <form class="auth-form" @submit.prevent="handleLogin">
        <label for="email">Email</label>
        <input id="email" type="email" placeholder="you@poziel.com" required />
        <label for="password">Password</label>
        <input id="password" type="password" placeholder="••••••••" required />
        <button class="primary" type="submit">Sign in</button>
      </form>
      <p class="auth-footer">
        New here?
        <RouterLink to="/">Create an account</RouterLink>
      </p>
    </div>
  </div>
</template>
