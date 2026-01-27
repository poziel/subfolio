<script setup>
import { useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useExpenses } from '../composables/useExpenses'
import ExpenseFormModal from './ExpenseFormModal.vue'

const route = useRoute()
const { logout } = useAuth()
const { openAddModal } = useExpenses()

const navItems = [
  { to: '/app', label: 'Tracker', icon: 'grid' },
  { to: '/app/categories', label: 'Categories', icon: 'folder' },
  { to: '/app/recurrences', label: 'Recurrences', icon: 'repeat' },
  { to: '/app/forecast', label: 'Forecast', icon: 'trending-up' },
  { to: '/app/settings', label: 'Settings', icon: 'settings' }
]

const isActive = (path) => route.path === path
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside class="flex w-56 flex-col border-r border-border bg-white/80 backdrop-blur-sm">
      <!-- Brand -->
      <div class="flex items-center gap-3 px-5 py-6">
        <span class="grid h-10 w-10 place-items-center rounded-xl bg-surface-muted shadow-sm">
          <img src="/logo.png" alt="Subfolio logo" class="h-8 w-8 object-contain" />
        </span>
        <div>
          <p class="font-semibold text-ink">Subfolio</p>
          <p class="text-xs text-muted">Finance tracker</p>
        </div>
      </div>

      <!-- Add Expense Button -->
      <div class="px-3 pb-2">
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-accent/20 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/25"
          @click="openAddModal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Add Expense
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex flex-1 flex-col gap-1 px-3 py-4">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition"
          :class="
            isActive(item.to)
              ? 'bg-accent/10 font-medium text-accent-dark'
              : 'text-muted hover:bg-surface-muted hover:text-ink'
          "
        >
          <span class="flex h-5 w-5 items-center justify-center text-xs">
            <template v-if="item.icon === 'grid'">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
            </template>
            <template v-else-if="item.icon === 'folder'">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
            </template>
            <template v-else-if="item.icon === 'repeat'">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></svg>
            </template>
            <template v-else-if="item.icon === 'trending-up'">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
            </template>
            <template v-else-if="item.icon === 'settings'">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
            </template>
          </span>
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- User section -->
      <div class="border-t border-border px-3 py-4">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition hover:bg-surface-muted hover:text-ink"
          @click="logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
          Sign out
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-auto">
      <slot />
    </main>

    <!-- Expense Form Modal -->
    <ExpenseFormModal />
  </div>
</template>
