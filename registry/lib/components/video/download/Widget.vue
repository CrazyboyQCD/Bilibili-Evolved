<template>
  <div class="multiple-widgets">
    <DefaultWidget
      ref="button"
      name="下载视频"
      icon="mdi-download"
      @mouseover="createDownloadPanel()"
      @click="toggleDownloadPanel()"
    />
  </div>
</template>
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { mountVueComponent } from '@/core/utils'
import { DefaultWidget } from '@/ui'

import type DownloadVideo from './DownloadVideo.vue'

const button = useTemplateRef('button')

let panel: InstanceType<typeof DownloadVideo> | undefined
const createDownloadPanel = async () => {
  if (!panel) {
    const [el, vm] = mountVueComponent(await import('./DownloadVideo.vue'), {
      triggerElement: button.value.root.root as HTMLElement,
    })
    panel = vm
    document.body.appendChild(el)
  }
}
const toggleDownloadPanel = () => {
  if (!panel) {
    return
  }
  panel.open = !panel.open
}
</script>
