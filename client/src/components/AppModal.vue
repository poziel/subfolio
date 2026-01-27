<script setup>
import { ref } from 'vue'

defineProps({
  open: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
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
    emit('close')
  }
  mouseDownTarget.value = null
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
      >
        <div
          class="w-full max-w-lg rounded-3xl border border-border-strong bg-white p-6 shadow-elevated"
          @mousedown.stop
          @mouseup.stop
        >
          <!-- Header -->
          <div class="mb-5 flex items-center justify-between">
            <h2 class="font-serif text-xl text-ink">{{ title }}</h2>
            <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-surface-muted hover:text-ink"
              @click="$emit('close')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.2s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
