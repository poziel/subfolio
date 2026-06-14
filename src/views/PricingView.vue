<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import PublicSiteShell from '../components/PublicSiteShell.vue'
import { useI18n } from '../composables/useI18n'

const { t, tm } = useI18n()
const freeFeatures = computed(() => tm('pageData.pricingFeatures'))
</script>

<template>
  <PublicSiteShell>
    <div class="grid gap-12">
      <section class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div class="grid gap-5">
          <h1 class="font-serif text-5xl text-ink md:text-6xl">
            {{ t('pages.pricingTitle') }}
          </h1>
        </div>
        <p class="text-lg muted-copy">
          {{ t('pages.pricingIntro') }}
        </p>
      </section>

      <section class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <Card class="subfolio-card">
          <template #title>
            <div class="flex items-center justify-between gap-3">
              <span>{{ t('pages.free') }}</span>
              <Tag :value="t('pages.currentTier')" severity="success" rounded />
            </div>
          </template>
          <template #subtitle>{{ t('pages.noHostingFee') }}</template>
          <template #content>
            <div class="grid gap-6">
              <div>
                <p class="text-5xl font-bold text-[var(--p-primary-700)]">$0</p>
                <p class="mt-2 muted-copy">{{ t('pages.useShellFreely') }}</p>
              </div>
              <ul class="grid gap-3">
                <li v-for="feature in freeFeatures" :key="feature" class="flex gap-3">
                  <span class="pi pi-check mt-1 text-[var(--p-primary-600)]" />
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </div>
          </template>
          <template #footer>
            <RouterLink v-slot="{ navigate }" to="/app" custom>
              <Button :label="t('common.openApp')" class="w-full" @click="navigate" />
            </RouterLink>
          </template>
        </Card>

        <div class="grid gap-5">
          <Message severity="info" :closable="false">
            {{ t('pageData.pricingNotice') }}
          </Message>
          <Card>
            <template #title>{{ t('pages.whatMayChange') }}</template>
            <template #content>
              <p class="muted-copy">
                {{ t('pageData.pricingFuture') }}
              </p>
            </template>
          </Card>
          <Card>
            <template #title>{{ t('pages.refunds') }}</template>
            <template #content>
              <p class="muted-copy">
                {{ t('pageData.pricingRefund') }}
              </p>
            </template>
          </Card>
        </div>
      </section>
    </div>
  </PublicSiteShell>
</template>
