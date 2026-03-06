<template>
  <div class="minimal-home-tab" :class="{ loading, loaded, error }">
    <div class="minimal-home-tab-cards">
      <VideoCard v-for="c of cards" :key="c.id" :data="c" />
    </div>
    <VEmpty v-if="!loading && cards.length === 0" />
    <VLoading v-if="loading && cards.length === 0" />
    <MinimalHomeOperations v-if="cards.length > 0" @refresh="loadCards" />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { VideoCard } from '@/components/feeds/video-card'
// import VideoCardComponent from '@/components/feeds/VideoCard.vue'
import { logError } from '@/core/utils/log'
// import { ascendingStringSort } from '@/core/utils/sort'
import { VEmpty, VLoading } from '@/ui'
import { getTrendingVideos } from '../../trending'
import MinimalHomeOperations from '../MinimalHomeOperations.vue'
import { minimalHomeOptions } from '../options'

const loading = ref(true)
const cards = ref<VideoCard[]>([])
const error = ref(false)

const loaded = computed(() => !loading.value && !error.value)

// const lastID = computed(() => {
//   if (!cards.value.length) {
//     return null
//   }
//   const cardsList: VideoCard[] = [...cards.value]
//   return cardsList.sort(ascendingStringSort(c => c.id))[0].id
// })

const loadCards = async () => {
  try {
    cards.value = []
    error.value = false
    loading.value = true
    cards.value = await getTrendingVideos(minimalHomeOptions.personalized)
  } catch (err) {
    logError(err)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCards()
})
</script>
