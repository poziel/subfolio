<script setup>
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import { useI18n } from '../composables/useI18n'
import { useTheme } from '../composables/useTheme'

defineProps({
  compact: {
    type: Boolean,
    default: false
  }
})

const { activeTheme, toggleTheme } = useTheme()
const { locale, languageOptions, setLocale, t } = useI18n()
const languageMenu = ref()

const selectedLanguageLabel = computed(() =>
  languageOptions.value.find((option) => option.value === locale.value)?.label || t('common.language')
)

const languageMenuItems = computed(() =>
  languageOptions.value.map((option) => ({
    label: option.label,
    icon: option.value === locale.value ? 'pi pi-check' : 'pi pi-circle',
    command: () => setLocale(option.value)
  }))
)

const toggleLanguageMenu = (event) => {
  languageMenu.value.toggle(event)
}
</script>

<template>
  <div class="subfolio-header-controls" :class="{ 'subfolio-header-controls--compact': compact }">
    <Button
      type="button"
      :icon="activeTheme === 'dark' ? 'pi pi-sun' : 'pi pi-moon'"
      :aria-label="t('common.theme')"
      severity="secondary"
      outlined
      @click="toggleTheme"
    />
    <Button
      type="button"
      :label="compact ? undefined : selectedLanguageLabel"
      icon="pi pi-language"
      icon-pos="left"
      severity="secondary"
      outlined
      class="subfolio-language-button"
      :aria-label="t('common.language')"
      aria-haspopup="true"
      @click="toggleLanguageMenu"
    />
    <Menu ref="languageMenu" :model="languageMenuItems" popup class="subfolio-language-menu" />
  </div>
</template>
