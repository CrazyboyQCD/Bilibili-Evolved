<template>
  <div class="ranking-popup" role="list">
    <div v-for="e of entries" :key="e.name" class="ranking-entry" role="listitem">
      <a target="_blank" :href="e.href">{{ e.name }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePopper, UsePopperProps } from '../mixins'

interface RankingEntry {
  href: string
  name: string
}
const entries: RankingEntry[] = [
  {
    href: 'https://www.bilibili.com/v/popular/all',
    name: '综合热门',
  },
  {
    href: 'https://www.bilibili.com/v/popular/weekly',
    name: '每周必看',
  },
  {
    href: 'https://www.bilibili.com/v/popular/history',
    name: '入站必刷',
  },
  {
    href: 'https://www.bilibili.com/v/popular/rank/all',
    name: '排行榜',
  },
  {
    href: 'https://www.bilibili.com/v/popular/music',
    name: '全站音乐榜',
  },
]

const popper = usePopper(defineProps<UsePopperProps>())
defineExpose({
  popupShow() {
    popper.popupShow()
  },
})
</script>

<style lang="scss" scoped>
@import '../nav-link';
.ranking-popup {
  width: max-content;
  .ranking-entry {
    a {
      @include nav-link();
    }
  }
}
</style>
