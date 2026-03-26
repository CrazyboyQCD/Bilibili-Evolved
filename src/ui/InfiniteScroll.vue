<template>
  <div ref="container" class="be-infinite-scroll">
    <div v-for="item of items" :key="keyMapper(item)" class="infinite-scroll-item">
      <slot :item="item">
        {{ item }}
      </slot>
    </div>
    <div ref="scrollTrigger" class="scroll-trigger" :class="{ end }">
      <slot v-if="!end" name="loading"> 加载中... </slot>
      <slot v-else name="end"> 已经到底啦~ </slot>
    </div>
  </div>
</template>
<script setup lang="ts">
/**
 * @deprecated use ScrollTrigger.vue instead.
 */
import { ref, onMounted, useTemplateRef, nextTick } from 'vue'

const {
  initialItems = [],
  fetchData,
  keyMapper = (item: any) => item as number | string | symbol,
} = defineProps<{
  initialItems?: any[]
  fetchData: (page: number) => Promise<any[] | false>
  keyMapper?: (item: any) => number | string | symbol
}>()

const emit = defineEmits<{
  'next-page': []
  'prev-page': []
}>()

const container = useTemplateRef('container')
const scrollTrigger = useTemplateRef('scrollTrigger')

const items = ref([...initialItems])
const loadingPromise = ref<Promise<any[] | false> | null>(null)
const page = ref(1)
const observer = ref<IntersectionObserver | null>(null)
const end = ref(false)

const loadNextPage = async (pageNum: number = page.value) => {
  try {
    const promise = fetchData(pageNum)
    page.value++
    emit('next-page')
    loadingPromise.value = promise
    const newItems = await promise
    loadingPromise.value = null
    if (newItems === false) {
      observer.value?.disconnect()
      end.value = true
      return
    }
    items.value.push(...newItems)
    await nextTick()
    const scrollTriggerEl = scrollTrigger.value as HTMLElement
    const containerEl = container.value as HTMLElement
    // console.log(
    //   pageNum,
    //   scrollTriggerEl.offsetTop,
    //   containerEl.clientHeight + containerEl.offsetTop
    // )
    if (scrollTriggerEl.offsetTop < containerEl.clientHeight + containerEl.offsetTop) {
      loadNextPage()
    }
  } catch (error) {
    console.error(error)
    page.value--
    emit('prev-page')
    loadNextPage(pageNum)
  }
}

onMounted(() => {
  const scrollTriggerEl = scrollTrigger.value as HTMLElement
  // const containerEl = container.value as HTMLElement
  const obs = new IntersectionObserver(
    lodash.debounce(records => {
      if (records.some(r => r.intersectionRatio > 0)) {
        // console.log('observer')
        loadNextPage()
      }
    }, 100),
  )
  obs.observe(scrollTriggerEl)
  observer.value = obs
})
</script>
<style lang="scss" scoped>
@import './common';
.be-infinite-scroll {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  @include no-scrollbar();
  .infinite-scroll-item {
    @include text-color();
  }
  .scroll-trigger {
    padding: 4px 6px;
    align-self: center;
    color: #888;
  }
}
</style>
