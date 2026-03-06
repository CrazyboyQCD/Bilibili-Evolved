<template>
  <div ref="root" class="be-scroll-trigger" @click="trigger()">
    <slot>
      <VLoading></VLoading>
    </slot>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, useTemplateRef, defineAsyncComponent } from 'vue'
import { useScopedConsole } from '@/core/utils/log'
import { delay } from '@/core/utils/'

const VLoading = defineAsyncComponent(() => import('./VLoading.vue'))

const { detectViewport = false } = defineProps<{
  detectViewport?: boolean
}>()

const emit = defineEmits<{
  trigger: []
}>()

const root = useTemplateRef('root')

const isFirstLoad = ref(true)
const isViewportTriggerRunning = ref(false)
const parentLoadState = ref<'none' | 'loading' | 'error' | 'loaded'>('none')

/**
 * 当元素顶部位于视口内部时返回为正数，位于视口外部时返回为负数，正好位于视口底部时返回为零。
 * @param element HTML 元素
 * @returns 元素顶部到视口底部的距离
 */
const getElementToViewportBottomDistance = (element: HTMLElement): number => {
  return document.documentElement.clientHeight - element.getBoundingClientRect().top
}

/**
 * 当元素顶部在视口内部时返回 true。
 * 为避免极端情况，当元素顶部到视口底部的距离大于 -20 时同样返回 true。
 * @param element HTML 元素
 * @returns 元素可视情况
 */
const getVisibleStateByViewport = (element: HTMLElement): boolean => {
  return Boolean(getElementToViewportBottomDistance(element) > -20)
}

const setLoadState = (loadState: 'loading' | 'error' | 'loaded') => {
  parentLoadState.value = loadState
}

defineExpose({
  setLoadState,
  resetIsFirstLoad: () => {
    isFirstLoad.value = true
  },
})

const trigger = () => {
  emit('trigger')
}

onMounted(async () => {
  const console = useScopedConsole('ScrollTrigger')
  const element = root.value
  const { visible } = await import('@/core/observer')
  visible(element, async records => {
    if (records.some(r => r.intersectionRatio > 0)) {
      console.log('Intersection Observer trigger')
      trigger()

      if (!detectViewport && !isFirstLoad.value && isViewportTriggerRunning.value) {
        return
      }

      isViewportTriggerRunning.value = true
      while (getVisibleStateByViewport(element)) {
        await delay(500)

        // 需要父组件配合 setLoadState，不然会一直 continue
        // 确认父组件加载状态，等待加载完成后再继续执行，否则会出现多次加载的情况
        if (parentLoadState.value !== 'loaded') {
          continue
        }

        // 再次确认元素可视情况，避免当元素已不可视时仍然触发加载
        if (!getVisibleStateByViewport(element)) {
          break
        }

        console.log('is first load & viewport trigger')
        trigger()
      }
      isFirstLoad.value = false
    }
  })
})
</script>
<style lang="scss">
.be-scroll-trigger {
  cursor: pointer;
}
</style>
