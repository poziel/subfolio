// Basic components
import Button from './components/basic/Button.vue'
import Link from './components/basic/Link.vue'
import Icon from './components/basic/Icon.vue'

// Input components
import Select from './components/inputs/Select.vue'
// Deprecated aliases - will be removed in v2.0.0
import MultiSelect from './components/inputs/MultiSelect.vue'
import AutocompleteSelect from './components/inputs/AutocompleteSelect.vue'
// Other inputs
import Checkbox from './components/inputs/Checkbox.vue'
import Radio from './components/inputs/Radio.vue'
import Toggle from './components/inputs/Toggle.vue'
import Textarea from './components/inputs/Textarea.vue'
import Date from './components/inputs/Date.vue'
import FileInput from './components/inputs/FileInput.vue'
import Range from './components/inputs/Range.vue'
import ColorPicker from './components/inputs/ColorPicker.vue'

// Feedback components
import Modal from './components/feedback/Modal.vue'
import Alert from './components/feedback/Alert.vue'

// Navigation components
import Tabs from './components/navigation/Tabs.vue'

// Data components
import Card from './components/data/Card.vue'

// Layout components
import Container from './components/layout/Container.vue'

// Utility components
import Badge from './components/utilities/Badge.vue'
import Spinner from './components/utilities/Spinner.vue'

// Form components
import Input from './components/forms/Input.vue'

// Import styles
import './styles/index.scss'

// Export components individually
export {
  // Basic
  Button,
  Link,
  Icon,
  
  // Inputs
  Select,
  MultiSelect,
  AutocompleteSelect,
  Checkbox,
  Radio,
  Toggle,
  Textarea,
  Date,
  FileInput,
  Range,
  ColorPicker,
  
  // Feedback
  Modal,
  Alert,
  
  // Navigation
  Tabs,
  
  // Data
  Card,
  
  // Layout
  Container,
  
  // Utilities
  Badge,
  Spinner,
  
  // Forms
  Input
}

// Install function for Vue.use()
export function install(app) {
  // Basic
  app.component('Button', Button)
  app.component('Link', Link)
  app.component('Icon', Icon)
  
  // Inputs
  app.component('Select', Select)
  app.component('MultiSelect', MultiSelect)
  app.component('AutocompleteSelect', AutocompleteSelect)
  app.component('Checkbox', Checkbox)
  app.component('Radio', Radio)
  app.component('Toggle', Toggle)
  app.component('Textarea', Textarea)
  app.component('Date', Date)
  app.component('FileInput', FileInput)
  app.component('Range', Range)
  app.component('ColorPicker', ColorPicker)
  
  // Feedback
  app.component('Modal', Modal)
  app.component('Alert', Alert)
  
  // Navigation
  app.component('Tabs', Tabs)
  
  // Data
  app.component('Card', Card)
  
  // Layout
  app.component('Container', Container)
  
  // Utilities
  app.component('Badge', Badge)
  app.component('Spinner', Spinner)
  
  // Forms
  app.component('Input', Input)
}

// Default export for Vue.use()
export default {
  install
}

// Export version
export const version = '0.2.0'
