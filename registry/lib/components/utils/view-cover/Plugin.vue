<template>
  <div class="download-cover-config download-video-config-section">
    <div class="download-video-config-item">
      <div class="download-video-config-title">封面:</div>
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
import { CoverDownloadType } from './types'
import { DownloadVideoOptions } from '../../video/download'

interface Options extends DownloadVideoOptions {
  CoverType: CoverDownloadType | '无'
  [k: string]: any
}
const { options } = getComponentSettings<Options>('downloadVideo')

const type = ref<CoverDownloadType | '无'>(options.CoverType ?? '无')
const items: (CoverDownloadType | '无')[] = ['无', 'jpg']

const enable = computed(() => type.value !== '无')

watch(type, (newValue: CoverDownloadType | '无') => {
  options.CoverType = newValue
})
const attrs = useAttrs() as { name: string }
defineExpose({
  type,
  enable,
  attrs,
})
</script>
<style lang="scss">
.download-cover-config.download-video-config-section {
  .be-dropdown {
    text-transform: uppercase;
  }
}
</style>
