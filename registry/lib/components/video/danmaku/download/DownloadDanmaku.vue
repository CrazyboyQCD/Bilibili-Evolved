<template>
  <div class="multiple-widgets">
    <DefaultWidget
      :disabled="disabled"
      name="下载弹幕 (XML)"
      icon="danmaku"
      @click="download('xml')"
    />
    <DefaultWidget
      :disabled="disabled"
      name="下载弹幕 (JSON)"
      icon="danmaku"
      @click="download('json')"
    />
    <DefaultWidget
      :disabled="disabled"
      name="下载弹幕 (ASS)"
      icon="danmaku"
      @click="download('ass')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DownloadPackage } from '@/core/download'
import { logError } from '@/core/utils/log'
import { getFriendlyTitle } from '@/core/utils/title'
import { addData } from '@/plugins/data'
import { DefaultWidget } from '@/ui'
import danmakuIcon from './danmaku.svg'
import { DanmakuDownloadType, getBlobByType } from './utils'

addData('ui.icons', (icons: { [key: string]: string }) => {
  icons.danmaku = danmakuIcon
})

const disabled = ref(false)

const download = async (type: DanmakuDownloadType) => {
  try {
    disabled.value = true
    const title = getFriendlyTitle()
    const blob = await getBlobByType(type)
    await DownloadPackage.single(`${title}.${type}`, blob)
  } catch (error) {
    logError(error)
  } finally {
    disabled.value = false
  }
}
</script>
