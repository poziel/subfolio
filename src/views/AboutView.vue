<script setup>
import { computed } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Panel from 'primevue/panel'
import PublicSiteShell from '../components/PublicSiteShell.vue'
import { useI18n } from '../composables/useI18n'

const repositoryUrl = 'https://github.com/poziel/subfolio'
const { t, tm } = useI18n()

const reasons = computed(() => tm('pageData.aboutReasons'))
const aboutBody = computed(() => tm('pageData.aboutBody'))
const principles = computed(() => tm('pageData.productPrinciples'))
const technology = computed(() => tm('pageData.aboutTechnology'))
</script>

<template>
  <PublicSiteShell>
    <div class="grid gap-12">
      <section class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div class="grid gap-5">
          <h1 class="font-serif text-5xl text-ink md:text-6xl">
            {{ t('pages.aboutTitle') }}
          </h1>
        </div>
        <p class="text-lg muted-copy">
          {{ t('pages.aboutIntro') }}
        </p>
      </section>

      <section class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <template #title>{{ t('pages.whyBuilt') }}</template>
          <template #content>
            <div class="grid gap-4 muted-copy">
              <p v-for="paragraph in aboutBody" :key="paragraph">{{ paragraph }}</p>
            </div>
          </template>
        </Card>

        <Card>
          <template #title>{{ t('pages.technologyTitle') }}</template>
          <template #subtitle>{{ t('pages.technologySubtitle') }}</template>
          <template #content>
            <ul class="grid gap-3 muted-copy">
              <li v-for="item in technology" :key="item" class="flex gap-3">
                <span class="pi pi-check mt-1 text-[var(--p-primary-600)]" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </template>
          <template #footer>
            <Button
              as="a"
              :href="repositoryUrl"
              target="_blank"
              rel="noreferrer"
              :label="t('pages.startGithubProject')"
              icon="pi pi-github"
            />
          </template>
        </Card>
      </section>

      <section class="grid gap-5 md:grid-cols-3">
        <Card v-for="reason in reasons" :key="reason.title" class="subfolio-card">
          <template #content>
            <div class="grid gap-3">
              <h2 class="text-xl font-semibold text-ink">{{ reason.title }}</h2>
              <p class="muted-copy">{{ reason.detail }}</p>
            </div>
          </template>
        </Card>
      </section>

      <Panel :header="t('pages.principles')">
        <ul class="grid gap-3 muted-copy md:grid-cols-3">
          <li v-for="principle in principles" :key="principle" class="flex gap-3">
              <span class="pi pi-check mt-1 text-[var(--p-primary-600)]" />
              <span>{{ principle }}</span>
          </li>
        </ul>
      </Panel>

      <Card>
        <template #content>
          <div class="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 class="font-serif text-3xl text-ink">{{ t('pages.tryDatabase') }}</h2>
              <p class="mt-2 max-w-2xl muted-copy">
                {{ t('pages.tryDatabaseBody') }}
              </p>
            </div>
            <RouterLink v-slot="{ navigate }" to="/app" custom>
              <Button :label="t('common.openApp')" @click="navigate" />
            </RouterLink>
          </div>
        </template>
      </Card>
    </div>
  </PublicSiteShell>
</template>
