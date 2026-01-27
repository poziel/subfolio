<template>
  <div v-if="!dismissed" :class="alertClasses" class="ui-alert" role="alert">
    <Icon v-if="iconName" :name="iconName" class="ui-alert-icon" />
    <div class="ui-alert-content">
      <h4 v-if="title" class="ui-alert-title">{{ title }}</h4>
      <div class="ui-alert-message">
        <slot />
      </div>
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="ui-alert-close"
      aria-label="Close"
      @click="handleDismiss"
    >
      <Icon name="close" />
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import Icon from '../basic/Icon.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'danger'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  dismissible: {
    type: Boolean,
    default: false
  },
  icon: {
    type: [String, Boolean],
    default: true
  }
})

const emit = defineEmits(['dismiss'])

const dismissed = ref(false)

const iconMap = {
  info: 'info',
  success: 'check',
  warning: 'warning',
  danger: 'error'
}

const iconName = computed(() => {
  if (props.icon === false) return null
  if (typeof props.icon === 'string') return props.icon
  return iconMap[props.variant]
})

const alertClasses = computed(() => ({
  [`ui-alert--${props.variant}`]: true
}))

const handleDismiss = () => {
  dismissed.value = true
  emit('dismiss')
}
</script>
