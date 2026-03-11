<template>
  <div class="download-danmaku-config download-video-config-section">
    <div class="download-video-config-item">
      <div class="download-video-config-title">弹幕:</div>
      <VDropdown :value="type" :items="items" @change="type = $event">
        <template #item="{ item }">
          {{ item }}
        </template>
      </VDropdown>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue'
import { getComponentSettings } from '@/core/settings'
import { VDropdown } from '@/ui'
import { DanmakuDownloadType } from './utils'
import { DownloadVideoOptions } from '../../download'

interface Options extends DownloadVideoOptions {
  danmakuType: DanmakuDownloadType | '无'
  [k: string]: any
}
const { options } = getComponentSettings<Options>('downloadVideo')

const type = ref<DanmakuDownloadType | '无'>(options.danmakuType ?? '无')
const items: (DanmakuDownloadType | '无')[] = ['无', 'ass', 'json', 'xml']

const enable = computed(() => type.value !== '无')
watch(type, (newValue: DanmakuDownloadType | '无') => {
  options.danmakuType = newValue
})
const attrs = useAttrs() as { name: string }
defineExpose({
  type,
  enable,
  attrs,
})
</script>
<style lang="scss">
.download-danmaku-config.download-video-config-section {
  .be-dropdown {
    text-transform: uppercase;
  }
}
</style>
