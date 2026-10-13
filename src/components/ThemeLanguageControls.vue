<script setup>
import { computed, ref } from 'vue'
import Menu from 'primevue/menu'
import { useI18n } from '../composables/useI18n'
import { useTheme } from '../composables/useTheme'
import UpkeepButton from './UpkeepButton.vue'

defineProps({
  compact: {
    type: Boolean,
    default: false
  },
  showLanguage: {
    type: Boolean,
    default: true
  },
  showTheme: {
    type: Boolean,
    default: true
  }
})

const { activeTheme, setThemePreference } = useTheme()
const { locale, languageOptions, setLocale, t } = useI18n()
const languageMenu = ref()
const languageMenuOpen = ref(false)

const selectedLanguageCode = computed(() => locale.value.toUpperCase())

const languageMenuItems = computed(() =>
  languageOptions.value.map((option) => ({
    label: option.label,
    value: option.value,
    active: option.value === locale.value,
    command: () => setLocale(option.value)
  }))
)

const toggleLanguageMenu = (event) => {
  languageMenu.value.toggle(event)
}
</script>

<template>
  <div class="upkeep-header-controls" :class="{ 'upkeep-header-controls--compact': compact }">
    <UpkeepButton
      v-if="showLanguage"
      type="button"
      :label="selectedLanguageCode"
      icon="pi pi-angle-down"
      icon-pos="right"
      variant="tertiary"
      theme="secondary"
      class="upkeep-language-button"
      :aria-label="t('common.language')"
      aria-haspopup="true"
      :aria-expanded="languageMenuOpen"
      @click="toggleLanguageMenu"
    />
    <Menu
      v-if="showLanguage"
      ref="languageMenu"
      :model="languageMenuItems"
      popup
      class="upkeep-language-menu"
      @show="languageMenuOpen = true"
      @hide="languageMenuOpen = false"
    >
      <template #item="{ item, props }">
        <a
          v-bind="props.action"
          class="upkeep-language-menu__item"
          :class="{ 'upkeep-language-menu__item--active': item.active }"
        >
          {{ item.label }}
        </a>
      </template>
    </Menu>

    <div v-if="showTheme" class="upkeep-theme-toggle" :aria-label="t('common.theme')" role="group">
      <UpkeepButton
        type="button"
        icon="pi pi-sun"
        :aria-label="t('common.light')"
        :aria-pressed="activeTheme === 'light'"
        variant="tertiary"
        theme="secondary"
        class="upkeep-theme-toggle__button"
        :class="{ 'upkeep-theme-toggle__button--active': activeTheme === 'light' }"
        @click="setThemePreference('light')"
      />
      <UpkeepButton
        type="button"
        icon="pi pi-moon"
        :aria-label="t('common.dark')"
        :aria-pressed="activeTheme === 'dark'"
        variant="tertiary"
        theme="secondary"
        class="upkeep-theme-toggle__button"
        :class="{ 'upkeep-theme-toggle__button--active': activeTheme === 'dark' }"
        @click="setThemePreference('dark')"
      />
    </div>
  </div>
</template>
