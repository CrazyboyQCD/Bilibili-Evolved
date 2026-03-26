<template>
  <div ref="root" class="fresh-home-video-card-wrapper">
    <VideoCard
      :data="attrs.data"
      :orientation="attrs.orientation"
      :show-stats="attrs.showStats"
      :is-new="attrs.isNew"
    />
  </div>
</template>
<script setup lang="ts">
import { useAttrs, useTemplateRef } from 'vue'
import VideoCard from '@/components/feeds/VideoCard.vue'

const attrs = useAttrs() as {
  data: any
  orientation: string
  showStats: boolean
  isNew: boolean
}
const root = useTemplateRef('root')
defineExpose({ root })
</script>
<style lang="scss">
.fresh-home-video-card-wrapper {
  --padding: var(--card-padding, 12px);
  padding: var(--padding) 0;
  padding-left: var(--padding);
  scroll-snap-align: start;
  &:last-child {
    padding-right: var(--padding);
  }
  .video-card {
    border-radius: var(--home-card-radius) !important;
    .cover-container {
      border-radius: calc(var(--home-card-radius) - 1px) calc(var(--home-card-radius) - 1px) 0 0 !important;
    }
    &,
    & * {
      transition: 0.2s ease-out;
    }
  }
}
</style>
