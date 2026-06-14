<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Button from 'primevue/button'
import MadeWithLoveCredit from './MadeWithLoveCredit.vue'
import ThemeLanguageControls from './ThemeLanguageControls.vue'
import { useI18n } from '../composables/useI18n'
import { useTheme } from '../composables/useTheme'

const repositoryUrl = 'https://github.com/poziel/subfolio'
const sourceCodeUrl = `${repositoryUrl}/tree/main/src`
const architectureUrl = `${repositoryUrl}/blob/main/docs/architecture.md`

const route = useRoute()
const { t } = useI18n()
const { activeTheme } = useTheme()

const navItems = [
  { to: '/', labelKey: 'nav.overview', exact: true },
  { to: '/features', labelKey: 'nav.features' },
  { to: '/byodb', labelKey: 'nav.byodb' },
  { to: '/pricing', labelKey: 'nav.pricing' },
  { to: '/open-source', labelKey: 'nav.openSource' },
  { to: '/changelog', labelKey: 'nav.changelog' },
  { to: '/about', labelKey: 'nav.about' }
]

const productItems = [
  { to: '/', labelKey: 'nav.overview', exact: true },
  { to: '/features', labelKey: 'nav.features' },
  { to: '/byodb', labelKey: 'nav.byodb' },
  { to: '/pricing', labelKey: 'nav.pricing' },
  { to: '/changelog', labelKey: 'nav.changelog' }
]

const openSourceItems = [
  { href: repositoryUrl, labelKey: 'nav.github' },
  { href: sourceCodeUrl, labelKey: 'nav.sourceCode' },
  { to: '/open-source', labelKey: 'nav.openSource' },
  { href: architectureUrl, labelKey: 'nav.roadmapArchitecture' }
]

const legalItems = [
  { to: '/privacy', labelKey: 'nav.privacy' },
  { to: '/terms', labelKey: 'nav.terms' },
  { to: '/refund-policy', labelKey: 'nav.refund' },
  { to: '/license', labelKey: 'nav.license' }
]

const isActive = (item) => {
  if (item.exact) return route.path === item.to
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

const year = computed(() => new Date().getFullYear())
</script>

<template>
  <div class="min-h-screen px-5 py-5 lg:px-10">
    <header class="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex items-center justify-between gap-4">
        <RouterLink class="flex items-center gap-3" to="/">
          <img
            :src="activeTheme === 'dark' ? '/images/subfolio-light-horizontal.svg' : '/images/subfolio-dark-horizontal.svg'"
            alt="Subfolio"
            class="h-14 w-auto max-w-56"
          />
        </RouterLink>

        <div class="flex items-center gap-2 lg:hidden">
        <Button
          as="a"
          :href="repositoryUrl"
          target="_blank"
          rel="noreferrer"
          :aria-label="t('common.githubRepo')"
          icon="pi pi-github"
          size="small"
          severity="secondary"
            outlined
          />
          <ThemeLanguageControls compact />
          <RouterLink v-slot="{ navigate }" to="/app" custom>
            <Button
              :label="t('common.openApp')"
              size="small"
              @click="navigate"
            />
          </RouterLink>
        </div>
      </div>

      <nav class="flex flex-wrap gap-1.5 text-sm" aria-label="Public navigation">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="subfolio-nav-link"
          :class="
            isActive(item)
              ? 'subfolio-nav-link--active'
              : 'text-[var(--light-text-secondary)]'
          "
        >
          {{ t(item.labelKey) }}
        </RouterLink>
      </nav>

      <div class="hidden items-center gap-2 lg:flex">
        <ThemeLanguageControls />
        <Button
          as="a"
          :href="repositoryUrl"
          target="_blank"
          rel="noreferrer"
          :aria-label="t('common.githubRepo')"
          icon="pi pi-github"
          severity="secondary"
          outlined
        />
        <RouterLink v-slot="{ navigate }" to="/app" custom>
          <Button :label="t('common.openApp')" @click="navigate" />
        </RouterLink>
      </div>
    </header>

    <main class="mx-auto max-w-7xl py-12 lg:py-16">
      <slot />
    </main>

    <footer class="mx-auto grid max-w-7xl gap-8 border-t border-[var(--p-surface-200)] py-8 text-sm muted-copy lg:grid-cols-[1fr_auto_auto_auto]">
      <div class="grid gap-3">
        <RouterLink class="w-fit" to="/">
          <img
            :src="activeTheme === 'dark' ? '/images/subfolio-light-horizontal.svg' : '/images/subfolio-dark-horizontal.svg'"
            alt="Subfolio"
            class="h-9 w-auto max-w-40"
          />
        </RouterLink>
        <p class="max-w-md">
          {{ t('footer.tagline') }}
        </p>
        <MadeWithLoveCredit class="subfolio-made-with-love-credit" />
        <p>&copy; {{ year }} Subfolio.</p>
      </div>

      <nav class="grid content-start gap-2" aria-label="Footer product navigation">
        <p class="font-semibold text-ink">{{ t('nav.product') }}</p>
        <RouterLink v-for="item in productItems" :key="item.to" :to="item.to" class="hover:text-ink">
          {{ t(item.labelKey) }}
        </RouterLink>
      </nav>

      <nav class="grid content-start gap-2" aria-label="Footer open source navigation">
        <p class="font-semibold text-ink">{{ t('nav.openSource') }}</p>
        <template v-for="item in openSourceItems" :key="item.labelKey">
          <RouterLink v-if="item.to" :to="item.to" class="hover:text-ink">
            {{ t(item.labelKey) }}
          </RouterLink>
          <a v-else :href="item.href" target="_blank" rel="noreferrer" class="hover:text-ink">
            {{ t(item.labelKey) }}
          </a>
        </template>
      </nav>

      <nav class="grid content-start gap-2" aria-label="Footer legal navigation">
        <p class="font-semibold text-ink">{{ t('nav.legal') }}</p>
        <RouterLink v-for="item in legalItems" :key="item.to" :to="item.to" class="hover:text-ink">
          {{ t(item.labelKey) }}
        </RouterLink>
      </nav>
    </footer>
  </div>
</template>
