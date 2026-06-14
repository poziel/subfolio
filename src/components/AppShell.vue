<script setup>
import { useRoute } from 'vue-router'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import Tag from 'primevue/tag'
import { useAuth } from '../composables/useAuth'
import { useDatabaseConnection } from '../composables/useDatabaseConnection'
import { useExpenses } from '../composables/useExpenses'
import { useI18n } from '../composables/useI18n'
import ExpenseFormModal from './ExpenseFormModal.vue'
import ThemeLanguageControls from './ThemeLanguageControls.vue'

const route = useRoute()
const { logout } = useAuth()
const { providerLabel } = useDatabaseConnection()
const { openAddModal } = useExpenses()
const { t } = useI18n()

const navItems = [
  { to: '/app', labelKey: 'appNav.home', icon: 'pi pi-home' },
  { to: '/app/expenses', labelKey: 'appNav.expenses', icon: 'pi pi-table' },
  { to: '/app/categories', labelKey: 'appNav.categories', icon: 'pi pi-folder' },
  { to: '/app/recurrences', labelKey: 'appNav.recurrences', icon: 'pi pi-refresh' },
  { to: '/app/settings', labelKey: 'appNav.settings', icon: 'pi pi-cog' }
]

const isActive = (path) => route.path === path
</script>

<template>
  <div class="min-h-screen bg-[var(--p-surface-50)]">
    <header
      class="sticky top-0 z-30 grid gap-3 border-b border-[var(--p-surface-200)] bg-[var(--light-surface-2)] px-4 py-3 shadow-sm backdrop-blur lg:hidden"
    >
      <div class="flex items-center justify-between gap-3">
        <RouterLink to="/app" class="flex min-w-0 items-center gap-3">
          <span class="grid h-10 w-10 shrink-0 place-items-center">
            <img src="/images/subfolio-original.svg" alt="Subfolio logo" class="h-9 w-9 object-contain" />
          </span>
          <span class="min-w-0">
            <span class="block truncate font-semibold text-ink">Subfolio</span>
            <Tag :value="providerLabel" severity="info" rounded class="max-w-36" />
          </span>
        </RouterLink>

        <div class="flex shrink-0 items-center gap-2">
          <ThemeLanguageControls compact />
          <Button
            type="button"
            :label="t('appNav.add')"
            icon="pi pi-plus"
            size="small"
            @click="openAddModal"
          />
          <Button
            type="button"
            icon="pi pi-sign-out"
            :aria-label="t('appNav.disconnect')"
            severity="secondary"
            text
            rounded
            @click="logout"
          />
        </div>
      </div>

      <nav aria-label="Primary navigation">
        <div class="grid grid-cols-5 gap-1">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="grid min-h-12 place-items-center gap-1 rounded-lg px-1 py-1 text-center text-[0.68rem] leading-tight transition"
            :class="
              isActive(item.to)
                ? 'bg-[var(--p-primary-50)] font-semibold text-[var(--p-primary-700)]'
                : 'text-[var(--p-surface-600)]'
            "
          >
            <span :class="item.icon" class="text-base" />
            <span class="w-full truncate">{{ t(item.labelKey) }}</span>
          </RouterLink>
        </div>
      </nav>
    </header>

    <div class="lg:flex lg:min-h-screen">
      <aside class="hidden w-64 flex-col border-r border-[var(--p-surface-200)] bg-[var(--light-surface-2)] shadow-sm backdrop-blur lg:flex">
        <div class="flex items-center gap-3 px-5 py-6">
          <span class="grid h-11 w-11 place-items-center">
            <img src="/images/subfolio-original.svg" alt="Subfolio logo" class="h-10 w-10 object-contain" />
          </span>
          <div class="min-w-0">
            <p class="font-semibold text-ink">Subfolio</p>
            <Tag :value="providerLabel" severity="info" rounded />
          </div>
        </div>

        <div class="px-4 pb-3">
          <ThemeLanguageControls class="mb-3" />
          <Button
            type="button"
            :label="t('appNav.addExpense')"
            icon="pi pi-plus"
            class="w-full"
            @click="openAddModal"
          />
        </div>

        <nav class="flex-1 px-3 py-3">
          <Menu :model="navItems" class="subfolio-menu w-full">
            <template #item="{ item }">
              <RouterLink
                :to="item.to"
                class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition"
                :class="
                  isActive(item.to)
                    ? 'bg-[var(--p-primary-50)] font-semibold text-[var(--p-primary-700)]'
                    : 'text-[var(--p-surface-600)] hover:bg-[var(--p-surface-100)] hover:text-[var(--p-surface-900)]'
                "
              >
                <span :class="item.icon" />
                <span>{{ t(item.labelKey) }}</span>
              </RouterLink>
            </template>
          </Menu>
        </nav>

        <div class="border-t border-[var(--p-surface-200)] px-4 py-4">
          <Button
            type="button"
            :label="t('appNav.disconnect')"
            icon="pi pi-sign-out"
            severity="secondary"
            text
            class="w-full justify-start"
            @click="logout"
          />
        </div>
      </aside>

      <main class="min-w-0 flex-1 overflow-auto">
        <slot />
      </main>
    </div>

    <ExpenseFormModal />
  </div>
</template>
