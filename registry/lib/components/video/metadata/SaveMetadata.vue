<template>
  <div class="multiple-widgets">
    <DefaultWidget
      ref="button"
      :disabled="disabled"
      name="保存视频元数据"
      icon="mdi-download"
      @click="run('ffmetadata')"
    />
    <DefaultWidget
      :disabled="disabled"
      name="保存视频章节"
      icon="mdi-download"
      @click="run('ogm')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DefaultWidget } from '@/ui'
import { logError } from '@/core/utils/log'
import { DownloadPackage } from '@/core/download'
import { getFriendlyTitle } from '@/core/utils/title'
import { generateByType } from './metadata'
import { MetadataType } from './types'

const disabled = ref(false)

const run = async (type: MetadataType) => {
  try {
    disabled.value = true
    DownloadPackage.single(`${getFriendlyTitle(true)}.${type}.txt`, await generateByType(type))
  } catch (error) {
    logError(error)
  } finally {
    disabled.value = false
  }
}
</script>
