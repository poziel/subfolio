<template>
  <div :class="spinnerClasses" class="ui-spinner" role="status">
    <svg class="ui-spinner-svg" viewBox="0 0 50 50">
      <circle class="ui-spinner-circle" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
    </svg>
    <span v-if="$slots.default" class="ui-spinner-label">
      <slot />
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'white'].includes(value)
  }
})

const spinnerClasses = computed(() => ({
  [`ui-spinner--${props.size}`]: true,
  [`ui-spinner--${props.variant}`]: true
}))
</script>
