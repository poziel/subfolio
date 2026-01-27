<template>
  <div class="ui-range-wrapper">
    <label v-if="label" :for="id" class="ui-input-label">
      {{ label }}
    </label>
    
    <div class="ui-range-container">
      <div class="ui-range-header">
        <div v-if="showValue" class="ui-range-value">
          {{ formattedValue }}
        </div>
      </div>
      
      <input
        :id="id"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        :disabled="disabled"
        class="ui-range-input"
        :style="{ '--range-progress': rangeProgress }"
        @input="handleInput"
      >
      
      <div v-if="showMarks && marks.length" class="ui-range-marks">
        <span
          v-for="mark in marks"
          :key="mark.value"
          class="ui-range-mark"
          :class="{ 'ui-range-mark--active': modelValue >= mark.value }"
        >
          {{ mark.label }}
        </span>
      </div>
    </div>
    
    <span v-if="hint" class="ui-input-hint">{{ hint }}</span>
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
    type: Number,
    default: 0
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  },
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showValue: {
    type: Boolean,
    default: true
  },
  showMarks: {
    type: Boolean,
    default: false
  },
  marks: {
    type: Array,
    default: () => []
  },
  formatter: {
    type: Function,
    default: (value) => value
  },
  hint: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const rangeProgress = computed(() => {
  const percentage = ((props.modelValue - props.min) / (props.max - props.min)) * 100
  return `${percentage}%`
})

const formattedValue = computed(() => props.formatter(props.modelValue))

const handleInput = (event) => {
  emit('update:modelValue', Number(event.target.value))
}
</script>
