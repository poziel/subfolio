# @subfolio/vue-components - Examples

## Installation

```bash
npm install @subfolio/vue-components
```

## Basic Setup

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import '@subfolio/vue-components/dist/vue-components.css'

createApp(App).mount('#app')
```

## Example 1: Simple Select (Single Mode)

```vue
<template>
  <div class="container">
    <Select
      v-model="selectedCountry"
      :options="countries"
      placeholder="Select a country"
    />
    <p v-if="selectedCountry">Selected: {{ selectedCountry }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Select } from '@subfolio/vue-components'

const selectedCountry = ref('')
const countries = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'fr', label: 'France' }
]
</script>
```

## Example 2: Searchable Select with Groups

```vue
<template>
  <Select
    v-model="selected"
    :options="groupedOptions"
    placeholder="Select a fruit"
    searchable
  />
</template>

<script setup>
import { ref } from 'vue'
import { Select } from '@subfolio/vue-components'

const selected = ref('')
const groupedOptions = [
  {
    label: 'Citrus',
    options: [
      { value: 'orange', label: 'Orange' },
      { value: 'lemon', label: 'Lemon' },
      { value: 'lime', label: 'Lime' }
    ]
  },
  {
    label: 'Berries',
    options: [
      { value: 'strawberry', label: 'Strawberry' },
      { value: 'blueberry', label: 'Blueberry' },
      { value: 'raspberry', label: 'Raspberry' }
    ]
  }
]
</script>
```

## Example 3: Multi-Select Mode

```vue
<template>
  <div>
    <Select
      v-model="selectedTags"
      :options="tags"
      mode="multiple"
      placeholder="Select tags"
      searchable
    />
    <div class="selected-tags">
      Selected: {{ selectedTags.join(', ') }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Select } from '@subfolio/vue-components'

const selectedTags = ref([])
const tags = [
  { value: 'vue', label: 'Vue.js' },
  { value: 'react', label: 'React' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid.js' }
]
</script>
```

## Example 4: Autocomplete Mode

```vue
<template>
  <Select
    v-model="email"
    :options="emailSuggestions"
    mode="autocomplete"
    placeholder="Enter email address"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { Select } from '@subfolio/vue-components'

const email = ref('')
const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']

const emailSuggestions = computed(() => {
  const [username] = email.value.split('@')
  if (!username) return []
  
  return commonDomains.map(domain => ({
    value: `${username}@${domain}`,
    label: `${username}@${domain}`
  }))
})
</script>
```

## Example 4b: Unified Select - All Three Modes

This example demonstrates how the unified Select component can switch between modes:

```vue
<template>
  <div class="demo-container">
    <h3>Select Mode Demo</h3>
    
    <!-- Mode switcher -->
    <div class="mode-switcher">
      <button 
        v-for="m in modes" 
        :key="m"
        @click="currentMode = m"
        :class="{ active: currentMode === m }"
      >
        {{ m }}
      </button>
    </div>

    <!-- Single unified Select component that adapts -->
    <Select
      v-model="value"
      :options="options"
      :mode="currentMode"
      :placeholder="`${currentMode} mode`"
      searchable
    />

    <div class="output">
      <strong>Selected:</strong> {{ JSON.stringify(value) }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Select } from '@subfolio/vue-components'

const modes = ['single', 'multiple', 'autocomplete']
const currentMode = ref('single')
const value = ref('')

const options = [
  { value: 'vue', label: 'Vue.js' },
  { value: 'react', label: 'React' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' }
]

// Reset value when mode changes
watch(currentMode, (newMode) => {
  value.value = newMode === 'multiple' ? [] : ''
})
</script>

<style scoped>
.demo-container {
  padding: 1.5rem;
  max-width: 400px;
}

.mode-switcher {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.mode-switcher button {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
}

.mode-switcher button.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.output {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}
</style>
```

## Example 5: Modal Dialog

```vue
<template>
  <div>
    <button @click="showDialog = true">Open Modal</button>
    
    <Modal
      :open="showDialog"
      title="Confirm Action"
      @close="showDialog = false"
    >
      <p>Are you sure you want to proceed with this action?</p>
      
      <template #footer>
        <div class="modal-actions">
          <button @click="showDialog = false">Cancel</button>
          <button @click="handleConfirm">Confirm</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Modal } from '@subfolio/vue-components'

const showDialog = ref(false)

const handleConfirm = () => {
  // Handle confirmation
  console.log('Confirmed!')
  showDialog.value = false
}
</script>

<style scoped>
.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
}

button:last-child {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}
</style>
```

## Example 6: Custom Rendering with Slots

```vue
<template>
  <Select
    v-model="selectedUser"
    :options="users"
    placeholder="Select a user"
  >
    <template #selected="{ option }">
      <div class="user-display">
        <img :src="option.avatar" :alt="option.label">
        <span>{{ option.label }}</span>
      </div>
    </template>
    
    <template #option="{ option }">
      <div class="user-option">
        <img :src="option.avatar" :alt="option.label">
        <div>
          <div class="name">{{ option.label }}</div>
          <div class="email">{{ option.email }}</div>
        </div>
      </div>
    </template>
  </Select>
</template>

<script setup>
import { ref } from 'vue'
import { Select } from '@subfolio/vue-components'

const selectedUser = ref('')
const users = [
  {
    value: '1',
    label: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    value: '2',
    label: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://i.pravatar.cc/150?img=2'
  }
]
</script>

<style scoped>
.user-display,
.user-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-display img,
.user-option img {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
}

.email {
  font-size: 0.875rem;
  color: #6b7280;
}
</style>
```

## Customization Example

```scss
// custom-theme.scss
// Override library variables before importing components

// Colors
$color-accent: #3b82f6;
$color-accent-dark: #2563eb;
$color-accent-soft: #dbeafe;

// Typography
$font-family-sans: 'Inter', sans-serif;

// Spacing
$ui-border-radius: 0.5rem;
$ui-padding: 0.625rem 1rem;

// Import the library styles
@import '@subfolio/vue-components/src/styles/index.scss';
```

Then in your main.js:

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import './custom-theme.scss' // Your customized theme

createApp(App).mount('#app')
```

## Using Individual Component Styles

```scss
// Only import what you need
@use '@subfolio/vue-components/src/styles/variables';
@use '@subfolio/vue-components/src/styles/mixins';
@use '@subfolio/vue-components/src/styles/components/select';
@use '@subfolio/vue-components/src/styles/components/modal';
```

## Global Registration

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import SubfolioComponents from '@subfolio/vue-components'
import '@subfolio/vue-components/dist/vue-components.css'

const app = createApp(App)
app.use(SubfolioComponents)
app.mount('#app')
```

Now you can use components without importing them:

```vue
<template>
  <div>
    <Select v-model="value" :options="options" />
    <Select v-model="values" :options="options" mode="multiple" />
    <Modal :open="isOpen" title="Dialog" @close="isOpen = false">
      Content here
    </Modal>
  </div>
</template>
```
