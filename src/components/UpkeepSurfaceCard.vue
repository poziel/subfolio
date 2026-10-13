<script setup>
import { computed, useAttrs } from 'vue'
import Card from 'primevue/card'

defineOptions({
  inheritAttrs: false
})

const attrs = useAttrs()
const cardAttrs = computed(() => {
  const rest = { ...attrs }
  delete rest.class
  return rest
})
const cardClass = computed(() => ['upkeep-surface-card', attrs.class])
</script>

<template>
  <Card v-bind="cardAttrs" :class="cardClass">
    <template #content>
      <slot />
    </template>
  </Card>
</template>
