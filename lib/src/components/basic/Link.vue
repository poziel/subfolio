<template>
  <component
    :is="componentType"
    :href="href"
    :to="to"
    :class="linkClasses"
    class="ui-link"
    @click="handleClick"
  >
    <Icon v-if="icon" :name="icon" class="ui-link-icon" />
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  href: {
    type: String,
    default: ''
  },
  to: {
    type: [String, Object],
    default: ''
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'muted'].includes(value)
  },
  underline: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  external: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const componentType = computed(() => {
  if (props.to) return 'router-link'
  if (props.href) return 'a'
  return 'button'
})

const linkClasses = computed(() => ({
  [`ui-link--${props.variant}`]: true,
  'ui-link--underline': props.underline
}))

const handleClick = (event) => {
  emit('click', event)
}
</script>
