<template>
  <DefaultWidget
    name="画中画"
    icon="mdi-picture-in-picture-bottom-right"
    class="live-pip"
    @click="togglePip()"
  />
</template>

<script setup lang="ts">
import { DefaultWidget } from '@/ui'

const togglePip = async () => {
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture()
  } else {
    ;(dq('video') as HTMLVideoElement)?.requestPictureInPicture()
  }
}
</script>

<style lang="scss">
.live-pip .be-icon {
  transform: scale(0.9);
}
</style>
