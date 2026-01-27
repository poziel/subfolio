<script setup>
import { ref } from 'vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  maxWidth: {
    type: String,
    default: '32rem',
    validator: (value) => {
      // Allow any CSS unit
      return typeof value === 'string'
    }
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

// Track mouse down position to differentiate click from drag
const mouseDownTarget = ref(null)

const handleMouseDown = (e) => {
  mouseDownTarget.value = e.target
}

const handleMouseUp = (e) => {
  // Only close if both mousedown and mouseup happened on the backdrop itself
  // This prevents closing when user drags from inside modal to outside
  if (e.target === e.currentTarget && mouseDownTarget.value === e.currentTarget) {
    if (props.closeOnBackdrop) {
      emit('close')
    }
  }
  mouseDownTarget.value = null
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="ui-modal-backdrop"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
      >
        <div
          class="ui-modal-container"
          :style="{ maxWidth }"
          @mousedown.stop
          @mouseup.stop
        >
          <!-- Header -->
          <div v-if="title || $slots.header || $slots.close !== undefined" class="ui-modal-header">
            <slot name="header">
              <h2 v-if="title" class="ui-modal-title">{{ title }}</h2>
            </slot>
            <slot name="close">
              <button
                type="button"
                class="ui-modal-close"
                aria-label="Close modal"
                @click="$emit('close')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </slot>
          </div>

          <!-- Content -->
          <div class="ui-modal-content">
            <slot />
          </div>

          <!-- Footer (optional) -->
          <div v-if="$slots.footer" class="ui-modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
