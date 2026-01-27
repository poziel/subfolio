<template>
  <div class="ui-tabs">
    <div class="ui-tabs-list" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        role="tab"
        :aria-selected="modelValue === tab.value"
        :class="{ 'ui-tabs-tab--active': modelValue === tab.value }"
        class="ui-tabs-tab"
        @click="selectTab(tab.value)"
      >
        <Icon v-if="tab.icon" :name="tab.icon" class="ui-tabs-icon" />
        {{ tab.label }}
      </button>
    </div>
    <div class="ui-tabs-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import Icon from '../basic/Icon.vue'

defineProps({
  modelValue: {
    type: [String, Number],
    required: true
  },
  tabs: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const selectTab = (value) => {
  emit('update:modelValue', value)
}
</script>
