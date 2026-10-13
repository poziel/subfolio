<script setup>
import { useI18n } from '../composables/useI18n'

const { t } = useI18n()

defineProps({
  wordmarkOnly: Boolean,
  tagline: Boolean
})
</script>

<template>
  <span class="upkeep-brand" :class="{ 'upkeep-brand--tagline': tagline }" data-test-id="upkeep-brand">
    <span class="upkeep-brand__lockup">
      <img v-if="!wordmarkOnly" src="/images/upkeep-original.svg" alt="" class="upkeep-brand__symbol" aria-hidden="true" />
      <span class="upkeep-brand__name">Upkeep</span>
    </span>
    <span v-if="tagline" class="upkeep-brand__tagline">{{ t('common.brandTagline') }}</span>
  </span>
</template>

<style scoped>
.upkeep-brand { display: inline-flex; flex-direction: column; color: inherit; }
.upkeep-brand__lockup { display: inline-flex; align-items: center; gap: 0.5em; }
.upkeep-brand__symbol { width: 1.4em; height: 1.5em; flex: none; }
.upkeep-brand__name { font-family: 'Fraunces', Georgia, serif; font-size: 1em; font-weight: 600; letter-spacing: -0.045em; line-height: 1.1; }
.upkeep-brand--tagline { align-items: center; gap: 0.6rem; }
.upkeep-brand__tagline { font-size: 0.75rem; font-weight: 500; letter-spacing: 0.015em; }
</style>
