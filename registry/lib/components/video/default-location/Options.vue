<template>
  <div class="video-default-location-options">
    <div class="video-default-location-form-line">
      <div class="video-default-location-form-item-not-grow">页面</div>
      <PageTypeSelector
        :page-type="pageType"
        class="video-default-location-form-item-grow"
        @change="onChangePageType"
      />
    </div>

    <div class="video-default-location-vertical-space" />

    <div class="video-default-location-form-line">
      <div class="video-default-location-form-item-not-grow">默认位置</div>
      <TextBox
        :text="defaultLocation"
        class="video-default-location-form-item-grow"
        linear
        change-on-blur
        @change="onChangeDefaultLocation"
      />
    </div>

    <div class="video-default-location-vertical-space" />

    <div class="video-default-location-options-test">
      <ExtendBox :hidden="hiddenAdvance" @change="resetObservePosition">
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
import { pageTypeInfos, getCurrentPageType, type VideoDefaultLocationOptions } from '.'

const maxLocation = 4000

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

const resetObservePosition = (v: boolean) => {
  hiddenAdvance.value = v
  observePosition.value = !v
}

// 启用监视设置面板的开启与关闭，以控制是否监视页面的滚动
const panel = dq('.component-detail-panel')
if (panel) {
  const callback = () => {
    if (panel.classList.contains('open')) {
      resetObservePosition(hiddenAdvance.value)
    } else {
      observePosition.value = false
    }
  }
  const mutationObserver = new MutationObserver(callback)
  const start = () => {
    callback()
    mutationObserver.observe(panel, {
      attributeFilter: ['class'],
      attributes: true,
    })
  }
  const stop = () => mutationObserver.disconnect()

  onMounted(start)

  onUnmounted(stop)
} else {
  console.error("[videoPageOrientation] Could not find element '.component-detail-panel'")
}
</script>

<style lang="scss">
@import 'form';

.video-default-location-options-advanced {
  margin: 8px;
}
</style>
