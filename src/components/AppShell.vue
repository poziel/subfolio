<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Menu from 'primevue/menu'
import { useAuth } from '../composables/useAuth'
import { useExpenses } from '../composables/useExpenses'
import { useI18n } from '../composables/useI18n'
import { useSettings } from '../composables/useSettings'
import { useTheme } from '../composables/useTheme'
import ExpenseFormModal from './ExpenseFormModal.vue'
import SubfolioButton from './SubfolioButton.vue'
import ThemeLanguageControls from './ThemeLanguageControls.vue'

const route = useRoute()
const router = useRouter()
const { currentUser, logout } = useAuth()
const { openAddModal } = useExpenses()
const { t } = useI18n()
const { contentLayoutMode } = useSettings()
const { activeTheme } = useTheme()
const sidebarStorageKey = 'subfolio-sidebar-collapsed'
const readSidebarCollapsed = () => {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(sidebarStorageKey) === 'true'
}
const sidebarCollapsed = ref(readSidebarCollapsed())
const profileMenu = ref()
const profileMenuOpen = ref(false)

const navItems = [
  { to: '/app', labelKey: 'appNav.home', icon: 'pi pi-home' },
  { to: '/app/dashboard', labelKey: 'appNav.dashboard', icon: 'pi pi-chart-pie' },
  { to: '/app/expenses', labelKey: 'appNav.expenses', icon: 'pi pi-table' },
  { to: '/app/categories', labelKey: 'appNav.categories', icon: 'pi pi-folder' },
  { to: '/app/settings', labelKey: 'appNav.settings', icon: 'pi pi-cog' }
]

const isActive = (path) => (
  route.path === path ||
  (path !== '/app' && route.path.startsWith(`${path}/`))
)
const wordmarkSrc = computed(() =>
  activeTheme.value === 'dark'
    ? '/images/subfolio-light-name.svg'
    : '/images/subfolio-dark-name.svg'
)
const mainClass = computed(() => ({
  'app-shell__main--layout-fluid': contentLayoutMode.value === 'fluid',
  'app-shell__main--layout-focused': contentLayoutMode.value === 'focused'
}))
const accountLabel = computed(() =>
  currentUser.value?.name ||
  currentUser.value?.username ||
  currentUser.value?.email ||
  t('appNav.profile')
)
const profileMenuItems = computed(() => [
  { key: 'theme', label: t('appNav.changeTheme'), type: 'theme' },
  { key: 'language', label: t('appNav.changeLanguage'), type: 'language' },
  { separator: true },
  {
    key: 'disconnect',
    label: t('appNav.disconnect'),
    icon: 'pi pi-sign-out',
    command: () => handleLogout()
  }
])

const handleLogout = async () => {
  logout()
  await router.push({ name: 'connect' })
}

const toggleProfileMenu = (event) => {
  profileMenu.value.toggle(event)
}

watch(sidebarCollapsed, (collapsed) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(sidebarStorageKey, collapsed ? 'true' : 'false')
})
</script>

