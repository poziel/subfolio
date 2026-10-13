<script setup>
import { computed, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  as: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  iconPos: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'right'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'tertiary'].includes(value)
  },
  theme: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'warning', 'danger', 'info'].includes(value)
  },
  type: {
    type: String,
    default: 'button'
  },
  size: {
    type: String,
    default: '',
    validator: (value) => ['', 'small', 'large'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])
const attrs = useAttrs()

const componentTag = computed(() => props.as || (attrs.href ? 'a' : 'button'))
const isNativeButton = computed(() => componentTag.value === 'button')
const isUnavailable = computed(() => props.disabled || props.loading)
const visibleIcon = computed(() => (props.loading ? 'pi pi-spinner pi-spin' : props.icon))

const forwardedAttrs = computed(() => {
  const rest = { ...attrs }

  delete rest.class
  delete rest.disabled
  delete rest.type
  delete rest['aria-disabled']

  return rest
})

const buttonClasses = computed(() => [
  'upkeep-button',
  `upkeep-button--${props.variant}`,
  `upkeep-button--theme-${props.theme}`,
  props.size ? `upkeep-button--${props.size}` : '',
  {
    'upkeep-button--icon-only': Boolean(visibleIcon.value) && !props.label,
    'upkeep-button--loading': props.loading,
    'upkeep-button--disabled': isUnavailable.value
  }
])

const handleClick = (event) => {
  if (isUnavailable.value) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  emit('click', event)
}
</script>

<template>
  <component
    :is="componentTag"
    v-bind="forwardedAttrs"
    :type="isNativeButton ? type : undefined"
    :disabled="isNativeButton ? isUnavailable : undefined"
    :aria-disabled="isUnavailable ? 'true' : attrs['aria-disabled']"
    :aria-busy="loading ? 'true' : undefined"
    :class="[buttonClasses, attrs.class]"
    @click="handleClick"
  >
    <span
      v-if="visibleIcon && iconPos !== 'right'"
      class="upkeep-button__icon"
      :class="visibleIcon"
      aria-hidden="true"
    />
    <span v-if="label || $slots.default" class="upkeep-button__label">
      <slot>{{ label }}</slot>
    </span>
    <span
      v-if="visibleIcon && iconPos === 'right'"
      class="upkeep-button__icon"
      :class="visibleIcon"
      aria-hidden="true"
    />
  </component>
</template>

