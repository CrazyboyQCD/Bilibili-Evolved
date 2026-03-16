<template>
  <div class="download-subtitle-config download-video-config-section">
    <div class="download-video-config-item">
      <div class="download-video-config-title">字幕:</div>
      <VDropdown
        :value="type"
        :items="items"
        @change="type = $event as SubtitleDownloadType | '无'"
      >
        <template #item="{ item }">
          {{ item }}
        </template>
      </VDropdown>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, useAttrs } from 'vue'
import { getComponentSettings } from '@/core/settings'
import { VDropdown } from '@/ui'
import { SubtitleDownloadType } from './utils'
import { DownloadVideoOptions } from '../../download'

const { options } = getComponentSettings<
  DownloadVideoOptions & {
    subtitleType: SubtitleDownloadType | '无'
  }
>('downloadVideo')

const type = ref(options.subtitleType ?? '无')
const items = ['无', 'ass', 'json']
const enabled = computed(() => type.value !== '无')
watch(type, newValue => {
  options.subtitleType = newValue
})
const attrs = useAttrs() as { name: string }
defineExpose({
  type,
  enabled,
  attrs,
})
</script>
<style lang="scss">
.download-subtitle-config.download-video-config-section {
  .be-dropdown {
    text-transform: uppercase;
  }
}
</style>
