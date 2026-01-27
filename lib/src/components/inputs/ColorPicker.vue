<template>
  <div class="ui-color-wrapper">
    <label v-if="label" class="ui-input-label">
      {{ label }}
      <span v-if="required" class="ui-input-required">*</span>
    </label>
    
    <div class="ui-color-container">
      <div class="ui-color-preview-wrapper">
        <label :for="id" class="ui-color-preview">
          <div class="ui-color-preview-color" :style="{ background: modelValue }" />
          <input
            :id="id"
            ref="colorInput"
            type="color"
            :value="hexValue"
            :disabled="disabled"
            class="ui-color-input-native"
            @input="handleNativeInput"
          >
        </label>
        <div v-if="showValue" class="ui-color-value">{{ modelValue }}</div>
      </div>
      
      <div v-if="showInputs" class="ui-color-inputs">
        <div class="ui-color-input-group">
          <div class="ui-color-input-field">
            <label class="ui-color-input-label">HEX</label>
            <input
              type="text"
              :value="hexValue"
              :disabled="disabled"
              class="ui-color-input"
              @input="handleHexInput"
            >
          </div>
        </div>
        
        <div v-if="showRgb" class="ui-color-input-group">
          <div class="ui-color-input-field">
            <label class="ui-color-input-label">R</label>
            <input
              type="number"
              :value="rgb.r"
              :disabled="disabled"
              min="0"
              max="255"
              class="ui-color-input"
              @input="(e) => handleRgbInput('r', e.target.value)"
            >
          </div>
          <div class="ui-color-input-field">
            <label class="ui-color-input-label">G</label>
            <input
              type="number"
              :value="rgb.g"
              :disabled="disabled"
              min="0"
              max="255"
              class="ui-color-input"
              @input="(e) => handleRgbInput('g', e.target.value)"
            >
          </div>
          <div class="ui-color-input-field">
            <label class="ui-color-input-label">B</label>
            <input
              type="number"
              :value="rgb.b"
              :disabled="disabled"
              min="0"
              max="255"
              class="ui-color-input"
              @input="(e) => handleRgbInput('b', e.target.value)"
            >
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="presets.length" class="ui-color-presets">
      <button
        v-for="preset in presets"
        :key="preset"
        type="button"
        class="ui-color-preset"
        :class="{ 'ui-color-preset--active': modelValue === preset }"
        :style="{ background: preset }"
        :disabled="disabled"
        @click="selectPreset(preset)"
      />
    </div>
    
    <span v-if="error" class="ui-input-error-message">{{ error }}</span>
    <span v-else-if="hint" class="ui-input-hint">{{ hint }}</span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  id: {
    type: String,
    default: 'color-picker'
  },
  modelValue: {
    type: String,
    default: '#000000'
  },
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  showValue: {
    type: Boolean,
    default: true
  },
  showInputs: {
    type: Boolean,
    default: true
  },
  showRgb: {
    type: Boolean,
    default: false
  },
  presets: {
    type: Array,
    default: () => []
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

const colorInput = ref(null)

const hexValue = computed(() => {
  if (props.modelValue.startsWith('#')) {
    return props.modelValue
  }
  return rgbToHex(props.modelValue)
})

const rgb = computed(() => {
  return hexToRgb(hexValue.value)
})

const handleNativeInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleHexInput = (event) => {
  let value = event.target.value
  if (!value.startsWith('#')) {
    value = '#' + value
  }
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    emit('update:modelValue', value)
  }
}

const handleRgbInput = (channel, value) => {
  const newRgb = { ...rgb.value }
  newRgb[channel] = Math.max(0, Math.min(255, Number(value)))
  emit('update:modelValue', rgbToHex(`rgb(${newRgb.r}, ${newRgb.g}, ${newRgb.b})`))
}

const selectPreset = (color) => {
  emit('update:modelValue', color)
}

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

const rgbToHex = (rgb) => {
  if (rgb.startsWith('#')) return rgb
  const match = rgb.match(/\d+/g)
  if (!match) return '#000000'
  const [r, g, b] = match
  return '#' + ((1 << 24) + (Number(r) << 16) + (Number(g) << 8) + Number(b)).toString(16).slice(1)
}
</script>
