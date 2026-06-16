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
  'subfolio-button',
  `subfolio-button--${props.variant}`,
  `subfolio-button--theme-${props.theme}`,
  props.size ? `subfolio-button--${props.size}` : '',
  {
    'subfolio-button--icon-only': Boolean(visibleIcon.value) && !props.label,
    'subfolio-button--loading': props.loading,
    'subfolio-button--disabled': isUnavailable.value
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
      class="subfolio-button__icon"
      :class="visibleIcon"
      aria-hidden="true"
    />
    <span v-if="label || $slots.default" class="subfolio-button__label">
      <slot>{{ label }}</slot>
    </span>
    <span
      v-if="visibleIcon && iconPos === 'right'"
      class="subfolio-button__icon"
      :class="visibleIcon"
      aria-hidden="true"
    />
  </component>
</template>

<style scoped>
.subfolio-button {
  --subfolio-button-fill: var(--brand-teal);
  --subfolio-button-fill-hover: var(--color-primary-hover);
  --subfolio-button-fill-active: var(--color-primary-active);
  --subfolio-button-ink: #fff;
  --subfolio-button-soft: rgba(0, 165, 148, 0.12);
  --subfolio-button-focus: rgba(0, 165, 148, 0.24);

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

.subfolio-button--theme-secondary {
  --subfolio-button-fill: var(--brand-teal-dark);
  --subfolio-button-fill-hover: #0f2d2a;
  --subfolio-button-fill-active: #0a2421;
  --subfolio-button-ink: #fff;
  --subfolio-button-soft: rgba(23, 60, 57, 0.1);
  --subfolio-button-focus: rgba(23, 60, 57, 0.22);
}

.subfolio-button--theme-success {
  --subfolio-button-fill: var(--success);
  --subfolio-button-fill-hover: var(--color-primary-hover);
  --subfolio-button-fill-active: var(--color-primary-active);
  --subfolio-button-ink: #fff;
  --subfolio-button-soft: var(--success-bg);
  --subfolio-button-focus: rgba(0, 165, 148, 0.24);
}

.subfolio-button--theme-warning {
  --subfolio-button-fill: var(--warning);
  --subfolio-button-fill-hover: var(--color-secondary-hover);
  --subfolio-button-fill-active: var(--color-secondary-active);
  --subfolio-button-ink: var(--brand-teal-dark);
  --subfolio-button-soft: var(--warning-bg);
  --subfolio-button-focus: rgba(215, 175, 114, 0.3);
}

.subfolio-button--theme-danger {
  --subfolio-button-fill: var(--danger);
  --subfolio-button-fill-hover: #ad4646;
  --subfolio-button-fill-active: #943838;
  --subfolio-button-ink: #fff;
  --subfolio-button-soft: var(--danger-bg);
  --subfolio-button-focus: rgba(198, 90, 90, 0.26);
}

.subfolio-button--theme-info {
  --subfolio-button-fill: var(--info);
  --subfolio-button-fill-hover: var(--color-accent-hover);
  --subfolio-button-fill-active: var(--color-accent-active);
  --subfolio-button-ink: var(--brand-teal-dark);
  --subfolio-button-soft: var(--info-bg);
  --subfolio-button-focus: rgba(143, 189, 177, 0.3);
}

.subfolio-button--primary {
  border-color: var(--subfolio-button-fill);
  background: var(--subfolio-button-fill);
  color: var(--subfolio-button-ink);
  box-shadow: 0 8px 18px rgba(0, 165, 148, 0.16);
}

.subfolio-button--primary:hover,
.subfolio-button--primary:focus-visible {
  border-color: var(--subfolio-button-fill-hover);
  background: var(--subfolio-button-fill-hover);
  color: var(--subfolio-button-ink);
}

.subfolio-button--primary:active {
  border-color: var(--subfolio-button-fill-active);
  background: var(--subfolio-button-fill-active);
}

.subfolio-button--secondary {
  border-color: var(--subfolio-button-fill);
  background: transparent;
  color: var(--subfolio-button-fill);
}

.subfolio-button--secondary:hover,
.subfolio-button--secondary:focus-visible {
  background: var(--subfolio-button-soft);
  color: var(--subfolio-button-fill-hover);
}

.subfolio-button--tertiary {
  border-color: transparent;
  background: transparent;
  color: var(--subfolio-button-fill);
  box-shadow: none;
}

.subfolio-button--tertiary:hover,
.subfolio-button--tertiary:focus-visible {
  background: var(--subfolio-button-soft);
  color: var(--subfolio-button-fill-hover);
}

.subfolio-button:hover,
.subfolio-button:focus-visible {
  transform: translateY(-1px);
}

.subfolio-button:focus-visible {
  outline: 0;
  box-shadow: 0 0 0 3px var(--subfolio-button-focus);
}

.subfolio-button--small {
  min-height: 2.25rem;
  padding: 0.45rem 0.85rem;
  font-size: 0.875rem;
}

.subfolio-button--large {
  min-height: 3.125rem;
  padding: 0.8rem 1.35rem;
}

.subfolio-button--icon-only {
  width: 2.75rem;
  min-width: 2.75rem;
  padding: 0;
}

.subfolio-button--small.subfolio-button--icon-only {
  width: 2.25rem;
  min-width: 2.25rem;
}

.subfolio-button--large.subfolio-button--icon-only {
  width: 3.125rem;
  min-width: 3.125rem;
}

.subfolio-button--disabled {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
}

.subfolio-button.justify-start {
  justify-content: flex-start;
}

.subfolio-button__icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  line-height: 1;
}

.subfolio-button__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

html[data-theme="dark"] .subfolio-button--theme-success {
  --subfolio-button-soft: var(--success-bg-dark);
}

html[data-theme="dark"] .subfolio-button--theme-secondary {
  --subfolio-button-fill: var(--dark-text);
  --subfolio-button-fill-hover: #ffffff;
  --subfolio-button-fill-active: var(--brand-sage);
  --subfolio-button-soft: rgba(183, 206, 195, 0.12);
  --subfolio-button-focus: rgba(183, 206, 195, 0.24);
}

html[data-theme="dark"] .subfolio-button--theme-warning {
  --subfolio-button-soft: var(--warning-bg-dark);
}

html[data-theme="dark"] .subfolio-button--theme-danger {
  --subfolio-button-soft: var(--danger-bg-dark);
}

html[data-theme="dark"] .subfolio-button--theme-info {
  --subfolio-button-soft: var(--info-bg-dark);
}
</style>
