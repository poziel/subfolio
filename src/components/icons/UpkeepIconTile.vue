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
  'upkeep-icon-tile',
  `upkeep-icon-tile--shape-${props.shape}`,
  `upkeep-icon-tile--size-${props.size}`,
  `upkeep-icon-tile--tone-${props.tone}`
])
</script>

<template>
  <span
    :class="classes"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
  >
    <span :class="icon" class="upkeep-icon-tile__icon" />
  </span>
</template>

<style scoped>
.upkeep-icon-tile {
  --upkeep-icon-tile-size: 2.5rem;
  --upkeep-icon-tile-radius: var(--radius-md);
  --upkeep-icon-tile-bg: rgba(0, 165, 148, 0.12);
  --upkeep-icon-tile-color: var(--brand-teal);

  display: inline-grid;
  width: var(--upkeep-icon-tile-size);
  min-width: var(--upkeep-icon-tile-size);
  aspect-ratio: 1 / 1;
  flex: 0 0 var(--upkeep-icon-tile-size);
  place-items: center;
  border-radius: var(--upkeep-icon-tile-radius);
  background: var(--upkeep-icon-tile-bg);
  color: var(--upkeep-icon-tile-color);
  line-height: 1;
}

.upkeep-icon-tile--shape-circle {
  --upkeep-icon-tile-radius: 999px;
}

.upkeep-icon-tile--size-sm {
  --upkeep-icon-tile-size: 2.25rem;
}

.upkeep-icon-tile--size-lg {
  --upkeep-icon-tile-size: 2.75rem;
}

.upkeep-icon-tile--tone-success {
  --upkeep-icon-tile-bg: rgba(0, 165, 148, 0.14);
  --upkeep-icon-tile-color: var(--success-text);
}

.upkeep-icon-tile--tone-warning {
  --upkeep-icon-tile-bg: rgba(215, 175, 114, 0.18);
  --upkeep-icon-tile-color: var(--warning-text);
}

.upkeep-icon-tile--tone-info {
  --upkeep-icon-tile-bg: rgba(143, 189, 177, 0.18);
  --upkeep-icon-tile-color: var(--info-text);
}

.upkeep-icon-tile--tone-neutral {
  --upkeep-icon-tile-bg: var(--wash-sage);
  --upkeep-icon-tile-color: var(--color-copy-secondary);
}

.upkeep-icon-tile__icon {
  display: inline-grid;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  place-items: center;
  font-size: 1.05rem;
  line-height: 1;
}

.upkeep-icon-tile__icon::before {
  line-height: 1;
}

.upkeep-icon-tile--size-sm .upkeep-icon-tile__icon {
  font-size: 0.95rem;
}

.upkeep-icon-tile--size-lg .upkeep-icon-tile__icon {
  font-size: 1.15rem;
}

:global(html[data-theme="dark"]) .upkeep-icon-tile {
  --upkeep-icon-tile-bg: rgba(0, 165, 148, 0.14);
  --upkeep-icon-tile-color: var(--success-dark);
}

:global(html[data-theme="dark"]) .upkeep-icon-tile--tone-success {
  --upkeep-icon-tile-bg: rgba(0, 165, 148, 0.16);
  --upkeep-icon-tile-color: var(--success-dark);
}

:global(html[data-theme="dark"]) .upkeep-icon-tile--tone-warning {
  --upkeep-icon-tile-bg: rgba(215, 175, 114, 0.14);
  --upkeep-icon-tile-color: var(--warning-dark);
}

:global(html[data-theme="dark"]) .upkeep-icon-tile--tone-info {
  --upkeep-icon-tile-bg: rgba(183, 206, 195, 0.14);
  --upkeep-icon-tile-color: var(--info-dark);
}

:global(html[data-theme="dark"]) .upkeep-icon-tile--tone-neutral {
  --upkeep-icon-tile-bg: rgba(183, 206, 195, 0.1);
  --upkeep-icon-tile-color: var(--dark-text-secondary);
}
</style>
