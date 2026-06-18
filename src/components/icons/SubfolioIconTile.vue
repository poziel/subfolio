<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: {
    type: [String, Array, Object],
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  shape: {
    type: String,
    default: 'square',
    validator: (value) => ['square', 'circle'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  tone: {
    type: String,
    default: 'brand',
    validator: (value) => ['brand', 'success', 'warning', 'info', 'neutral'].includes(value)
  }
})

const classes = computed(() => [
  'subfolio-icon-tile',
  `subfolio-icon-tile--shape-${props.shape}`,
  `subfolio-icon-tile--size-${props.size}`,
  `subfolio-icon-tile--tone-${props.tone}`
])
</script>

<template>
  <span
    :class="classes"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
  >
    <span :class="icon" class="subfolio-icon-tile__icon" />
  </span>
</template>

<style scoped>
.subfolio-icon-tile {
  --subfolio-icon-tile-size: 2.5rem;
  --subfolio-icon-tile-radius: var(--radius-md);
  --subfolio-icon-tile-bg: rgba(0, 165, 148, 0.12);
  --subfolio-icon-tile-color: var(--brand-teal);

  display: inline-grid;
  width: var(--subfolio-icon-tile-size);
  min-width: var(--subfolio-icon-tile-size);
  aspect-ratio: 1 / 1;
  flex: 0 0 var(--subfolio-icon-tile-size);
  place-items: center;
  border-radius: var(--subfolio-icon-tile-radius);
  background: var(--subfolio-icon-tile-bg);
  color: var(--subfolio-icon-tile-color);
  line-height: 1;
}

.subfolio-icon-tile--shape-circle {
  --subfolio-icon-tile-radius: 999px;
}

.subfolio-icon-tile--size-sm {
  --subfolio-icon-tile-size: 2.25rem;
}

.subfolio-icon-tile--size-lg {
  --subfolio-icon-tile-size: 2.75rem;
}

.subfolio-icon-tile--tone-success {
  --subfolio-icon-tile-bg: rgba(0, 165, 148, 0.14);
  --subfolio-icon-tile-color: var(--success-text);
}

.subfolio-icon-tile--tone-warning {
  --subfolio-icon-tile-bg: rgba(215, 175, 114, 0.18);
  --subfolio-icon-tile-color: var(--warning-text);
}

.subfolio-icon-tile--tone-info {
  --subfolio-icon-tile-bg: rgba(143, 189, 177, 0.18);
  --subfolio-icon-tile-color: var(--info-text);
}

.subfolio-icon-tile--tone-neutral {
  --subfolio-icon-tile-bg: var(--wash-sage);
  --subfolio-icon-tile-color: var(--color-copy-secondary);
}

.subfolio-icon-tile__icon {
  display: inline-grid;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  place-items: center;
  font-size: 1.05rem;
  line-height: 1;
}

.subfolio-icon-tile__icon::before {
  line-height: 1;
}

.subfolio-icon-tile--size-sm .subfolio-icon-tile__icon {
  font-size: 0.95rem;
}

.subfolio-icon-tile--size-lg .subfolio-icon-tile__icon {
  font-size: 1.15rem;
}

:global(html[data-theme="dark"]) .subfolio-icon-tile {
  --subfolio-icon-tile-bg: rgba(0, 165, 148, 0.14);
  --subfolio-icon-tile-color: var(--success-dark);
}

:global(html[data-theme="dark"]) .subfolio-icon-tile--tone-success {
  --subfolio-icon-tile-bg: rgba(0, 165, 148, 0.16);
  --subfolio-icon-tile-color: var(--success-dark);
}

:global(html[data-theme="dark"]) .subfolio-icon-tile--tone-warning {
  --subfolio-icon-tile-bg: rgba(215, 175, 114, 0.14);
  --subfolio-icon-tile-color: var(--warning-dark);
}

:global(html[data-theme="dark"]) .subfolio-icon-tile--tone-info {
  --subfolio-icon-tile-bg: rgba(183, 206, 195, 0.14);
  --subfolio-icon-tile-color: var(--info-dark);
}

:global(html[data-theme="dark"]) .subfolio-icon-tile--tone-neutral {
  --subfolio-icon-tile-bg: rgba(183, 206, 195, 0.1);
  --subfolio-icon-tile-color: var(--dark-text-secondary);
}
</style>
