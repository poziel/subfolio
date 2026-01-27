<!--
  @deprecated This component is deprecated. Use <Select mode="multiple" /> instead.
  This component will be removed in v2.0.0
-->
<template>
  <Select v-bind="$attrs" :model-value="modelValue" mode="multiple" @update:model-value="$emit('update:modelValue', $event)">
    <template v-for="(_, slot) in $slots" #[slot]="props">
      <slot :name="slot" v-bind="props" />
    </template>
  </Select>
</template>

<script setup>
import Select from './Select.vue'

defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

defineEmits(['update:modelValue'])

// Warn in development
if (import.meta.env.DEV) {
  console.warn('[Deprecation Warning] MultiSelect is deprecated. Use <Select mode="multiple" /> instead. This component will be removed in v2.0.0')
}
</script>
