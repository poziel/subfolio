<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Panel from 'primevue/panel'
import Tag from 'primevue/tag'
import PublicSiteShell from '../components/PublicSiteShell.vue'
import { useI18n } from '../composables/useI18n'

const { t, tm } = useI18n()

const featureIcons = [
  'pi pi-list-check',
  'pi pi-chart-line',
  'pi pi-refresh',
  'pi pi-folder',
  'pi pi-wallet',
  'pi pi-database'
]

const features = computed(() => tm('pageData.featureCards').map((item, index) => ({
  ...item,
  icon: featureIcons[index]
})))

const workflow = computed(() => tm('pageData.workflow'))
</script>

<template>
  <PublicSiteShell>
    <div class="grid gap-12">
      <section class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div class="grid gap-5">
          <h1 class="font-serif text-5xl text-ink md:text-6xl">
            {{ t('pages.featuresTitle') }}
          </h1>
        </div>
        <p class="text-lg muted-copy">
          {{ t('pages.featuresIntro') }}
        </p>
      </section>

      <section class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Card v-for="feature in features" :key="feature.title" class="subfolio-card">
          <template #content>
            <div class="grid gap-4">
              <Tag severity="secondary" rounded class="subfolio-card-icon w-fit">
                <span :class="feature.icon" />
              </Tag>
              <div class="grid gap-2">
                <h2 class="text-xl font-semibold text-ink">{{ feature.title }}</h2>
                <p class="muted-copy">{{ feature.detail }}</p>
              </div>
            </div>
          </template>
        </Card>
      </section>

      <section class="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-start">
        <Card>
          <template #title>{{ t('pages.featuresProposesTitle') }}</template>
          <template #subtitle>{{ t('pages.featuresProposesSubtitle') }}</template>
          <template #content>
            <div class="grid gap-4">
              <Panel v-for="(item, index) in workflow" :key="item.title" :header="`${index + 1}. ${item.title}`">
                <p class="muted-copy">
                  {{ item.detail }}
                </p>
              </Panel>
            </div>
          </template>
        </Card>

        <Card>
          <template #title>{{ t('pages.shellTitle') }}</template>
          <template #subtitle>{{ t('pages.shellSubtitle') }}</template>
          <template #content>
            <p class="muted-copy">
              {{ t('pages.shellBody') }}
            </p>
          </template>
          <template #footer>
            <div class="flex flex-col gap-3 sm:flex-row">
              <RouterLink v-slot="{ navigate }" to="/app" custom>
                <Button :label="t('common.openApp')" @click="navigate" />
              </RouterLink>
              <RouterLink v-slot="{ navigate }" to="/byodb" custom>
                <Button :label="t('pages.learnByodb')" icon="pi pi-arrow-right" icon-pos="right" severity="secondary" outlined @click="navigate" />
              </RouterLink>
            </div>
          </template>
        </Card>
      </section>
    </div>
  </PublicSiteShell>
</template>
