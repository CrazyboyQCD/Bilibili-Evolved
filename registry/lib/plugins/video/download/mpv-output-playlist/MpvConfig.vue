<template>
  <div class="rpc-config download-video-config-section">
    <div class="profile-dir">
      <div class="profile-item-name">命令路径:</div>
      <TextBox v-model="mpvInfo.dir" @blur="saveInfo" />
    </div>
    <div class="profile-host">
      <div class="profile-item-name">主机:</div>
      <TextBox v-model="mpvInfo.host" @blur="saveInfo" />
    </div>
    <div class="profile-port">
      <div class="profile-item-name">端口:</div>
      <TextBox v-model="mpvInfo.port" @blur="saveInfo" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { getComponentSettings } from '@/core/settings'
import { TextBox } from '@/ui'
import { DownloadVideoOptions } from '../../../../components/video/download'

interface MpvInfo {
  dir: string
  host: string
  port: string
}

const defaultMpvInfo: MpvInfo = {
  dir: 'mpv',
  host: '127.0.0.1',
  port: '50000',
}
const { options: storedMpvInfo } = getComponentSettings<DownloadVideoOptions>('downloadVideo')
const info = { ...defaultMpvInfo, ...storedMpvInfo }

const mpvInfo = ref<MpvInfo>(info)

const saveInfo = () => {
  Object.assign(storedMpvInfo, mpvInfo.value)
}
</script>
<style lang="scss">
@import 'common';
.rpc-config.download-video-config-section {
  @include v-center();
  align-items: stretch;
  > * {
    @include h-center();
    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }
}
</style>
