<script setup>
import { computed } from 'vue'
import Card from 'primevue/card'
import Message from 'primevue/message'
import Panel from 'primevue/panel'
import Tag from 'primevue/tag'
import PublicSiteShell from '../../components/PublicSiteShell.vue'
import SubfolioButton from '../../components/SubfolioButton.vue'
import { useI18n } from '../../composables/useI18n'

const repositoryUrl = 'https://github.com/poziel/subfolio'
const architectureUrl = `${repositoryUrl}/blob/main/docs/architecture.md`
const { t, tm } = useI18n()

const principleIcons = ['pi pi-github', 'pi pi-shield', 'pi pi-database', 'pi pi-desktop']
const principles = computed(() => tm('pageData.openSourcePrinciples').map((item, index) => ({
  ...item,
  icon: principleIcons[index]
})))
const contributionBody = computed(() => tm('pageData.contributionBody'))
</script>

<template>
  <PublicSiteShell>
    <div class="grid gap-12">
      <section class="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
        <div class="grid gap-5">
          <h1 class="font-serif text-5xl text-ink md:text-6xl">
            {{ t('pages.openSourceTitle') }}
          </h1>
        </div>
        <p class="text-lg muted-copy">
          {{ t('pages.openSourceIntro') }}
        </p>
      </section>

      <section class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card v-for="principle in principles" :key="principle.title" class="subfolio-card">
          <template #content>
            <div class="grid gap-4">
              <Tag severity="secondary" rounded class="subfolio-card-icon w-fit">
                <span :class="principle.icon" />
              </Tag>
              <div class="grid gap-2">
                <h2 class="text-xl font-semibold text-ink">{{ principle.title }}</h2>
                <p class="muted-copy">{{ principle.detail }}</p>
              </div>
            </div>
          </template>
        </Card>
      </section>

      <section class="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <template #title>{{ t('pages.contributionTitle') }}</template>
          <template #subtitle>{{ t('pages.contributionSubtitle') }}</template>
          <template #content>
            <div class="grid gap-4 muted-copy">
              <p v-for="paragraph in contributionBody" :key="paragraph">{{ paragraph }}</p>
            </div>
          </template>
          <template #footer>
            <div class="flex flex-col gap-3 sm:flex-row">
              <SubfolioButton
                as="a"
                :href="repositoryUrl"
                target="_blank"
                rel="noreferrer"
                :label="t('pages.openGithub')"
                icon="pi pi-github"
              />
              <SubfolioButton
                as="a"
                :href="architectureUrl"
                target="_blank"
                rel="noreferrer"
                :label="t('pages.readArchitecture')"
                icon="pi pi-arrow-up-right"
                variant="secondary"
                theme="secondary"
              />
            </div>
          </template>
        </Card>

        <Panel :header="t('pages.noHostedBackend')">
          <div class="grid gap-4 muted-copy">
            <p>
              {{ t('pageData.noHostedBackendBody') }}
            </p>
            <Message severity="success" :closable="false">
              {{ t('pageData.noHostedBackendNotice') }}
            </Message>
          </div>
        </Panel>
      </section>
    </div>
  </PublicSiteShell>
</template>
