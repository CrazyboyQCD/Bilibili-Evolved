<template>
  <div class="be-progress-ring">
    <svg :height="size" :width="size" :style="{ width: size + 'px', height: size + 'px' }">
      <circle
        class="progress"
        :class="{ transition }"
        fill="transparent"
        stroke-linecap="round"
        :stroke-dasharray="circumference + ' ' + circumference"
        :style="{ strokeDashoffset }"
        :stroke-width="stroke"
        :r="radius"
        :cx="size / 2"
        :cy="size / 2"
      />
      <circle
        class="progress-background"
        fill="transparent"
        :stroke-width="stroke"
        :r="radius"
        :cx="size / 2"
        :cy="size / 2"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// https://css-tricks.com/building-progress-ring-quickly/
const {
  size,
  progress = 50,
  stroke = 4,
  min = 0,
  max = 100,
  transition = false,
} = defineProps<{
  size: number
  progress?: number
  stroke?: number
  min?: number
  max?: number
  transition?: boolean
}>()

const radius = size / 2 - stroke
const circumference = radius * 2 * Math.PI

const strokeDashoffset = computed(() => {
  let progressValue = progress
  if (progressValue > max) {
    progressValue = max
  } else if (progressValue < min) {
    progressValue = min
  }
  const percent: number = (progressValue - min) / (max - min)
  return (1 - percent) * circumference
})
</script>

<style lang="scss" scoped>
.be-progress-ring {
  --ring-color: var(--theme-color);
  --ring-background: #8884;
  display: flex;
  svg {
    transform: rotate(-90deg);
    .progress {
      &.transition {
        transition: stroke-dashoffset 0.3s ease-out;
      }
      stroke: var(--ring-color);
    }
    .progress-background {
      stroke: var(--ring-background);
    }
  }
}
</style>
