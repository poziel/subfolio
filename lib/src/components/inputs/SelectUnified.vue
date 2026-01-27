<template>
  <div ref="root" class="ui-select" :class="selectClasses">
    <!-- Autocomplete Mode: Text Input Trigger -->
    <div v-if="isAutocomplete" class="ui-autocomplete-trigger">
      <input
        :id="id"
        v-model="searchTerm"
        class="ui-autocomplete-input"
        type="text"
        :placeholder="placeholder"
        :disabled="isDisabled"
        @focus="onFocus"
        @keydown.down.prevent="onArrowDown"
        @keydown.up.prevent="onArrowUp"
        @keydown.enter.prevent="onEnter"
        @keydown.esc.stop.prevent="close"
        @input="onInput"
      >
      <button
        class="ui-autocomplete-caret"
        type="button"
        tabindex="-1"
        :disabled="isDisabled"
        @click="toggle"
      >
        <Icon class="ui-select-caret" name="chevron" aria-hidden="true" />
      </button>
    </div>

    <!-- Multiple Mode: Chips Display -->
    <div
      v-else-if="isMultiple"
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
        <template v-if="selectedOptionsArray.length">
          <span v-for="option in selectedOptionsArray" :key="option.value" class="ui-chip">
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

    <!-- Single Mode: Button Trigger -->
    <button
      v-else
      :id="id"
      class="ui-select-trigger"
      type="button"
      :disabled="isDisabled"
      :aria-expanded="open.toString()"
      @keydown.down.prevent="onArrowDown"
      @keydown.up.prevent="onArrowUp"
      @keydown.enter.prevent="onEnter"
      @keydown.space.prevent="onEnter"
      @keydown.esc.stop.prevent="close"
      @click="toggle"
    >
      <span v-if="selectedOption" class="ui-select-value">
        <slot name="selected" :option="selectedOption">
          <span class="ui-option">
            <img v-if="selectedOption.iconUrl" :src="selectedOption.iconUrl" :alt="selectedOption.label">
            <span>{{ selectedOption.label }}</span>
          </span>
        </slot>
      </span>
      <span v-else class="ui-select-placeholder">{{ placeholder }}</span>
      <Icon class="ui-select-caret" name="chevron" aria-hidden="true" />
    </button>

    <!-- Dropdown Panel: Shared across all modes -->
    <div v-if="open" ref="panel" class="ui-select-panel" :role="isMultiple ? 'listbox' : 'listbox'" :aria-multiselectable="isMultiple.toString()">
      <!-- Search Input (for non-autocomplete modes when searchable) -->
      <div v-if="searchable && !isAutocomplete" class="ui-select-search">
        <input
          v-model="searchTerm"
          class="ui-select-search-input"
          type="text"
          placeholder="Search..."
          @keydown.esc.stop.prevent="close"
        >
      </div>

      <!-- Options List -->
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
          :class="{ 
            selected: isSelected(option.value), 
            active: option.value === activeValue 
          }"
          @click="selectOption(option.value)"
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
            v-if="isMultiple && isSelected(option.value)"
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
  id: {
    type: String,
    default: ''
  },
  modelValue: {
    type: [String, Number, Array],
    default: () => ''
  },
  mode: {
    type: String,
    default: 'single',
    validator: (value) => ['single', 'multiple', 'autocomplete'].includes(value)
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

// Mode checks
const isMultiple = computed(() => props.mode === 'multiple')
const isAutocomplete = computed(() => props.mode === 'autocomplete')

// Class bindings
const selectClasses = computed(() => ({
  'ui-multi': isMultiple.value,
  'ui-autocomplete': isAutocomplete.value,
  open: open.value,
  disabled: isDisabled.value,
  'drop-up': dropUp.value
}))

// Normalize options structure
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

// Selected option(s) handling
const selectedOption = computed(() => {
  if (isMultiple.value || isAutocomplete.value) return null
  
  if (props.modelValue === '' || props.modelValue === null || props.modelValue === undefined) {
    return null
  }
  return (
    flatOptions.value.find((option) => option.value === props.modelValue) || {
      value: props.modelValue,
      label: String(props.modelValue)
    }
  )
})

const selectedOptionsArray = computed(() => {
  if (!isMultiple.value) return []
  
  const values = Array.isArray(props.modelValue) ? props.modelValue : []
  return values
    .map((value) => optionMap.value.get(value) || { value, label: value })
    .filter((option) => option && option.value)
})

const isSelected = (value) => {
  if (isMultiple.value) {
    const values = Array.isArray(props.modelValue) ? props.modelValue : []
    return values.includes(value)
  }
  return props.modelValue === value
}

// Search and filtering
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

// Panel control
const close = () => {
  open.value = false
  if (!isAutocomplete.value) {
    searchTerm.value = ''
  }
  activeIndex.value = -1
}

const toggle = () => {
  if (props.disabled) {
    return
  }
  open.value = !open.value
}

const ensureOpen = () => {
  if (!open.value) {
    open.value = true
  }
}

// Selection handling
const selectOption = (value) => {
  if (props.disabled) return

  if (isMultiple.value) {
    // Toggle value in array for multiple mode
    const current = Array.isArray(props.modelValue) ? props.modelValue : []
    if (current.includes(value)) {
      emit('update:modelValue', current.filter((entry) => entry !== value))
    } else {
      emit('update:modelValue', [...current, value])
    }
  } else {
    // Set single value and close
    emit('update:modelValue', value)
    
    // For autocomplete, update the input display
    if (isAutocomplete.value) {
      const option = flatOptions.value.find((opt) => opt.value === value)
      if (option) {
        searchTerm.value = option.label || option.value
      }
    }
    
    close()
  }
}

const remove = (value) => {
  if (props.disabled || !isMultiple.value) {
    return
  }
  const current = Array.isArray(props.modelValue) ? props.modelValue : []
  emit('update:modelValue', current.filter((entry) => entry !== value))
}

// Keyboard navigation
const setActiveIndex = (nextIndex) => {
  if (!flatOptions.value.length) {
    activeIndex.value = -1
    return
  }
  const bounded = (nextIndex + flatOptions.value.length) % flatOptions.value.length
  activeIndex.value = bounded
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
  
  if (!open.value) {
    ensureOpen()
    return
  }
  
  if (activeIndex.value >= 0) {
    selectOption(flatOptions.value[activeIndex.value]?.value)
  }
}

// Autocomplete specific handlers
const onInput = () => {
  if (!isAutocomplete.value) return
  emit('update:modelValue', searchTerm.value)
  open.value = true
}

const onFocus = (event) => {
  if (!isAutocomplete.value) return
  open.value = true
  const target = event.target
  if (target && target.setSelectionRange) {
    const len = target.value.length
    target.setSelectionRange(len, len)
  }
}

// Outside click detection
const onDocumentClick = (event) => {
  if (!root.value) {
    return
  }
  if (!root.value.contains(event.target)) {
    close()
  }
}

// Dropdown positioning
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

// Lifecycle
onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('resize', updatePosition)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('resize', updatePosition)
})

// Watchers
watch(open, async (value) => {
  if (!value) {
    dropUp.value = false
    return
  }
  await nextTick()
  if (activeIndex.value === -1 && flatOptions.value.length) {
    if (!isMultiple.value && !isAutocomplete.value) {
      const selectedIndex = flatOptions.value.findIndex((option) => option.value === props.modelValue)
      activeIndex.value = selectedIndex >= 0 ? selectedIndex : 0
    } else {
      activeIndex.value = 0
    }
  }
  updatePosition()
})

// Autocomplete: sync input with model value
watch(() => props.modelValue, (value) => {
  if (!isAutocomplete.value) return
  const matched = flatOptions.value.find((option) => option.value === value)
  searchTerm.value = matched ? matched.label : (value || '')
}, { immediate: true })
</script>
