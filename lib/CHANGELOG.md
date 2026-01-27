# Changelog

All notable changes to @subfolio/vue-components will be documented in this file.

## [0.2.0] - 2026-01-27

### Added
- **Unified Select Component** - New `mode` prop to handle single, multiple, and autocomplete in one component
- **Textarea** - Multi-line text input with character counter
- **Date** - Date/time picker supporting various formats (date, datetime-local, time, month, week)
- **FileInput** - Drag & drop file upload with preview
- **Range** - Slider input with custom marks and value formatting
- **ColorPicker** - Color selector with HEX/RGB inputs and presets

### Changed
- **BREAKING**: Removed "Ui" prefix from all component names (e.g., `UiSelect` → `Select`)
- **Unified Select API**: Merged `Select`, `MultiSelect`, and `AutocompleteSelect` into one `Select` component
  - Use `<Select mode="single" />` for dropdown (default)
  - Use `<Select mode="multiple" />` for multi-select
  - Use `<Select mode="autocomplete" />` for autocomplete
- Reorganized SASS structure to match component folder organization
- Improved bundle size: ESM reduced from 59.49 KB to 53.41 KB

### Deprecated
- **MultiSelect** - Use `<Select mode="multiple" />` instead (backwards compatible wrapper provided)
- **AutocompleteSelect** - Use `<Select mode="autocomplete" />` instead (backwards compatible wrapper provided)

### Migration Guide
```vue
<!-- Old way (still works but deprecated) -->
<UiSelect v-model="value" />
<UiMultiSelect v-model="values" :options="opts" />
<UiAutocompleteSelect v-model="search" :options="opts" />

<!-- New way (recommended) -->
<Select v-model="value" />
<Select v-model="values" :options="opts" mode="multiple" />
<Select v-model="search" :options="opts" mode="autocomplete" />
```

## [0.1.0] - 2026-01-27

### Added
- Initial release of @subfolio/vue-components library
- **UiSelect** - Dropdown select component with search and keyboard navigation
- **UiMultiSelect** - Multi-select component with chips
- **UiAutocompleteSelect** - Autocomplete input with dropdown suggestions
- **UiModal** - Flexible modal dialog component
- **SvgIcon** - Simple SVG icon component
- Full SASS customization support with variables and mixins
- ESM and UMD builds
- Comprehensive documentation in README.md
- TypeScript definitions support

### Components Features
- Full keyboard navigation support (Arrow keys, Enter, Escape)
- Accessible ARIA attributes
- Dropdown position detection (auto flip-up when near viewport bottom)
- Search and filter functionality
- Grouped options support
- Custom slots for rendering
- Disabled states
- Customizable styling through SASS variables

### Styling Features
- SASS variables for colors, typography, spacing, and effects
- Reusable mixins for common patterns
- Individual component style imports
- TailwindCSS compatible
- Modern CSS with custom properties support
