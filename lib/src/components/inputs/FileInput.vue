<template>
  <div class="ui-file-wrapper">
    <label v-if="label" class="ui-input-label">
      {{ label }}
      <span v-if="required" class="ui-input-required">*</span>
    </label>
    
    <input
      :id="id"
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      :required="required"
      class="ui-file-input"
      @change="handleFileChange"
    >
    
    <label
      :for="id"
      class="ui-file-trigger"
      :class="{
        'ui-file--dragging': isDragging,
        'ui-file--has-files': files.length > 0
      }"
      @dragenter.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <div v-if="files.length === 0" class="ui-file-text">
        <Icon name="upload" class="ui-file-icon" />
        <div class="ui-file-label">{{ placeholder || 'Drop files here or click to browse' }}</div>
        <div v-if="hint || accept" class="ui-file-hint">
          {{ hint || `Accepted: ${accept || 'any'}` }}
        </div>
      </div>
      <div v-else class="ui-file-text">
        <Icon name="check" class="ui-file-icon" />
        <div class="ui-file-label">{{ files.length }} file{{ files.length > 1 ? 's' : '' }} selected</div>
        <div class="ui-file-hint">Click to change or drop new files</div>
      </div>
    </label>
    
    <div v-if="files.length > 0 && showFiles" class="ui-file-list">
      <div v-for="(file, index) in files" :key="index" class="ui-file-item">
        <div class="ui-file-item-info">
          <Icon name="file" class="ui-file-item-icon" />
          <div class="ui-file-item-details">
            <div class="ui-file-item-name">{{ file.name }}</div>
            <div class="ui-file-item-size">{{ formatFileSize(file.size) }}</div>
          </div>
        </div>
        <button
          type="button"
          class="ui-file-item-remove"
          @click="removeFile(index)"
        >
          <Icon name="close" />
        </button>
      </div>
    </div>
    
    <span v-if="error" class="ui-input-error-message">{{ error }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Icon from '../basic/Icon.vue'

const props = defineProps({
  id: {
    type: String,
    default: 'file-input'
  },
  modelValue: {
    type: [File, Array],
    default: null
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  accept: {
    type: String,
    default: ''
  },
  multiple: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  showFiles: {
    type: Boolean,
    default: true
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const files = ref([])
const isDragging = ref(false)

const handleFileChange = (event) => {
  const selectedFiles = Array.from(event.target.files)
  files.value = selectedFiles
  emit('update:modelValue', props.multiple ? selectedFiles : selectedFiles[0])
}

const handleDrop = (event) => {
  isDragging.value = false
  if (props.disabled) return
  
  const droppedFiles = Array.from(event.dataTransfer.files)
  files.value = props.multiple ? droppedFiles : [droppedFiles[0]]
  emit('update:modelValue', props.multiple ? files.value : files.value[0])
}

const removeFile = (index) => {
  files.value.splice(index, 1)
  emit('update:modelValue', props.multiple ? files.value : files.value[0] || null)
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>
