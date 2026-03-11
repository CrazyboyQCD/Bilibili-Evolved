<template>
  <DefaultWidget
    :disabled="downloading"
    name="下载up主表情包"
    icon="mdi-emoticon-outline"
    @click="download()"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { logError } from '@/core/utils/log'
import { Emoticons } from './emoticons'
import { DownloadPackage } from '@/core/download'
import { Toast } from '@/core/toast'

const downloader = new Emoticons()
const downloading = ref(false)
const roomIdRegex = /^https:\/\/live\.bilibili\.com\/(?:blanc\/)?(\d+)(?:\?.*?)?$/

const download = async () => {
  downloading.value = true
  try {
    const url = window.location.href
    if (url.startsWith('https://live.bilibili.com/')) {
      const rid = roomIdRegex.exec(url)[1]
      const emoticonsArray = await downloader.getEmoticonsArray(rid)
      if (emoticonsArray.length === 0) {
        Toast.info('该up主没有专属表情包', '表情包下载')
        return
      }
      const downloadPromises = await downloader.downloadEmoticons(emoticonsArray)
      const results = await downloader.batchDownload(downloadPromises)
      const dpackage = new DownloadPackage()
      dpackage.noEscape = true
      for (const result of results) {
        if (result !== null) {
          for (const emoticon of result.emoticons) {
            dpackage.add(`${result.pkg_name}/${emoticon.emoji}.png`, emoticon.blob)
          }
        }
      }
      await dpackage.emit(`emoticons-${rid}.zip`)
    }
  } catch (error) {
    Toast.error('下载失败详情查看控制台', '表情包下载')
    logError(error)
  } finally {
    downloading.value = false
  }
}
</script>
