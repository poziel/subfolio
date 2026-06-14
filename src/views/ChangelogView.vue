<script setup>
import { computed } from 'vue'
import Card from 'primevue/card'
import PublicSiteShell from '../components/PublicSiteShell.vue'
import changelogMarkdown from '../../CHANGELOG.md?raw'

const formatInlineText = (value) => String(value)
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '$1')
    .replace(/\[([^\]]+)]/g, '$1')

const pushParagraph = (blocks, lines) => {
  if (!lines.length) return []
  blocks.push({
    type: 'paragraph',
    text: formatInlineText(lines.join(' '))
  })
  return []
}

const pushList = (blocks, items) => {
  if (!items.length) return []
  blocks.push({
    type: 'list',
    items: items.map((item) => formatInlineText(item))
  })
  return []
}

const changelogBlocks = computed(() => {
  const blocks = []
  let paragraphLines = []
  let listItems = []
  const lines = changelogMarkdown
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => !/^\[[^\]]+]:\s+/.test(line.trim()))

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed) {
      paragraphLines = pushParagraph(blocks, paragraphLines)
      listItems = pushList(blocks, listItems)
      continue
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed)
    if (heading) {
      paragraphLines = pushParagraph(blocks, paragraphLines)
      listItems = pushList(blocks, listItems)
      blocks.push({
        type: `h${heading[1].length}`,
        text: formatInlineText(heading[2])
      })
      continue
    }

    if (trimmed.startsWith('- ')) {
      paragraphLines = pushParagraph(blocks, paragraphLines)
      listItems.push(trimmed.slice(2))
      continue
    }

    listItems = pushList(blocks, listItems)
    paragraphLines.push(trimmed)
  }

  pushParagraph(blocks, paragraphLines)
  pushList(blocks, listItems)

  return blocks
})
</script>

<template>
  <PublicSiteShell>
    <div class="grid gap-10">
      <section class="grid gap-5">
        <h1 class="font-serif text-5xl text-ink md:text-6xl">
          Product updates over time.
        </h1>
        <p class="max-w-3xl text-lg muted-copy">
          Subfolio publishes release notes from the project changelog. The release workflow
          can append new GitHub release versions to the same file that this page renders.
        </p>
      </section>

      <Card>
        <template #content>
          <article class="subfolio-markdown">
            <template v-for="(block, index) in changelogBlocks" :key="`${block.type}-${index}`">
              <h1 v-if="block.type === 'h1'">{{ block.text }}</h1>
              <h2 v-else-if="block.type === 'h2'">{{ block.text }}</h2>
              <h3 v-else-if="block.type === 'h3'">{{ block.text }}</h3>
              <p v-else-if="block.type === 'paragraph'">{{ block.text }}</p>
              <ul v-else-if="block.type === 'list'">
                <li v-for="item in block.items" :key="item">{{ item }}</li>
              </ul>
            </template>
          </article>
        </template>
      </Card>
    </div>
  </PublicSiteShell>
</template>
