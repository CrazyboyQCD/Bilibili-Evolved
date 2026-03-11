<template>
  <div class="fresh-home-trending">
    <div class="fresh-home-header">
      <div class="fresh-home-header-title">
        {{ title }}
      </div>
      <div class="fresh-home-header-pagination">
        <VButton icon title="刷新" @click="reload">
          <VIcon icon="mdi-refresh" :size="18" />
        </VButton>
        <VButton icon title="上一页" @click="videoList.offsetPage(-1)">
          <VIcon icon="left-arrow" :size="20" />
        </VButton>
        <VButton icon title="下一页" @click="videoList.offsetPage(1)">
          <VIcon icon="right-arrow" :size="20" />
        </VButton>
      </div>
    </div>
    <div class="fresh-home-trending-content">
      <VideoList ref="videoList" :videos="videos" :loading="loading" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'
import { VButton, VIcon } from '@/ui'
import VideoList from '../../VideoList.vue'
import { freshHomeOptions } from '../../options'
import { getTrendingVideos } from '../../../trending'

const videos = ref([])
const loading = ref(true)

const videoList = useTemplateRef('videoList')

const title = computed(() => {
  if (freshHomeOptions.personalized) {
    return '推荐'
  }
  return '热门'
})

const reload = async () => {
  loading.value = true
  videos.value = []
  videos.value = await getTrendingVideos(freshHomeOptions.personalized).finally(() => {
    loading.value = false
  })
}

reload()
</script>
<style lang="scss">
@import 'common';

.fresh-home-trending {
  @include v-stretch();
  &-content {
    flex-grow: 1;
    display: flex;
    margin: -12px;
  }
}
</style>
