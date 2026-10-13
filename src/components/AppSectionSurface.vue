<script setup>
import { computed, useSlots } from 'vue'
import UpkeepSurfaceCard from './UpkeepSurfaceCard.vue'

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  surfaceClass: {
    type: [String, Array, Object],
    default: ''
  }
})

const slots = useSlots()
const hasActions = computed(() => Boolean(slots.actions))
</script>

<template>
  <section class="app-section">
    <div class="app-section-heading" :class="{ 'app-section-heading--with-actions': hasActions }">
      <div class="app-section-heading__copy">
        <h2 class="app-section-title">{{ title }}</h2>
        <p v-if="subtitle" class="app-section-subtitle">{{ subtitle }}</p>
      </div>

      <div v-if="hasActions" class="app-section-heading__actions">
        <slot name="actions" />
      </div>
    </div>

    <UpkeepSurfaceCard :class="surfaceClass">
      <slot />
    </UpkeepSurfaceCard>
  </section>
</template>