<style scoped>
.upkeep-button {
  --upkeep-button-fill: var(--brand-teal);
  --upkeep-button-fill-hover: var(--color-primary-hover);
  --upkeep-button-fill-active: var(--color-primary-active);
  --upkeep-button-ink: #fff;
  --upkeep-button-soft: rgba(0, 165, 148, 0.12);
  --upkeep-button-focus: rgba(0, 165, 148, 0.24);

  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  padding: 0.65rem 1.1rem;
  font: inherit;
  font-weight: 800;
  line-height: 1.15;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.upkeep-button--theme-secondary {
  --upkeep-button-fill: var(--brand-teal-dark);
  --upkeep-button-fill-hover: #0f2d2a;
  --upkeep-button-fill-active: #0a2421;
  --upkeep-button-ink: #fff;
  --upkeep-button-soft: rgba(23, 60, 57, 0.1);
  --upkeep-button-focus: rgba(23, 60, 57, 0.22);
}

.upkeep-button--theme-success {
  --upkeep-button-fill: var(--success);
  --upkeep-button-fill-hover: var(--color-primary-hover);
  --upkeep-button-fill-active: var(--color-primary-active);
  --upkeep-button-ink: #fff;
  --upkeep-button-soft: var(--success-bg);
  --upkeep-button-focus: rgba(0, 165, 148, 0.24);
}

.upkeep-button--theme-warning {
  --upkeep-button-fill: var(--warning);
  --upkeep-button-fill-hover: var(--color-secondary-hover);
  --upkeep-button-fill-active: var(--color-secondary-active);
  --upkeep-button-ink: var(--brand-teal-dark);
  --upkeep-button-soft: var(--warning-bg);
  --upkeep-button-focus: rgba(215, 175, 114, 0.3);
}

.upkeep-button--theme-danger {
  --upkeep-button-fill: var(--danger);
  --upkeep-button-fill-hover: #ad4646;
  --upkeep-button-fill-active: #943838;
  --upkeep-button-ink: #fff;
  --upkeep-button-soft: var(--danger-bg);
  --upkeep-button-focus: rgba(198, 90, 90, 0.26);
}

.upkeep-button--theme-info {
  --upkeep-button-fill: var(--info);
  --upkeep-button-fill-hover: var(--color-accent-hover);
  --upkeep-button-fill-active: var(--color-accent-active);
  --upkeep-button-ink: var(--brand-teal-dark);
  --upkeep-button-soft: var(--info-bg);
  --upkeep-button-focus: rgba(143, 189, 177, 0.3);
}

.upkeep-button--primary {
  border-color: var(--upkeep-button-fill);
  background: var(--upkeep-button-fill);
  color: var(--upkeep-button-ink);
  box-shadow: 0 8px 18px rgba(0, 165, 148, 0.16);
}

.upkeep-button--primary:hover,
.upkeep-button--primary:focus-visible {
  border-color: var(--upkeep-button-fill-hover);
  background: var(--upkeep-button-fill-hover);
  color: var(--upkeep-button-ink);
}

.upkeep-button--primary:active {
  border-color: var(--upkeep-button-fill-active);
  background: var(--upkeep-button-fill-active);
}

.upkeep-button--secondary {
  border-color: var(--upkeep-button-fill);
  background: transparent;
  color: var(--upkeep-button-fill);
}

.upkeep-button--secondary:hover,
.upkeep-button--secondary:focus-visible {
  background: var(--upkeep-button-soft);
  color: var(--upkeep-button-fill-hover);
}

.upkeep-button--tertiary {
  border-color: transparent;
  background: transparent;
  color: var(--upkeep-button-fill);
  box-shadow: none;
}

.upkeep-button--tertiary:hover,
.upkeep-button--tertiary:focus-visible {
  background: var(--upkeep-button-soft);
  color: var(--upkeep-button-fill-hover);
}

.upkeep-button:hover,
.upkeep-button:focus-visible {
  transform: translateY(-1px);
}

.upkeep-button:focus-visible {
  outline: 0;
  box-shadow: 0 0 0 3px var(--upkeep-button-focus);
}

.upkeep-button--small {
  min-height: 2.25rem;
  padding: 0.45rem 0.85rem;
  font-size: 0.875rem;
}

.upkeep-button--large {
  min-height: 3.125rem;
  padding: 0.8rem 1.35rem;
}

.upkeep-button--icon-only {
  width: 2.75rem;
  min-width: 2.75rem;
  padding: 0;
}

.upkeep-button--small.upkeep-button--icon-only {
  width: 2.25rem;
  min-width: 2.25rem;
}

.upkeep-button--large.upkeep-button--icon-only {
  width: 3.125rem;
  min-width: 3.125rem;
}

.upkeep-button--disabled {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
}

.upkeep-button.justify-start {
  justify-content: flex-start;
}

.upkeep-button__icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  line-height: 1;
}

.upkeep-button__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

html[data-theme="dark"] .upkeep-button--theme-success {
  --upkeep-button-soft: var(--success-bg-dark);
}

html[data-theme="dark"] .upkeep-button--theme-secondary {
  --upkeep-button-fill: var(--dark-text);
  --upkeep-button-fill-hover: #ffffff;
  --upkeep-button-fill-active: var(--brand-sage);
  --upkeep-button-soft: rgba(183, 206, 195, 0.12);
  --upkeep-button-focus: rgba(183, 206, 195, 0.24);
}

html[data-theme="dark"] .upkeep-button--theme-warning {
  --upkeep-button-soft: var(--warning-bg-dark);
}

html[data-theme="dark"] .upkeep-button--theme-danger {
  --upkeep-button-soft: var(--danger-bg-dark);
}

html[data-theme="dark"] .upkeep-button--theme-info {
  --upkeep-button-soft: var(--info-bg-dark);
}
</style>
