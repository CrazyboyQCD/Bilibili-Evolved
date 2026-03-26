<template>
  <div
    ref="root"
    class="fresh-home-video-list scroll-top scroll-bottom"
    :class="{ 'not-empty': videos.length > 0 }"
  >
    <div ref="content" class="fresh-home-video-list-content">
      <div v-if="videos.length === 0" class="fresh-home-video-list-empty">
        <VLoading v-if="loading" />
        <VEmpty v-else />
      </div>
      <VideoCardWrapper v-for="video of videos" v-else ref="cards" :key="video.id" :data="video" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { watch, onMounted, onBeforeUnmount, useTemplateRef, nextTick } from 'vue'
import { VEmpty, VLoading } from '@/ui'
import { enableHorizontalScroll } from '@/core/horizontal-scroll'
import { addComponentListener } from '@/core/settings'
import VideoCardWrapper from './VideoCardWrapper.vue'
import { setupScrollMask, cleanUpScrollMask } from './scroll-mask'

const { videos = [], loading = true } = defineProps<{
  videos?: any[]
  loading?: boolean
}>()

const content = useTemplateRef('content')
const cards = useTemplateRef('cards')
const root = useTemplateRef('root')

const setupIntersection = async () => {
  await nextTick()
  setupScrollMask({
    container: root.value,
    items: cards.value.map(c => c.root),
  })
}

watch(
  () => videos,
  () => {
    setupIntersection()
  },
)

onBeforeUnmount(() => {
  cleanUpScrollMask([root.value])
})

onMounted(() => {
  const container = content.value
  let cancel: () => void
  addComponentListener(
    'freshHome.horizontalWheelScroll',
    (scroll: boolean) => {
      if (scroll) {
        cancel = enableHorizontalScroll(container)
      } else {
        cancel?.()
      }
    },
    true,
  )
})

const offsetPage = (offset: number) => {
  const container = content.value
  const style = getComputedStyle(container)
  const containerWidth = container.clientWidth
  const wrapperWidth =
    parseFloat(style.getPropertyValue('--card-width')) +
    parseFloat(style.getPropertyValue('--card-padding'))
  const pageWidth = Math.trunc(containerWidth / wrapperWidth) * wrapperWidth
  container.scrollBy(offset * pageWidth, 0)
}
defineExpose({
  offsetPage,
})
</script>
<style lang="scss">
@import 'common';
@import 'effects';

.fresh-home-video-list {
  --card-height: var(--home-content-height);
  --card-width: 200px;
  --card-padding: 12px;
  position: relative;
  display: flex;
  flex: 1 0 0;
  width: 0;
  @include scroll-mask-x(36px, var(--home-base-color));

  &-content {
    @include h-center();
    @include no-scrollbar();
    overscroll-behavior: initial;
    flex: 1;
    min-height: calc(var(--home-content-height) + var(--card-padding) * 2);
  }
  &-empty {
    margin: var(--card-padding);
    border: 2px dashed #8884;
    border-radius: var(--home-card-radius);
    flex-grow: 1;
    align-self: stretch;
    @include h-center();
  }
  &.not-empty &-content {
    scroll-snap-type: x mandatory;
  }
}
</style>
