<template>
  <div ref="root" class="ui-select ui-autocomplete" :class="{ open, disabled: isDisabled, 'drop-up': dropUp }">
    <div class="ui-autocomplete-trigger">
      <input
        :id="id"
        v-model="inputValue"
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
    <div v-if="open" ref="panel" class="ui-select-panel" role="listbox">
      <div v-for="group in filteredOptions" :key="group.label || 'default'" class="ui-select-group">
        <div v-if="group.label" class="ui-select-group-label">{{ group.label }}</div>
        <button
          v-for="option in group.options"
          :key="option.value"
          type="button"
          tabindex="-1"
          class="ui-select-option"
          :class="{ selected: option.value === modelValue, active: option.value === activeValue }"
          @click="select(option)"
        >
          <span class="ui-option">
            <img v-if="option.iconUrl" :src="option.iconUrl" :alt="option.label">
            <span>{{ option.label }}</span>
          </span>
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
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Start typing...'
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
const inputValue = ref(props.modelValue)
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

const getSearchText = (option) => {
  return [option.label, option.value, option.searchText].filter(Boolean).join(' ').toLowerCase()
}

const filteredOptions = computed(() => {
  const query = inputValue.value.trim().toLowerCase()
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

const onInput = () => {
  emit('update:modelValue', inputValue.value)
  open.value = true
}

const onFocus = (event) => {
  openPanel()
  const target = event.target
  if (target && target.setSelectionRange) {
    const len = target.value.length
    target.setSelectionRange(len, len)
  }
}

const openPanel = () => {
  if (props.disabled) return
  open.value = true
}

const toggle = () => {
  if (props.disabled) return
  open.value = !open.value
}

const select = (option) => {
  emit('update:modelValue', option.value)
  inputValue.value = option.label || option.value
  close()
}

const close = () => {
  open.value = false
  activeIndex.value = -1
}

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
  openPanel()
  setActiveIndex(activeIndex.value + 1)
}

const onArrowUp = () => {
  if (props.disabled) return
  openPanel()
  setActiveIndex(activeIndex.value - 1)
}

const onEnter = () => {
  if (props.disabled) return
  openPanel()
  if (activeIndex.value >= 0) {
    const option = flatOptions.value[activeIndex.value]
    if (option) {
      select(option)
    }
  }
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

watch(() => props.modelValue, (value) => {
  const matched = flatOptions.value.find((option) => option.value === value)
  inputValue.value = matched ? matched.label : value
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

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('resize', updatePosition)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('resize', updatePosition)
})
</script>
