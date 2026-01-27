<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    class="ui-button"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="ui-button-spinner" />
    <Icon v-if="icon && !loading" :name="icon" class="ui-button-icon" />
    <span v-if="$slots.default" class="ui-button-text">
      <slot />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'ghost', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  block: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const buttonClasses = computed(() => ({
  [`ui-button--${props.variant}`]: true,
  [`ui-button--${props.size}`]: true,
  'ui-button--block': props.block,
  'ui-button--loading': props.loading,
  'ui-button--icon-only': props.icon && !props.$slots.default
}))
</script>
