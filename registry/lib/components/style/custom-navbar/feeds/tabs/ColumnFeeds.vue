<template>
  <div class="column-feeds">
    <VLoading v-if="loading" />
    <VEmpty v-else-if="!loading && cards.length === 0" />
    <template v-else>
      <div class="columns-feeds-content">
        <ColumnCard v-for="c of cards" :key="c.id" :is-new="c.new" :data="c" />
      </div>
      <ScrollTrigger v-if="hasMorePage" @trigger="nextPage()" />
    </template>
  </div>
</template>
<script setup lang="ts">
import { feedsCardTypes } from '@/components/feeds/api'
import { VLoading, VEmpty, ScrollTrigger } from '@/ui'
import { isNewID } from '@/components/feeds/notify'
import { type ColumnCard as ColumnCardData } from '@/components/feeds/column-card'
import ColumnCard from '@/components/feeds/ColumnCard.vue'
import { useNextPage } from './next-page'

const { loading, cards, hasMorePage, nextPage } = useNextPage(
  feedsCardTypes.column,
  (card: any): ColumnCardData & { new: boolean } => {
    const article = lodash.get(card, 'modules.module_dynamic.major.article')
    const author = lodash.get(card, 'modules.module_author')
    return {
      id: card.id_str,
      cvID: article.id.toString(),
      title: article.title,
      upName: author.name,
      upFaceUrl: author.face,
      upID: author.mid,
      description: article.desc,
      covers: article.covers,
      originalCovers: article.covers,
      get new() {
        return isNewID(this.id)
      },
    }
  },
)
</script>
<style lang="scss">
.column-feeds {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
