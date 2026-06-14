<script setup>
import { computed } from 'vue'
import Card from 'primevue/card'
import Message from 'primevue/message'
import PublicSiteShell from '../components/PublicSiteShell.vue'
import { useI18n } from '../composables/useI18n'

const props = defineProps({
  page: {
    type: String,
    required: true
  }
})

const { tm } = useI18n()

const content = computed(() => tm(`legalPages.${props.page}`) ?? tm('legalPages.privacy'))
</script>

<template>
  <PublicSiteShell>
    <div class="grid gap-10">
      <section class="grid gap-5">
        <h1 class="font-serif text-5xl text-ink md:text-6xl">{{ content.title }}</h1>
        <p class="max-w-3xl text-lg muted-copy">{{ content.intro }}</p>
      </section>

      <Message severity="warn" :closable="false">
        {{ content.notice }}
      </Message>

      <section class="grid gap-5 md:grid-cols-3">
        <Card v-for="section in content.sections" :key="section.title" class="subfolio-card">
          <template #title>{{ section.title }}</template>
          <template #content>
            <p class="muted-copy">{{ section.body }}</p>
          </template>
        </Card>
      </section>
    </div>
  </PublicSiteShell>
</template>
