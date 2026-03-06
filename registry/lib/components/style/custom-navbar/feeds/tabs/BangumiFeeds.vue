<template>
  <div class="bangumi-feeds">
    <VLoading v-if="loading" />
    <VEmpty v-else-if="!loading && cards.length === 0" />
    <template v-else>
      <div class="bangumi-feeds-content">
        <BangumiCard v-for="c of cards" :key="c.id" :is-new="c.new" :data="c" />
      </div>
      <ScrollTrigger v-if="hasMorePage" @trigger="nextPage()" />
    </template>
  </div>
</template>
<script setup lang="ts">
import { feedsCardTypes } from '@/components/feeds/api'
import { VLoading, VEmpty, ScrollTrigger } from '@/ui'
import { isNewID } from '@/components/feeds/notify'
import { type BangumiCard as BangumiCardData } from '@/components/feeds/bangumi-card'
import BangumiCard from '@/components/feeds/BangumiCard.vue'
import { useNextPage } from './next-page'

const { loading, cards, hasMorePage, nextPage } = useNextPage(
  feedsCardTypes.bangumi,
  (card: any): BangumiCardData & { new: boolean } => {
    const pgc = lodash.get(card, 'modules.module_dynamic.major.pgc')
    const author = lodash.get(card, 'modules.module_author')
    return {
      id: card.id_str,
      title: author.name,
      coverUrl: author.face,
      epCoverUrl: pgc.cover,
      epTitle: pgc.title.replace(new RegExp(`^${author.name}：`), ''),
      url: pgc.jump_url,
      get new() {
        return isNewID(this.id)
      },
    }
  },
)
</script>
<style lang="scss">
.bangumi-feeds {
  display: flex;
  flex-direction: column;
  align-items: center;
  .bangumi-feeds-content {
    align-self: stretch;
  }
  .be-scroll-trigger {
    padding-bottom: 12px;
  }
}
</style>
