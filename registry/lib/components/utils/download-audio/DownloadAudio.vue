<template>
  <DefaultWidget
    :disabled="disabled || downloading"
    :name="progress || '下载音频'"
    icon="mdi-download"
    @click="download()"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { select } from '@/core/spin-query'
import { childList } from '@/core/observer'
import { DownloadPackage } from '@/core/download'
import { AudioDownloader } from './audio-downloader'

const progress = ref('')
const disabled = ref(true)
const downloader = new AudioDownloader()
const downloading = ref(false)

onMounted(async () => {
  const app = await select('#app')
  downloader.progress = progressValue => {
    progress.value = `${Math.round(progressValue)}%`
  }
  childList(app, () => {
    const match = document.URL.match(/bilibili\.com\/audio\/au([\d]+)/)
    if (match && match[1]) {
      disabled.value = false
      downloader.sid = match[1]
    } else {
      disabled.value = true
    }
  })
})

const download = async () => {
  if (downloading.value) {
    return
  }
  downloading.value = true
  try {
    if (downloader.sid === null) {
      return
    }
    const blob = await downloader.download()
    const filename = `${(() => {
      const title = document.querySelector('.song-title')
      if (title) {
        return title.getAttribute('title')
      }
      return '神秘音频'
    })()}.mp3`
    progress.value = ''
    await DownloadPackage.single(filename, blob)
  } finally {
    downloading.value = false
  }
}
</script>
