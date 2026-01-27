<!--
  @deprecated This component is deprecated. Use <Select mode="autocomplete" /> instead.
  This component will be removed in v2.0.0
-->
<template>
  <Select v-bind="$attrs" :model-value="modelValue" mode="autocomplete" @update:model-value="$emit('update:modelValue', $event)">
    <template v-for="(_, slot) in $slots" #[slot]="props">
      <slot :name="slot" v-bind="props" />
    </template>
  </Select>
</template>

<script setup>
import Select from './Select.vue'

defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])

// Warn in development
if (import.meta.env.DEV) {
  console.warn('[Deprecation Warning] AutocompleteSelect is deprecated. Use <Select mode="autocomplete" /> instead. This component will be removed in v2.0.0')
}
</script>
