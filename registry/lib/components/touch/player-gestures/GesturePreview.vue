<template>
  <div class="gesture-preview" :class="{ opened }">
    <div class="gesture-preview-content">
      <div class="brightness">
        <ProgressRing :size="100" :progress="preview.brightness * 100" />
        <div class="label">
          <div class="name">亮度</div>
          <div class="value">
            {{ percent(preview.brightness) }}
          </div>
        </div>
      </div>
      <div class="progress">
        <div class="videoshot" :style="videoshotStyle" />
        <div v-show="preview.progress !== null" class="preview">
          <div v-if="!progressNaN" class="diff">
            {{ progressDiff(preview.progress - store.progress) }}
          </div>
          <div class="seek-mode">
            {{ !progressNaN ? preview.seekMode : '取消调整' }}
          </div>
        </div>
        <div v-show="preview.progress === null" class="name">进度</div>
        <div class="progress-label">
          {{ progress(progressValid ? preview.progress : store.progress) }}
        </div>
      </div>
      <div class="volume">
        <ProgressRing :size="100" :progress="preview.volume * 100" />
        <div class="label">
          <div class="name">音量</div>
          <div class="value">
            {{ percent(preview.volume) }}
          </div>
        </div>
      </div>
    </div>
    <div class="progress-bar">
      <ProgressBar
        :progress="progressValid ? preview.progress : store.progress"
        :max="video.duration"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ProgressBar, ProgressRing } from '@/ui'
import { fixed } from '@/core/utils'
import { formatPercent, formatDuration } from '@/core/utils/formatters'
import { GesturePreviewParams, ProgressSeekMode } from './gesture-preview'
import { Videoshot } from './videoshot'
import { syncVolumeUI } from './volume'

/**
 * 将秒数转为中文时间的小函数
 * @param sec 秒数
 */
const secondsToTime = (sec: number) => {
  sec = Math.abs(sec)
  const hours = Math.floor(sec / 3600)
  const minutes = Math.floor((sec - hours * 3600) / 60)
  const seconds = sec - hours * 3600 - minutes * 60

  let result = `${fixed(seconds)}秒`
  if (minutes > 0) {
    result = `${minutes}分${result}`
  }
  if (hours > 0) {
    result = `${hours}时${result}`
  }

  return result
}

const normalize = (current: number, add: number, max = 1, min = 0) => {
  const finalValue = current + add
  if (finalValue > max) {
    return max
  }
  if (finalValue < min) {
    return min
  }
  return finalValue
}

const opened = ref(false)
const video = ref<HTMLVideoElement | null>(null)
const videoshot = new Videoshot()
const videoshotStyle = ref({})

const defaultStore = {
  progress: 0,
  brightness: 1,
  volume: 0.66,
}

const store = reactive({ ...defaultStore })

const preview = reactive({
  ...defaultStore,
  /**
   * - `null`: 未在调整时间
   * - `number`: 预览即将跳跃到的时间
   * - `NaN`: 取消时间调整
   */
  progress: null as number | null,
  seekMode: ProgressSeekMode.Fast,
})

const progressNaN = computed(() => Number.isNaN(preview.progress))
const progressNull = computed(() => preview.progress === null)
const progressValid = computed(() => !progressNaN.value && !progressNull.value)

const percent = formatPercent
const progress = (p: number) => formatDuration(p, 1)
const progressDiff = (diff: number) => {
  const symbol = diff > 0 ? '+' : '-'
  return `${symbol}${secondsToTime(diff)}`
}

const apply = async ({ brightness, volume, progress: progressParam }: GesturePreviewParams) => {
  const videoElement = video.value
  if (!videoElement) {
    return
  }
  if (brightness !== undefined) {
    const { setBrightness } = await import('./brightness')
    setBrightness(videoElement, preview.brightness)
  } else if (volume !== undefined) {
    const { setVolume } = await import('./volume')
    setVolume(videoElement, preview.volume)
  } else if (progressParam !== undefined) {
    const { setProgress } = await import('./progress')
    setProgress(videoElement, progressParam)
  }
}

const sync = () => {
  const videoElement = dq('video') as HTMLVideoElement
  video.value = videoElement
  store.volume = videoElement.volume
  store.progress = videoElement.currentTime
  store.brightness = (() => {
    if (videoElement.style.filter) {
      const match = videoElement.style.filter.match(/brightness\((.+)\)/)
      if (match) {
        return parseFloat(match[1])
      }
      return 1
    }
    return 1
  })()
  Object.assign(preview, { ...preview, ...store, progress: null })
}

const startPreview = ({ brightness, volume, progress: progressParam }: GesturePreviewParams) => {
  opened.value = true
  if (progressParam !== undefined) {
    preview.progress = normalize(store.progress, progressParam, video.value?.duration || 0)
    const videoshotInstance = videoshot as Videoshot
    videoshotInstance.getVideoshot(preview.progress as number).then(style => {
      videoshotStyle.value = style
    })
  } else {
    if (brightness !== undefined) {
      preview.brightness = normalize(store.brightness, brightness, Infinity)
    } else if (volume !== undefined) {
      preview.volume = normalize(store.volume, volume)
    }
    apply({ brightness, volume })
  }
}

const cancelPreview = () => {
  preview.progress = NaN
}

const endPreview = () => {
  if (!unsafeWindow.touchGestureDebug) {
    opened.value = false
  }
  if (store.volume !== preview.volume) {
    syncVolumeUI(preview.volume)
  }
  if (Number.isNaN(preview.progress)) {
    preview.progress = null
    return
  }
  if (store.progress !== preview.progress && preview.progress !== null) {
    apply({ progress: preview.progress })
  }
}

sync()

defineExpose({
  startPreview,
  cancelPreview,
  endPreview,
  sync,
  preview,
})
</script>
<style lang="scss">
@import 'common';
.gesture-preview {
  color: #fff;
  background-color: rgba(0, 0, 0, 0.8);
  font-size: 16px;
  @include round-corner();
  width: 100%;
  height: 100%;
  max-width: 400px;
  max-height: 150px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%) scale(0.95);
  opacity: 0;
  transition: 0.2s ease-out;
  display: flex;
  flex-direction: column;
  z-index: 11;
  padding: 4px 6px;
  box-sizing: border-box;
  pointer-events: none;
  &.opened {
    transform: translateX(-50%) translateY(-50%) scale(1);
    opacity: 1;
  }
  &-content {
    @include h-center();
    justify-content: space-between;
    flex: 1 0 auto;
    .brightness,
    .volume {
      position: relative;
      flex: 0 0 auto;
      margin: 0 12px;
      .label {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
        white-space: nowrap;
        @include v-center();
        .name {
          color: #aaa;
          margin-bottom: 6px;
        }
      }
    }
    .progress {
      @include v-center();
      flex: 1 0 auto;
      align-self: flex-end;
      .videoshot {
        height: 70px;
        width: 120px;
        margin-bottom: 8px;
        border-radius: 4px;
      }
      .name {
        color: #aaa;
        padding: 4px 6px;
        margin-bottom: 6px;
      }
      .progress-label {
        margin-bottom: 12px;
      }
      .preview {
        @include h-center();
        margin-bottom: 6px;
        .diff {
          color: var(--theme-color);
          margin-right: 6px;
        }
        .seek-mode {
          padding: 4px 6px;
          border-radius: 4px;
          background-color: #8884;
        }
      }
    }
  }
}
</style>
