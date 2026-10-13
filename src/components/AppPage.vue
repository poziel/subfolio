<script setup>
import { inject, onBeforeMount, onBeforeUnmount, useSlots } from 'vue'
import { appShellLayoutKey } from './appShellLayout'

const slots = useSlots()
const appShellLayout = inject(appShellLayoutKey, null)
const pageId = Symbol('app-page')
const hasAppShellLayout = Boolean(appShellLayout)

onBeforeMount(() => {
  appShellLayout?.setHeader(pageId, slots.header)
})

onBeforeUnmount(() => {
  appShellLayout?.clearHeader(pageId)
})
</script>

<template>
  <template v-if="!hasAppShellLayout && $slots.header">
    <slot name="header" />
  </template>
  <slot />
</template>
