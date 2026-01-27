# @subfolio/vue-components

A modern, accessible Vue 3 component library with beautiful, customizable UI components.

## Features

- 🎨 **Fully Customizable** - Built with SASS variables and mixins for easy theming
- ⚡ **Lightweight** - Tree-shakeable with minimal dependencies
- 🎯 **Accessible** - ARIA-compliant components following WAI-ARIA best practices
- 📦 **ESM & UMD** - Support for both modern and legacy build systems
- 🔧 **TypeScript Ready** - Full TypeScript definitions included
- 🎭 **Vue 3 Composition API** - Built with modern Vue 3 patterns

## Installation

```bash
npm install @subfolio/vue-components
```

or

```bash
yarn add @subfolio/vue-components
```

## Usage

### Global Registration

Register all components globally:

```javascript
import { createApp } from 'vue'
import SubfolioComponents from '@subfolio/vue-components'
import '@subfolio/vue-components/styles'

const app = createApp(App)
app.use(SubfolioComponents)
app.mount('#app')
```

### Individual Component Import

Import only the components you need (recommended for tree-shaking):

```javascript
import { Select, Modal } from '@subfolio/vue-components'
import '@subfolio/vue-components/styles'

export default {
  components: {
    Select,
    Modal
  }
}
```

## Components

### Select

A unified, versatile select component that supports three modes: single selection, multi-selection, and autocomplete.

#### Single Select Mode (default)

A dropdown select with search, keyboard navigation, and grouping support.

```vue
<template>
  <Select
    v-model="selected"
    :options="options"
    placeholder="Select an option"
    searchable
  />
</template>

<script setup>
import { ref } from 'vue'
import { Select } from '@subfolio/vue-components'

const selected = ref('')
const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' }
]
</script>
```

#### Multiple Select Mode

Multi-select with chips for selected items.

```vue
<template>
  <Select
    v-model="selected"
    :options="options"
    mode="multiple"
    placeholder="Select multiple"
    searchable
  />
</template>

<script setup>
import { ref } from 'vue'
import { Select } from '@subfolio/vue-components'

const selected = ref([])
const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' }
]
</script>
```

#### Autocomplete Mode

Autocomplete input with dropdown suggestions.

```vue
<template>
  <Select
    v-model="value"
    :options="options"
    mode="autocomplete"
    placeholder="Start typing..."
  />
</template>

<script setup>
import { ref } from 'vue'
import { Select } from '@subfolio/vue-components'

const value = ref('')
const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' }
]
</script>
```

**Props:**

- `modelValue` (String|Number|Array) - The selected value(s)
  - String/Number for `mode="single"` or `mode="autocomplete"`
  - Array for `mode="multiple"`
- `mode` (String) - Selection mode: `'single'` (default), `'multiple'`, or `'autocomplete'`
- `options` (Array) - Array of options `{ value, label, iconUrl?, searchText? }`
- `placeholder` (String) - Placeholder text (default: 'Select...')
- `searchable` (Boolean) - Enable search functionality
- `disabled` (Boolean) - Disable the select

**Slots:**

- `selected` - Custom rendering for selected option (single mode)
- `option` - Custom rendering for each option
- `group` - Custom rendering for group labels (single/multiple modes)

**Migration from Old Components:**

```vue
<!-- ❌ Old way (deprecated but still works) -->
<MultiSelect v-model="tags" :options="opts" />
<AutocompleteSelect v-model="search" :options="opts" />

<!-- ✅ New way (recommended) -->
<Select v-model="tags" :options="opts" mode="multiple" />
<Select v-model="search" :options="opts" mode="autocomplete" />
```

> **Note:** `MultiSelect` and `AutocompleteSelect` components are still available for backwards compatibility but are deprecated. Use `<Select mode="..." />` instead.

### Modal

A flexible modal dialog with customizable header and footer.

