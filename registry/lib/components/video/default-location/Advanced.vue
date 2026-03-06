<template>
  <div>
    <div class="video-default-location-form-line">
      <div class="video-default-location-form-item-not-grow">当前位置</div>
      <TextBox
        class="video-default-location-form-item-grow"
        :text="String(curPosition)"
        change-on-blur
        readonly
        linear
      />
    </div>

    <div class="video-default-location-vertical-space"></div>

    <div class="video-default-location-form-line">
      <VButton
        class="video-default-location-form-item-grow"
        @click="emit('set-default-location', curPosition)"
      >
        将当前位置设为默认值
      </VButton>
    </div>

    <div class="video-default-location-vertical-space"></div>

    <div class="video-default-location-form-line">
      <TextBox
        v-model="locationInput"
        class="video-default-location-form-item-grow"
        linear
        change-on-blur
        @change="onLocationInput"
      />
      <VButton @click="locateTo"> 定位 </VButton>
    </div>

    <div class="video-default-location-vertical-space"></div>

    <div class="video-default-location-form-line">
      <TextBox
        v-model="offsetInput"
        class="video-default-location-form-item-grow"
        linear
        change-on-blur
        @change="onOffsetInput"
      />
      <VButton @click="offsetTo"> 偏移 </VButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { VButton, TextBox } from '@/ui'

let scrollObserver: { start: () => void; stop: () => void } | null = null

const getScrollY = (): number => Math.round(window.scrollY)

const stringIntoInt = (value: string): number | null => {
  const num = parseFloat(value)
  if (isNaN(num)) {
    return null
  }
  return Math.round(num)
}

const { observePosition = false, locationLimit } = defineProps<{
  observePosition?: boolean
  locationLimit: number
}>()

const emit = defineEmits<{
  'set-default-location': [value: number]
}>()

const curPosition = ref(getScrollY())
const locationInput = ref('0')
const offsetInput = ref('0')
const location = ref(0)
const offset = ref(0)

const setLocation = (value: number) => {
  location.value = value
  locationInput.value = String(value)
}

const onLocationInput = (value: string) => {
  let num = stringIntoInt(value)
  if (num === null) {
    setLocation(0)
  } else {
    num = lodash.clamp(num, 0, locationLimit)
    setLocation(num)
  }
}

const locateTo = () => {
  unsafeWindow.scrollTo(0, location.value)
}

const setOffset = (value: number) => {
  offset.value = value
  offsetInput.value = String(value)
}

const onOffsetInput = (value: string) => {
  let num = stringIntoInt(value)
  if (num === null) {
    setOffset(0)
  } else {
    num = lodash.clamp(num, -locationLimit, locationLimit)
    setOffset(num)
  }
}

const offsetTo = () => {
  unsafeWindow.scrollBy(0, offset.value)
}

const setupObserveScroll = () => {
  const updateCurPosition = () => {
    curPosition.value = getScrollY()
  }
  let observing = false
  scrollObserver = {
    start: () => {
      if (!observing) {
        updateCurPosition()
        window.addEventListener('scroll', updateCurPosition)
        observing = true
      }
    },
    stop: () => {
      if (observing) {
        window.removeEventListener('scroll', updateCurPosition)
        observing = false
      }
    },
  }
  watch(
    () => observePosition,
    shouldObserve => scrollObserver?.[shouldObserve ? 'start' : 'stop'](),
    { immediate: true },
  )
}

setupObserveScroll()

onUnmounted(() => {
  scrollObserver?.stop()
})
</script>

<style lang="scss"></style>
