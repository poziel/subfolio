<template>
  <label class="ui-checkbox" :class="{ 'ui-checkbox--disabled': disabled }">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      :indeterminate.prop="indeterminate"
      class="ui-checkbox-input"
      @change="handleChange"
    >
    <span class="ui-checkbox-box">
      <Icon v-if="indeterminate" name="minus" class="ui-checkbox-icon" />
      <Icon v-else-if="modelValue" name="check" class="ui-checkbox-icon" />
    </span>
    <span v-if="$slots.default" class="ui-checkbox-label">
      <slot />
    </span>
  </label>
</template>

<script setup>
import Icon from '../basic/Icon.vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  indeterminate: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const handleChange = (event) => {
  emit('update:modelValue', event.target.checked)
}
</script>