<template>
  <div class="app-shell">
    <header class="app-shell__mobile-header">
      <div class="app-shell__mobile-row">
        <RouterLink to="/app" class="app-shell__brand p-0">
          <img :src="wordmarkSrc" alt="Subfolio" class="app-shell__wordmark app-shell__wordmark--mobile" />
        </RouterLink>

        <div class="flex shrink-0 items-center gap-2">
          <SubfolioButton
            type="button"
            :label="t('appNav.add')"
            icon="pi pi-plus"
            size="small"
            @click="openAddModal"
          />
          <SubfolioButton
            type="button"
            icon="pi pi-user"
            :aria-label="accountLabel"
            variant="tertiary"
            theme="secondary"
            aria-haspopup="true"
            :aria-expanded="profileMenuOpen"
            @click="toggleProfileMenu"
          />
        </div>
      </div>

      <nav aria-label="Primary navigation">
        <div class="grid grid-cols-5 gap-1">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="app-shell__nav-link grid place-items-center gap-1 px-1 py-1 text-center text-[0.68rem] leading-tight"
            :class="{ 'app-shell__nav-link--active': isActive(item.to) }"
          >
            <span :class="item.icon" class="text-base" />
            <span class="w-full truncate">{{ t(item.labelKey) }}</span>
          </RouterLink>
        </div>
      </nav>
    </header>

    <div class="app-shell__body">
      <aside class="app-shell__sidebar" :class="{ 'app-shell__sidebar--collapsed': sidebarCollapsed }">
        <div class="app-shell__brand">
          <RouterLink to="/app" class="app-shell__brand-link">
            <img
              src="/images/subfolio-original.svg"
              alt=""
              class="app-shell__brand-icon"
              aria-hidden="true"
            />
            <img :src="wordmarkSrc" alt="Subfolio" class="app-shell__wordmark" />
          </RouterLink>
        </div>

        <div class="app-shell__actions">
          <SubfolioButton
            type="button"
            :label="sidebarCollapsed ? '' : t('appNav.addExpense')"
            icon="pi pi-plus"
            class="app-shell__add-button w-full"
            :aria-label="t('appNav.addExpense')"
            @click="openAddModal"
          />
        </div>

        <nav class="app-shell__nav" aria-label="Primary navigation">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="app-shell__nav-link text-sm"
            :class="{ 'app-shell__nav-link--active': isActive(item.to) }"
            :aria-label="t(item.labelKey)"
            :title="sidebarCollapsed ? t(item.labelKey) : undefined"
          >
            <span :class="item.icon" />
            <span class="app-shell__nav-label">{{ t(item.labelKey) }}</span>
          </RouterLink>
        </nav>

        <div class="app-shell__footer">
          <div class="app-shell__footer-controls">
            <SubfolioButton
              type="button"
              :label="sidebarCollapsed ? '' : accountLabel"
              icon="pi pi-user"
              variant="tertiary"
              theme="secondary"
              class="app-shell__profile-button w-full justify-start"
              :aria-label="accountLabel"
              aria-haspopup="true"
              :aria-expanded="profileMenuOpen"
              @click="toggleProfileMenu"
            />
            <SubfolioButton
              type="button"
              :icon="sidebarCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"
              :aria-label="sidebarCollapsed ? t('appNav.expandSidebar') : t('appNav.collapseSidebar')"
              variant="tertiary"
              theme="secondary"
              class="app-shell__sidebar-toggle"
              @click="sidebarCollapsed = !sidebarCollapsed"
            />
          </div>
        </div>
      </aside>

      <main class="app-shell__main" :class="mainClass">
        <slot />
      </main>
    </div>

    <ExpenseFormModal />
    <Menu
      ref="profileMenu"
      :model="profileMenuItems"
      popup
      class="app-shell__profile-menu"
      @show="profileMenuOpen = true"
      @hide="profileMenuOpen = false"
    >
      <template #item="{ item, props }">
        <div v-if="item.type === 'theme'" class="app-shell__profile-menu-control" @click.stop>
          <div class="app-shell__profile-menu-heading">
            <span class="app-shell__profile-menu-label">{{ item.label }}</span>
          </div>
          <ThemeLanguageControls compact :show-language="false" />
        </div>
        <div v-else-if="item.type === 'language'" class="app-shell__profile-menu-control" @click.stop>
          <div class="app-shell__profile-menu-heading">
            <span class="app-shell__profile-menu-label">{{ item.label }}</span>
          </div>
          <ThemeLanguageControls compact :show-theme="false" />
        </div>
        <button
          v-else
          v-bind="props.action"
          type="button"
          class="app-shell__profile-menu-action app-shell__profile-menu-action--disconnect"
        >
          <span v-if="item.icon" :class="item.icon" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </button>
      </template>
    </Menu>
  </div>
</template>
