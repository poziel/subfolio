<script setup>
import UpkeepBrand from './UpkeepBrand.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MadeWithLoveCredit from './MadeWithLoveCredit.vue'
import UpkeepButton from './UpkeepButton.vue'
import ThemeLanguageControls from './ThemeLanguageControls.vue'
import { useI18n } from '../composables/useI18n'

const repositoryUrl = 'https://github.com/poziel/upkeep'
const sourceCodeUrl = `${repositoryUrl}/tree/main/src`
const architectureUrl = `${repositoryUrl}/blob/main/docs/architecture.md`

const route = useRoute()
const { t } = useI18n()

const navItems = [
  { to: '/', labelKey: 'nav.overview', exact: true },
  { to: '/features', labelKey: 'nav.features' },
  { to: '/byodb', labelKey: 'nav.byodb' },
  { to: '/pricing', labelKey: 'nav.pricing' },
  { to: '/open-source', labelKey: 'nav.openSource' }
]

const productItems = [
  { to: '/', labelKey: 'nav.overview', exact: true },
  { to: '/features', labelKey: 'nav.features' },
  { to: '/byodb', labelKey: 'nav.byodb' },
  { to: '/pricing', labelKey: 'nav.pricing' },
  { to: '/changelog', labelKey: 'nav.changelog' },
  { to: '/about', labelKey: 'nav.about' }
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
  <div class="public-shell">
    <header class="public-shell__header">
      <div class="public-shell__header-inner">
        <RouterLink class="flex min-w-0 items-center gap-3" to="/">
          <UpkeepBrand class="public-shell__logo" />
        </RouterLink>

        <nav class="public-shell__nav" aria-label="Public navigation">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="upkeep-nav-link"
            :class="{ 'upkeep-nav-link--active': isActive(item) }"
          >
            {{ t(item.labelKey) }}
          </RouterLink>
        </nav>

        <div class="public-shell__actions">
          <ThemeLanguageControls />
          <UpkeepButton
            as="a"
            :href="repositoryUrl"
            target="_blank"
            rel="noreferrer"
            :aria-label="t('common.githubRepo')"
            icon="pi pi-github"
            variant="tertiary"
            theme="secondary"
            size="small"
          />
          <RouterLink v-slot="{ navigate }" to="/app" custom>
            <UpkeepButton
              :label="t('common.openApp')"
              size="small"
              @click="navigate"
            />
          </RouterLink>
        </div>
      </div>
    </header>

    <main class="public-shell__main">
      <slot />
    </main>

    <footer class="public-shell__footer text-sm">
      <div class="public-shell__footer-inner">
        <div class="grid gap-3">
          <RouterLink class="w-fit" to="/">
            <UpkeepBrand class="text-3xl" />
          </RouterLink>
          <p class="max-w-md">
            {{ t('footer.tagline') }}
          </p>
          <MadeWithLoveCredit class="upkeep-made-with-love-credit" />
        </div>

        <nav class="public-shell__footer-links" aria-label="Footer product navigation">
          <p class="public-shell__footer-heading">{{ t('nav.product') }}</p>
          <RouterLink v-for="item in productItems" :key="item.to" :to="item.to">
            {{ t(item.labelKey) }}
          </RouterLink>
        </nav>

        <nav class="public-shell__footer-links" aria-label="Footer open source navigation">
          <p class="public-shell__footer-heading">{{ t('nav.openSource') }}</p>
          <template v-for="item in openSourceItems" :key="item.labelKey">
            <RouterLink v-if="item.to" :to="item.to">
              {{ t(item.labelKey) }}
            </RouterLink>
            <a v-else :href="item.href" target="_blank" rel="noreferrer">
              {{ t(item.labelKey) }}
            </a>
          </template>
        </nav>

        <nav class="public-shell__footer-links" aria-label="Footer legal navigation">
          <p class="public-shell__footer-heading">{{ t('nav.legal') }}</p>
          <RouterLink v-for="item in legalItems" :key="item.to" :to="item.to">
            {{ t(item.labelKey) }}
          </RouterLink>
        </nav>

        <p class="public-shell__copyright">{{ t('footer.copyright', { year }) }}</p>
      </div>
    </footer>
  </div>
</template>
