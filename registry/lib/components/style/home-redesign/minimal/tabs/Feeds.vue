<template>
  <div class="minimal-home-tab" :class="{ loading, loaded, error }">
    <div class="minimal-home-tab-cards">
      <VideoCardComponent v-for="c of cards" :key="c.id" :data="c" />
    </div>
    <VEmpty v-if="!loading && cards.length === 0" />
    <ScrollTrigger v-if="!error" ref="scrollTrigger" detect-viewport @trigger="loadCards" />
    <MinimalHomeOperations v-if="cards.length > 0" @refresh="refresh" />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'
import VideoCardComponent from '@/components/feeds/VideoCard.vue'
import { getVideoFeeds } from '@/components/feeds/api'
import { VideoCard } from '@/components/feeds/video-card'
import { logError } from '@/core/utils/log'
import { ascendingStringSort } from '@/core/utils/sort'
import { VEmpty, ScrollTrigger } from '@/ui'
import MinimalHomeOperations from '../MinimalHomeOperations.vue'

const scrollTrigger = useTemplateRef('scrollTrigger')

const loading = ref(true)
const cards = ref<VideoCard[]>([])
const error = ref(false)

const loaded = computed(() => {
  return !loading.value && !error.value
})

const lastID = computed(() => {
  if (!cards.value.length) {
    return null
  }
  const videoCards: VideoCard[] = [...cards.value]
  return videoCards.sort(ascendingStringSort(c => c.id))[0].id
})

const loadCards = async () => {
  try {
    error.value = false
    loading.value = true
    scrollTrigger.value?.setLoadState('loading')
    cards.value = lodash.uniqBy(
      [...cards.value, ...(await getVideoFeeds('video', lastID.value))],
      it => it.id,
    )
  } catch (err) {
    logError(err)
    error.value = true
    scrollTrigger.value?.setLoadState('error')
  } finally {
    loading.value = false
    if (loaded.value) {
      scrollTrigger.value?.setLoadState('loaded')
    }
  }
}

const refresh = async () => {
  cards.value = []
  scrollTrigger.value?.resetIsFirstLoad()
}
</script>
