<template>
  <img
    v-bind="attrs"
    :width="width"
    :height="height"
    :srcset="srcset"
    :src="actualSrc"
    :class="{ placeholder: isPlaceholderActive }"
  />
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, useTemplateRef, useAttrs } from 'vue'
import { getDpiSourceSet } from '@/core/utils'
import { EmptyImageUrl } from '@/core/utils/constants'

const attrs = useAttrs()

const { size, src, intersection, placeholderImage } = defineProps<{
  size: number | { width: number; height: number }
  src: string
  intersection?: IntersectionObserverInit
  placeholderImage?: boolean
}>()

const root = useTemplateRef('root')

const srcset = ref<string | null>(null)
const actualSrc = ref(EmptyImageUrl)
const isPlaceholderActive = ref(false)

const width = computed(() => (typeof size === 'object' ? size.width : size))

const height = computed(() => (typeof size === 'object' ? size.height : size))

const calcSrc = () => {
  const isSourceInvalid = !src || !size
  isPlaceholderActive.value = isSourceInvalid && Boolean(placeholderImage)
  if (isSourceInvalid) {
    srcset.value = null
    if (placeholderImage) {
      actualSrc.value =
        'https://s1.hdslb.com/bfs/static/blive/live-web-center/static/img/no-cover.1ebe4d5.jpg'
    } else {
      actualSrc.value = EmptyImageUrl
    }
    return
  }
  let srcVar = src
  if (srcVar.startsWith('http:')) {
    srcVar = srcVar.replace('http:', 'https:')
  }
  if (src.includes('//static.hdslb.com/images/member/noface.gif')) {
    // 这张图无法缩放
    srcset.value = srcVar
    actualSrc.value = srcVar
    return
  }
  srcset.value = getDpiSourceSet(srcVar, size)
  actualSrc.value = srcVar
}

const sourceChange = () => {
  if (actualSrc.value === EmptyImageUrl || srcset.value === null) {
    return
  }
  calcSrc()
}

watch(
  () => size,
  () => {
    sourceChange()
  },
)

watch(
  () => src,
  () => {
    sourceChange()
  },
)

onMounted(() => {
  const options = {
    rootMargin: '200px',
    ...intersection,
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        calcSrc()
        observer.disconnect()
      }
    })
  }, options)
  if (root.value) {
    observer.observe(root.value)
  }
})
</script>
