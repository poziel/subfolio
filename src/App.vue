<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from './components/AppShell.vue'
import { useI18n } from './composables/useI18n'
import { useTheme } from './composables/useTheme'

const route = useRoute()
useTheme()
useI18n()

const isAppRoute = computed(() => route.path.startsWith('/app'))
</script>

<template>
  <AppShell v-if="isAppRoute">
    <RouterView />
  </AppShell>
  <RouterView v-else />
</template>
