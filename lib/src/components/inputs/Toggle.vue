<template>
  <label class="ui-toggle" :class="{ 'ui-toggle--disabled': disabled, 'ui-toggle--checked': modelValue }">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="ui-toggle-input"
      @change="handleChange"
    >
    <span class="ui-toggle-track">
      <span class="ui-toggle-thumb" />
    </span>
    <span v-if="$slots.default" class="ui-toggle-label">
      <slot />
    </span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const handleChange = (event) => {
  emit('update:modelValue', event.target.checked)
}
</script>
