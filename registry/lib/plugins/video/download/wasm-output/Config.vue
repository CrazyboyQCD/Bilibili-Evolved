<template>
  <div class="wasm-output-config">
    <div class="download-video-config-item" style="flex-wrap: wrap">
      <div class="download-video-config-title">输出格式：</div>
      <VDropdown :value="outputType" :items="outputTypes" @change="outputType = $event">
        <template #item="{ item }">
          {{ item }}
        </template>
      </VDropdown>
      <div class="download-video-config-description" style="width: 100%">
        非特殊需求请保持自动<br />
        指定 MP4 格式若包含无损音频，会将 FLAC 格式的音轨重新编码为 ALAC 格式
      </div>
    </div>
    <div v-if="hasMetadata" class="download-video-config-item" style="flex-wrap: wrap">
      <div class="download-video-config-title">写入元数据：</div>
      <SwitchBox :checked="muxWithMetadata" @change="muxWithMetadata = $event" />
      <div class="download-video-config-description" style="width: 100%">
        支持元数据类型「ffmetadata」
      </div>
    </div>
    <div v-if="hasCover" class="download-video-config-item" style="flex-wrap: wrap">
      <div class="download-video-config-title">附加封面：</div>
      <SwitchBox :checked="attachCover" @change="attachCover = $event" />
      <div v-if="hasMetadata" class="download-video-config-description" style="width: 100%">
        附加封面至 MP4 格式会导致元数据自定义字段失效
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { SwitchBox, VDropdown } from '@/ui'
import { Options, OutputType } from './types'
import { isComponentEnabled, getComponentSettings } from '@/core/settings'
import { DownloadVideoOptions } from '../../../../components/video/download'

const defaultOptions: Options = {
  muxWithMetadata: false,
  attachCover: false,
  outputType: 'auto',
}
const { options: storedOptions } = getComponentSettings<DownloadVideoOptions>('downloadVideo')
const options = { ...defaultOptions, ...storedOptions }

const hasMetadata = isComponentEnabled('saveVideoMetadata')
const hasCover = isComponentEnabled('viewCover')

const muxWithMetadata = ref(hasMetadata && options.muxWithMetadata)
const attachCover = ref(hasCover && options.attachCover)
const outputType = ref<OutputType>(options.outputType)
const outputTypes: OutputType[] = ['auto', 'mp4', 'matroska']

watch(
  [muxWithMetadata, attachCover, outputType],
  ([_muxWithMetadata, _attachCover, _outputType]) => {
    options.muxWithMetadata = _muxWithMetadata
    options.attachCover = _attachCover
    options.outputType = _outputType
    Object.assign(storedOptions, options)
  },
)
</script>
