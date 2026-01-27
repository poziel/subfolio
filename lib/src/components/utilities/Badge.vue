<template>
  <span :class="badgeClasses" class="ui-badge">
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'success', 'warning', 'danger', 'info'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  dot: {
    type: Boolean,
    default: false
  }
})

const badgeClasses = computed(() => ({
  [`ui-badge--${props.variant}`]: true,
  [`ui-badge--${props.size}`]: true,
  'ui-badge--dot': props.dot
}))
</script>
