<script setup>
import { computed } from 'vue'
import Card from 'primevue/card'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import PublicSiteShell from '../../components/PublicSiteShell.vue'
import SubfolioIconTile from '../../components/icons/SubfolioIconTile.vue'
import SubfolioButton from '../../components/SubfolioButton.vue'
import { useI18n } from '../../composables/useI18n'

const { t, tm } = useI18n()

const forecastItems = computed(() => [
  {
    initials: 'N',
    name: 'Netflix',
    category: t('landing.subscriptions'),
    cadence: t('landing.monthly'),
    due: 'Jun 24',
    amount: '$15.49',
    status: t('landing.onTrack'),
    severity: 'info'
  },
  {
    initials: 'HO',
    name: 'Hydro One',
    category: t('landing.utilities'),
    cadence: t('landing.monthly'),
    due: 'Jun 22',
    amount: '$84.00',
    status: t('table.nextDue'),
    severity: 'warn'
  },
  {
    initials: 'PF',
    name: 'Planet Fitness',
    category: t('landing.wellness'),
    cadence: t('landing.monthly'),
    due: 'Jul 1',
    amount: '$24.99',
    status: t('metrics.active'),
    severity: 'success'
  }
])

const insightCards = [
  {
    titleKey: 'landing.trackTitle',
    detailKey: 'landing.trackDetail',
    icon: 'pi pi-list-check'
  },
  {
    titleKey: 'landing.forecastTitle',
    detailKey: 'landing.forecastDetail',
    icon: 'pi pi-chart-line'
  },
  {
    titleKey: 'landing.byodbTitle',
    detailKey: 'landing.byodbDetail',
    icon: 'pi pi-database'
  },
  {
    titleKey: 'landing.portableTitle',
    detailKey: 'landing.portableDetail',
    icon: 'pi pi-send'
  }
]

const byodbSteps = computed(() => tm('pageData.byodbSteps'))
const pricingFeatures = computed(() => tm('pageData.pricingFeatures'))
</script>

<template>
  <PublicSiteShell>
    <div class="grid gap-16">
      <section class="landing-hero">
        <div class="landing-hero__copy">
          <span class="section-eyebrow">{{ t('landing.eyebrow') }}</span>
          <h1 class="landing-hero__title">
            {{ t('landing.heroTitle') }}
          </h1>
          <p class="lead-copy">
            {{ t('landing.heroBody') }}
          </p>
          <div class="landing-hero__actions">
            <RouterLink v-slot="{ navigate }" to="/app" custom>
              <SubfolioButton :label="t('common.openApp')" icon="pi pi-arrow-right" icon-pos="right" @click="navigate" />
            </RouterLink>
            <RouterLink v-slot="{ navigate }" to="/features" custom>
              <SubfolioButton :label="t('landing.exploreFeatures')" variant="secondary" theme="secondary" @click="navigate" />
            </RouterLink>
          </div>
          <div class="landing-hero__badges">
            <span><i class="pi pi-check-circle" />{{ t('landing.freeOpenSource') }}</span>
            <span><i class="pi pi-shield" />{{ t('landing.bringDatabase') }}</span>
          </div>
        </div>

        <article class="forecast-card" aria-labelledby="forecast-card-title">
          <div class="forecast-card__top">
            <div>
              <h2 id="forecast-card-title" class="font-sans text-lg font-semibold text-ink">
                {{ t('landing.marchForecast') }}
              </h2>
              <p class="text-sm muted-copy">{{ t('landing.forecastSubtitle') }}</p>
            </div>
            <Tag :value="t('landing.onTrack')" severity="success" rounded />
          </div>

          <div class="forecast-card__balance">
            <p class="forecast-card__label">{{ t('landing.monthEndBalance') }}</p>
            <p class="forecast-card__value">$2,140.00</p>
            <p class="forecast-card__note">{{ t('landing.projectedAfterBills') }}</p>
          </div>

          <div class="recurrence-preview-list">
            <div v-for="item in forecastItems" :key="item.name" class="recurrence-preview-item">
              <div class="recurrence-preview-item__main">
                <span class="subfolio-avatar">{{ item.initials }}</span>
                <div class="min-w-0">
                  <p class="truncate font-extrabold text-ink">{{ item.name }}</p>
                  <p class="truncate text-sm muted-copy">
                    {{ item.category }} / {{ item.cadence }} / {{ item.due }}
                  </p>
                </div>
              </div>
              <div class="grid justify-items-end gap-1">
                <span class="subfolio-amount">{{ item.amount }}</span>
                <Tag :value="item.status" :severity="item.severity" rounded />
              </div>
            </div>
          </div>

          <Message severity="info" :closable="false">
            <template #icon>
              <span class="pi pi-chart-line" />
            </template>
            {{ t('landing.balanceMessage') }}
          </Message>
        </article>
      </section>

      <section id="features" class="grid gap-8">
        <div class="max-w-2xl">
          <span class="section-eyebrow">{{ t('landing.featuresEyebrow') || t('landing.obligationsTitle') }}</span>
          <h2 class="mt-3 font-serif text-4xl text-ink">
            {{ t('pages.featuresTitle') }}
          </h2>
        </div>

        <div class="feature-card-grid">
          <Card v-for="item in insightCards" :key="item.titleKey" class="feature-card">
            <template #content>
              <SubfolioIconTile :icon="item.icon" />
              <h3>{{ t(item.titleKey) }}</h3>
              <p class="muted-copy">{{ t(item.detailKey) }}</p>
            </template>
          </Card>
        </div>
      </section>

      <section id="byodb" class="byodb-band">
        <div class="byodb-band__inner">
          <div class="grid content-start gap-5">
            <span class="section-eyebrow">{{ t('nav.byodb') }}</span>
            <h2 class="font-serif text-4xl">{{ t('pages.byodbTitle') }}</h2>
            <p class="lead-copy muted-copy">{{ t('pages.byodbIntro') }}</p>
          </div>

          <div class="byodb-step-list">
            <article v-for="(step, index) in byodbSteps" :key="step.title" class="byodb-step">
              <span class="byodb-step__number">{{ index + 1 }}</span>
              <div>
                <h3 class="text-base">{{ step.title }}</h3>
                <p class="mt-1 text-sm muted-copy">{{ step.detail }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="pricing" class="pricing-shell">
        <div>
          <Tag :value="t('pages.currentTier')" severity="secondary" rounded />
          <h2 class="mt-4 font-serif text-4xl text-ink">{{ t('pages.pricingTitle') }}</h2>
          <p class="mt-3 lead-copy">{{ t('pages.pricingIntro') }}</p>
          <div class="mt-6 flex flex-wrap items-baseline gap-2">
            <span class="font-serif text-6xl font-semibold text-ink">{{ t('pages.free') }}</span>
            <span class="muted-copy">{{ t('pages.noHostingFee') }}</span>
          </div>
        </div>

        <ul class="included-list">
          <li v-for="item in pricingFeatures" :key="item">
            <span class="pi pi-check" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </section>
    </div>
  </PublicSiteShell>
</template>
