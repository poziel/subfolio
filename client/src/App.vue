<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from './components/AppShell.vue'

const route = useRoute()

const isAppRoute = computed(() => route.path.startsWith('/app'))
</script>

<template>
  <AppShell v-if="isAppRoute">
    <RouterView />
  </AppShell>
  <RouterView v-else />
</template>
