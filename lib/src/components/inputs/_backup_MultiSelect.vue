<template>
  <div ref="root" class="ui-select ui-multi" :class="{ open, disabled: isDisabled, 'drop-up': dropUp }">
    <div
      class="ui-select-trigger"
      role="button"
      :tabindex="isDisabled ? -1 : 0"
      :aria-disabled="isDisabled.toString()"
      :aria-expanded="open.toString()"
      @click="toggle"
      @keydown.enter.prevent="onEnter"
      @keydown.space.prevent="onEnter"
      @keydown.down.prevent="onArrowDown"
      @keydown.up.prevent="onArrowUp"
      @keydown.esc.stop.prevent="close"
    >
      <div class="ui-multi-values">
        <template v-if="selectedOptions.length">
          <span v-for="option in selectedOptions" :key="option.value" class="ui-chip">
            <slot name="selected" :option="option">
              <span class="ui-option">
                <img v-if="option.iconUrl" :src="option.iconUrl" :alt="option.label">
                <span>{{ option.label }}</span>
              </span>
            </slot>
            <button class="ui-chip-remove" type="button" tabindex="-1" @click.stop="remove(option.value)">
              <Icon class="ui-chip-remove-icon" name="close" aria-hidden="true" />
            </button>
          </span>
        </template>
        <span v-else class="ui-select-placeholder">{{ placeholder }}</span>
      </div>
      <Icon class="ui-select-caret" name="chevron" aria-hidden="true" />
    </div>
    <div v-if="open" ref="panel" class="ui-select-panel" role="listbox" aria-multiselectable="true">
      <div v-if="searchable" class="ui-select-search">
        <input
          v-model="searchTerm"
          class="ui-select-search-input"
          type="text"
          placeholder="Search..."
          @keydown.esc.stop.prevent="close"
        >
      </div>
      <div v-for="group in filteredOptions" :key="group.label || 'default'" class="ui-select-group">
        <div v-if="group.label" class="ui-select-group-label">
          <slot name="group" :group="group">{{ group.label }}</slot>
        </div>
        <button
          v-for="option in group.options"
          :key="option.value"
          type="button"
          tabindex="-1"
          class="ui-select-option"
          :class="{ selected: isSelected(option.value), active: option.value === activeValue }"
          @click="toggleValue(option.value)"
        >
          <span class="ui-option-content">
            <slot name="option" :option="option" :selected="isSelected(option.value)">
              <span class="ui-option">
                <img v-if="option.iconUrl" :src="option.iconUrl" :alt="option.label">
                <span>{{ option.label }}</span>
              </span>
            </slot>
          </span>
          <Icon
            v-if="isSelected(option.value)"
            class="ui-option-check"
            name="check"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Icon from '../basic/Icon.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Select...'
  },
  searchable: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const root = ref(null)
const panel = ref(null)
const open = ref(false)
const isDisabled = computed(() => props.disabled)
const searchTerm = ref('')
const dropUp = ref(false)
const activeIndex = ref(-1)

const normalizedOptions = computed(() => {
  if (!Array.isArray(props.options)) {
    return []
  }
  if (props.options.length && props.options[0]?.options) {
    return props.options
  }
  return props.options.length ? [{ label: '', options: props.options }] : []
})

const flatOptions = computed(() => normalizedOptions.value.flatMap((group) => group.options))

const optionMap = computed(() => {
  const map = new Map()
  flatOptions.value.forEach((option) => {
    map.set(option.value, option)
  })
  return map
})

const activeValue = computed(() => {
  if (activeIndex.value < 0) return null
  return flatOptions.value[activeIndex.value]?.value ?? null
})

const selectedOptions = computed(() => {
  return props.modelValue
    .map((value) => optionMap.value.get(value) || { value, label: value })
    .filter((option) => option && option.value)
})

const isSelected = (value) => props.modelValue.includes(value)

const getSearchText = (option) => {
  return [option.label, option.value, option.searchText].filter(Boolean).join(' ').toLowerCase()
}

const filteredOptions = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()
  if (!query) {
    return normalizedOptions.value
  }
  return normalizedOptions.value
    .map((group) => ({
      ...group,
      options: group.options.filter((option) => getSearchText(option).includes(query))
    }))
    .filter((group) => group.options.length)
})

const close = () => {
  open.value = false
  searchTerm.value = ''
  activeIndex.value = -1
}

const toggle = () => {
  if (props.disabled) {
    return
  }
  open.value = !open.value
}

const toggleValue = (value) => {
  if (props.disabled) {
    return
  }
  if (isSelected(value)) {
    emit('update:modelValue', props.modelValue.filter((entry) => entry !== value))
    return
  }
  emit('update:modelValue', [...props.modelValue, value])
}

const setActiveIndex = (nextIndex) => {
  if (!flatOptions.value.length) {
    activeIndex.value = -1
    return
  }
  const bounded = (nextIndex + flatOptions.value.length) % flatOptions.value.length
  activeIndex.value = bounded
}

const ensureOpen = () => {
  if (!open.value) {
    open.value = true
  }
}

const onArrowDown = () => {
  if (props.disabled) return
  ensureOpen()
  setActiveIndex(activeIndex.value + 1)
}

const onArrowUp = () => {
  if (props.disabled) return
  ensureOpen()
  setActiveIndex(activeIndex.value - 1)
}

const onEnter = () => {
  if (props.disabled) return
  ensureOpen()
  if (activeIndex.value >= 0) {
    toggleValue(flatOptions.value[activeIndex.value]?.value)
  }
}

const remove = (value) => {
  if (props.disabled) {
    return
  }
  emit('update:modelValue', props.modelValue.filter((entry) => entry !== value))
}

const onDocumentClick = (event) => {
  if (!root.value) {
    return
  }
  if (!root.value.contains(event.target)) {
    close()
  }
}

const updatePosition = () => {
  if (!root.value || !panel.value) {
    return
  }
  const panelRect = panel.value.getBoundingClientRect()
  const rootRect = root.value.getBoundingClientRect()
  const wouldOverflow = panelRect.bottom > window.innerHeight
  const canFlip = rootRect.top > panelRect.height + 12
  dropUp.value = wouldOverflow && canFlip
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('resize', updatePosition)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('resize', updatePosition)
})

watch(open, async (value) => {
  if (!value) {
    dropUp.value = false
    return
  }
  await nextTick()
  if (activeIndex.value === -1 && flatOptions.value.length) {
    activeIndex.value = 0
  }
  updatePosition()
})
</script>
