<template>
  <label class="ui-radio" :class="{ 'ui-radio--disabled': disabled }">
    <input
      type="radio"
      :checked="modelValue === value"
      :value="value"
      :disabled="disabled"
      class="ui-radio-input"
      @change="handleChange"
    >
    <span class="ui-radio-circle" />
    <span v-if="$slots.default" class="ui-radio-label">
      <slot />
    </span>
  </label>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: null
  },
  value: {
    type: [String, Number, Boolean],
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const handleChange = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>
