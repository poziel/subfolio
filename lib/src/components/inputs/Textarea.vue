<template>
  <div class="ui-input-wrapper">
    <label v-if="label" :for="id" class="ui-input-label">
      {{ label }}
      <span v-if="required" class="ui-input-required">*</span>
    </label>
    <div class="ui-input-container" :class="{ 'ui-input--error': error }">
      <textarea
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :rows="rows"
        :maxlength="maxLength"
        class="ui-textarea"
        @input="handleInput"
      />
    </div>
    <div v-if="showCounter && maxLength" class="ui-textarea-counter" :class="{ 'ui-textarea-counter--limit': isAtLimit }">
      {{ currentLength }} / {{ maxLength }}
    </div>
    <span v-if="error" class="ui-input-error-message">{{ error }}</span>
    <span v-else-if="hint" class="ui-input-hint">{{ hint }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: {
    type: String,
    default: ''
  },
  modelValue: {
    type: String,
    default: ''
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
  rows: {
    type: Number,
    default: 4
  },
  maxLength: {
    type: Number,
    default: null
  },
  showCounter: {
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
  }
})

const emit = defineEmits(['update:modelValue'])

const currentLength = computed(() => props.modelValue.length)
const isAtLimit = computed(() => props.maxLength && currentLength.value >= props.maxLength)

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>
