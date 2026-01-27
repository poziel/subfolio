<template>
  <div class="ui-input-wrapper">
    <label v-if="label" :for="id" class="ui-input-label">
      {{ label }}
      <span v-if="required" class="ui-input-required">*</span>
    </label>
    <div class="ui-input-container" :class="{ 'ui-input--error': error }">
      <span v-if="$slots.prefix || prefix" class="ui-input-prefix">
        <slot name="prefix">{{ prefix }}</slot>
      </span>
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        class="ui-input"
        @input="$emit('update:modelValue', $event.target.value)"
      >
      <span v-if="$slots.suffix || suffix" class="ui-input-suffix">
        <slot name="suffix">{{ suffix }}</slot>
      </span>
    </div>
    <span v-if="error" class="ui-input-error-message">{{ error }}</span>
    <span v-else-if="hint" class="ui-input-hint">{{ hint }}</span>
  </div>
</template>

<script setup>
defineProps({
  id: {
    type: String,
    default: ''
  },
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>
