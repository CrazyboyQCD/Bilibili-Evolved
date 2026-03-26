<template>
  <DefaultWidget
    :disabled="disabled"
    name="下载录像"
    icon="mdi-download"
    class="download-live-records"
    @click="download()"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DefaultWidget } from '@/ui'
import { getJson } from '@/core/ajax'
import { Toast } from '@/core/toast'
import { logError } from '@/core/utils/log'

const disabled = ref(false)

const download = async () => {
  try {
    disabled.value = true
    const match = document.URL.replace(window.location.search, '').match(
      /^https:\/\/live\.bilibili\.com\/record\/(.+)/,
    )
    if (!match) {
      logError(new Error(`获取录像ID失败: ${document.URL}`))
      return
    }
    const id = match[1]
    const json = await getJson(
      `https://api.live.bilibili.com/xlive/web-room/v1/record/getLiveRecordUrl?rid=${id}&platform=html5`,
    )
    if (json.code !== 0) {
      logError(new Error(`获取录像链接失败: ${json.message}`))
      return
    }
    const links: string[] = json.data.list.map((it: { url: string }) => it.url)
    Toast.success(
      links.map(l => `<a class="download-link" target="_blank" href="${l}">${l}</a>`).join('\n'),
      '下载录像',
    )
  } finally {
    disabled.value = false
  }
}
</script>
