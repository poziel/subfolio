<script setup>
import { computed } from 'vue'
import Card from 'primevue/card'
import Message from 'primevue/message'
import Panel from 'primevue/panel'
import Tag from 'primevue/tag'
import PublicSiteShell from '../../components/PublicSiteShell.vue'
import SubfolioButton from '../../components/SubfolioButton.vue'
import { useI18n } from '../../composables/useI18n'

const { t, tm } = useI18n()

const providerIcons = ['pi pi-bolt', 'pi pi-server']
const providers = computed(() => tm('pageData.byodbProviders').map((item, index) => ({ ...item, icon: providerIcons[index] })))
const steps = computed(() => tm('pageData.byodbSteps'))
</script>

<template>
  <PublicSiteShell>
    <div class="grid gap-12">
      <section class="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
        <div class="grid gap-5">
          <h1 class="font-serif text-5xl text-ink md:text-6xl">
            {{ t('pages.byodbTitle') }}
          </h1>
        </div>
        <p class="text-lg muted-copy">
          {{ t('pages.byodbIntro') }}
        </p>
      </section>

      <Message severity="info" :closable="false">
        {{ t('pages.byodbNotice') }}
      </Message>

      <section class="grid gap-5 md:grid-cols-2">
        <Card v-for="provider in providers" :key="provider.title" class="subfolio-card">
          <template #content>
            <div class="grid gap-4">
              <Tag severity="secondary" rounded class="subfolio-card-icon w-fit">
                <span :class="provider.icon" />
              </Tag>
              <div class="grid gap-2">
                <h2 class="text-xl font-semibold text-ink">{{ provider.title }}</h2>
                <p class="muted-copy">{{ provider.detail }}</p>
              </div>
            </div>
          </template>
        </Card>
      </section>

      <section class="grid gap-4">
        <Panel v-for="(step, index) in steps" :key="step.title" :header="`${index + 1}. ${step.title}`">
          <p class="muted-copy">{{ step.detail }}</p>
        </Panel>
      </section>

      <Card>
        <template #title>{{ t('pages.connectionStores') }}</template>
        <template #subtitle>{{ t('pages.connectionStoresSubtitle') }}</template>
        <template #content>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-lg bg-[var(--light-surface-2)] p-4 shadow-sm">
              <p class="font-semibold text-ink">Firebase</p>
              <p class="mt-2 text-sm muted-copy">
                {{ t('pages.firebaseDetails') }}
              </p>
            </div>
            <div class="rounded-lg bg-[var(--light-surface-2)] p-4 shadow-sm">
              <p class="font-semibold text-ink">PocketBase</p>
              <p class="mt-2 text-sm muted-copy">
                {{ t('pages.pocketbaseDetails') }}
              </p>
            </div>
          </div>
        </template>
        <template #footer>
          <RouterLink v-slot="{ navigate }" to="/app" custom>
            <SubfolioButton :label="t('common.openApp')" @click="navigate" />
          </RouterLink>
        </template>
      </Card>
    </div>
  </PublicSiteShell>
</template>