```vue
<template>
  <Modal
    :open="isOpen"
    title="Modal Title"
    @close="isOpen = false"
  >
    <p>Modal content goes here</p>
    
    <template #footer>
      <button @click="isOpen = false">Cancel</button>
      <button @click="handleSave">Save</button>
    </template>
  </Modal>
</template>

<script setup>
import { ref } from 'vue'
import { Modal } from '@subfolio/vue-components'

const isOpen = ref(false)

const handleSave = () => {
  // Handle save logic
  isOpen.value = false
}
</script>
```

**Props:**

- `open` (Boolean) - Control modal visibility
- `title` (String) - Modal title
- `maxWidth` (String) - Maximum width (CSS unit)
- `closeOnBackdrop` (Boolean) - Close when clicking backdrop (default: true)

**Slots:**

- `default` - Modal content
- `header` - Custom header content
- `footer` - Footer content (actions, buttons, etc.)
- `close` - Custom close button

### Icon

A simple SVG icon component with built-in icons.

```vue
<template>
  <Icon name="chevron" />
  <Icon name="close" />
  <Icon name="check" />
</template>

<script setup>
import { Icon } from '@subfolio/vue-components'
</script>
```

**Props:**

- `name` (String) - Icon name (chevron, close, check)

## Customization

### Using SASS Variables

You can customize the component styles by overriding SASS variables before importing the library styles.

```scss
// your-variables.scss
$color-accent: #3b82f6;
$color-accent-dark: #2563eb;
$ui-border-radius: 0.5rem;
$font-family-sans: 'Your Custom Font', sans-serif;

// Import library styles
@import '@subfolio/vue-components/src/styles/index.scss';
```

### Available Variables

**Colors:**
- `$color-ink` - Primary text color
- `$color-muted` - Secondary text color
- `$color-accent` - Primary accent color
- `$color-accent-dark` - Darker accent shade
- `$color-accent-soft` - Lighter accent shade
- `$color-surface` - Surface background
- `$color-surface-strong` - Strong surface
- `$color-surface-card` - Card background
- `$color-surface-muted` - Muted surface
- `$color-border` - Border color
- `$color-border-strong` - Strong border

**Typography:**
- `$font-family-sans` - Sans-serif font family
- `$font-family-serif` - Serif font family

**Layout:**
- `$ui-border-radius` - Border radius
- `$ui-border-radius-sm` - Small border radius
- `$ui-padding` - Standard padding
- `$ui-padding-sm` - Small padding

**Effects:**
- `$shadow-card` - Card shadow
- `$shadow-elevated` - Elevated shadow
- `$ui-transition-duration` - Transition duration
- `$ui-transition-timing` - Transition timing function

### Using Mixins

The library provides useful SASS mixins:

```scss
@use '@subfolio/vue-components/src/styles/mixins' as *;

.my-component {
  @include focus-ring;
  @include transition(background, color);
  @include scrollbar;
}
```

**Available Mixins:**
- `focus-ring($color)` - Add focus ring styles
- `transition($properties...)` - Add transition animations
- `disabled-state` - Apply disabled state styles
- `panel-shadow` - Apply panel shadow and border
- `scrollbar($width, $thumb-color)` - Custom scrollbar styles
- `truncate` - Truncate text with ellipsis
- `sr-only` - Screen reader only content

## Individual Component Styles

You can import styles for individual components to reduce bundle size:

```scss
// Import only what you need
@use '@subfolio/vue-components/src/styles/variables';
@use '@subfolio/vue-components/src/styles/mixins';
@use '@subfolio/vue-components/src/styles/components/select';
@use '@subfolio/vue-components/src/styles/components/modal';
```

## Development

### Build the Library

```bash
cd lib
npm install
npm run build
```

This will generate ESM and UMD builds in the `dist` folder.

### Local Development

To test the library locally in your application:

```bash
# In the lib directory
npm link

# In your application directory
npm link @subfolio/vue-components
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Vue 3 Composition API patterns
- Ensure accessibility (ARIA labels, keyboard navigation, focus management)
- Write clear, concise component documentation
- Test components thoroughly
- Maintain consistent code style with ESLint

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/yourusername/subfolio).
