<template>
  <div ref="root" class="ui-select" :class="{ open, disabled: isDisabled, 'drop-up': dropUp }">
    <button
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
      <SvgIcon class="ui-select-caret" name="chevron" aria-hidden="true" />
    </button>
    <div v-if="open" ref="panel" class="ui-select-panel" role="listbox">
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
          :class="{ selected: option.value === modelValue, active: option.value === activeValue }"
          @click="select(option.value)"
        >
          <slot name="option" :option="option" :selected="option.value === modelValue">
            <span class="ui-option">
              <img v-if="option.iconUrl" :src="option.iconUrl" :alt="option.label">
              <span>{{ option.label }}</span>
            </span>
          </slot>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import SvgIcon from './SvgIcon.vue'

const props = defineProps({
  id: {
    type: String,
    default: ''
  },
  modelValue: {
    type: [String, Number],
    default: ''
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

const activeValue = computed(() => {
  if (activeIndex.value < 0) return null
  return flatOptions.value[activeIndex.value]?.value ?? null
})

const selectedOption = computed(() => {
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
    select(flatOptions.value[activeIndex.value]?.value)
  }
}

const select = (value) => {
  emit('update:modelValue', value)
  close()
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
    const selectedIndex = flatOptions.value.findIndex((option) => option.value === props.modelValue)
    activeIndex.value = selectedIndex >= 0 ? selectedIndex : 0
  }
  updatePosition()
})
</script>
