<template>
  <div class="video-default-location-options">
    <div class="video-default-location-form-line">
      <div class="video-default-location-form-item-not-grow">页面</div>
      <PageTypeSelector
        v-model="pageType"
        class="video-default-location-form-item-grow"
        @change="onChangePageType"
      />
    </div>

    <div class="video-default-location-vertical-space"></div>

    <div class="video-default-location-form-line">
      <div class="video-default-location-form-item-not-grow">默认位置</div>
      <TextBox
        v-model="defaultLocation"
        class="video-default-location-form-item-grow"
        linear
        change-on-blur
        @change="onChangeDefaultLocation"
      />
    </div>

    <div class="video-default-location-vertical-space"></div>

    <div class="video-default-location-options-test">
      <ExtendBox v-model="hiddenAdvance" @change="resetObservePosition">
        <div class="video-default-location-options-advanced">
          <Advanced
            :observe-position="observePosition"
            :location-limit="locationLimit"
            @set-default-location="setDefaultLocation"
          />
        </div>
      </ExtendBox>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { ComponentMetadata } from '@/components/types'
import { getComponentSettings } from '@/core/settings'
import { TextBox } from '@/ui'
import ExtendBox from './ExtendBox.vue'
import Advanced from './Advanced.vue'
import PageTypeSelector from './PageTypeSelector.vue'
import { pageTypeInfos, getCurrentPageType, VideoDefaultLocationOptions } from '.'

const maxLocation = 4000

let panelObserver: {
  start: () => void
  stop: () => void
} | null = null

const stringIntoInt = (value: string): number | null => {
  const num = parseFloat(value)
  if (isNaN(num)) {
    return null
  }
  return Math.round(num)
}

const { componentData } = defineProps<{
  componentData: ComponentMetadata<VideoDefaultLocationOptions>
}>()

const {
  options: { locations },
} = getComponentSettings<VideoDefaultLocationOptions>(componentData)
const currentPageType = (getCurrentPageType() ??
  Object.keys(pageTypeInfos)[0]) as keyof typeof pageTypeInfos

const defaultLocation = ref(String(locations[currentPageType]))
const hiddenAdvance = ref(true)
const observePosition = ref(false)
const locationLimit = ref(maxLocation)
const pageType = ref(currentPageType)

const onChangePageType = (value: keyof typeof pageTypeInfos) => {
  defaultLocation.value = String(locations[value])
  pageType.value = value
}

const setDefaultLocation = (value: number) => {
  locations[pageType.value] = value
  defaultLocation.value = String(value)
}

const onChangeDefaultLocation = (value: string) => {
  let num = stringIntoInt(value)
  if (num === null) {
    setDefaultLocation(0)
  } else {
    num = lodash.clamp(num, 0, maxLocation)
    setDefaultLocation(num)
  }
}

const resetObservePosition = () => {
  observePosition.value = !hiddenAdvance.value
}

// 启用监视设置面板的开启与关闭，以控制是否监视页面的滚动
const setupPanelSwitch = () => {
  const panel = dq('.component-detail-panel')
  if (!panel) {
    console.error("[videoPageOrientation] Could not find element '.component-detail-panel'")
    return
  }

  const callback = () => {
    if (panel.classList.contains('open')) {
      resetObservePosition()
    } else {
      observePosition.value = false
    }
  }
  const mutationObserver = new MutationObserver(callback)
  const options = {
    attributeFilter: ['class'],
    attributes: true,
  }
  panelObserver = {
    start: () => {
      callback()
      mutationObserver.observe(panel, options)
    },
    stop: () => mutationObserver.disconnect(),
  }
}

setupPanelSwitch()

onMounted(() => {
  if (panelObserver) {
    panelObserver.start()
  }
})

onUnmounted(() => {
  if (panelObserver) {
    panelObserver.stop()
  }
})
</script>

<style lang="scss">
@import 'form';

.video-default-location-options-advanced {
  margin: 8px;
}
</style>
