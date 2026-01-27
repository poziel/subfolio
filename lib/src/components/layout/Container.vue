<template>
  <div :class="containerClasses" class="ui-container">
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  maxWidth: {
    type: String,
    default: 'lg',
    validator: (value) => ['sm', 'md', 'lg', 'xl', '2xl', 'full'].includes(value)
  },
  padding: {
    type: Boolean,
    default: true
  },
  centered: {
    type: Boolean,
    default: true
  }
})

const containerClasses = computed(() => ({
  [`ui-container--${props.maxWidth}`]: true,
  'ui-container--padded': props.padding,
  'ui-container--centered': props.centered
}))
</script>
