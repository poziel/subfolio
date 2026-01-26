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
  <div class="grid min-h-screen place-items-center gap-6 px-6 py-12">
    <header class="w-full max-w-md">
      <RouterLink class="inline-flex items-center gap-3" to="/">
        <span
          class="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-accent to-teal-400 text-xl font-semibold text-white shadow-lg shadow-accent/25"
        >
          S
        </span>
        <div>
          <p class="text-lg font-semibold text-ink">Subfolio</p>
          <p class="text-sm text-muted">Smart subscription finance</p>
        </div>
      </RouterLink>
    </header>
    <div
      class="grid w-full max-w-md gap-5 rounded-3xl border border-border-strong bg-white p-8 shadow-card"
    >
      <div>
        <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-dark">
          Account access
        </p>
        <h1 class="mb-2 font-serif text-3xl text-ink sm:text-4xl">Welcome back.</h1>
        <p class="text-muted">
          Sign in to view your subscriptions, expenses, and forecasts. Authentication is mocked for
          now.
        </p>
      </div>
      <form class="grid gap-3" @submit.prevent="handleLogin">
        <label for="email" class="text-sm text-muted">Email</label>
        <input
          id="email"
          type="email"
          placeholder="you@poziel.com"
          required
          class="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
        />
        <label for="password" class="text-sm text-muted">Password</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          required
          class="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          class="mt-2 inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 font-semibold text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/30"
        >
          Sign in
        </button>
      </form>
      <p class="text-sm text-muted">
        New here?
        <RouterLink to="/" class="font-semibold text-accent-dark hover:underline">
          Create an account
        </RouterLink>
      </p>
    </div>
  </div>
</template>
