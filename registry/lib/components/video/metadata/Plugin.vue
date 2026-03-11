<template>
  <div class="download-video-config-section">
    <div class="download-video-config-item">
      <div>元数据：</div>
      <VDropdown :value="type" :items="items" @change="type = $event as MetadataType | '无'">
        <template #item="{ item }">
          {{ item }}
        </template>
      </VDropdown>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, useAttrs, watch } from 'vue'
import { VDropdown } from '@/ui'
import { getComponentSettings } from '@/core/settings'
import { MetadataType } from './types'
import { DownloadVideoOptions } from '../download'

const { options } = getComponentSettings<
  DownloadVideoOptions & {
    metadataType: MetadataType | '无'
  }
>('downloadVideo')

const type = ref(options.metadataType ?? '无')
const items = ['无', 'ffmetadata', 'ogm']
const enabled = computed(() => type.value !== '无')
watch(type, value => {
  options.metadataType = value
})
const attrs = useAttrs() as { name: string }
defineExpose({
  type,
  enabled,
  attrs,
})
</script>
