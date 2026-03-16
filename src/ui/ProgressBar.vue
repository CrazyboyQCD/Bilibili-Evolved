<template>
  <div class="be-progress-bar">
    <div class="progress" :class="{ transition }" :style="{ width }" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const {
  progress = 50,
  min = 0,
  max = 100,
  transition = false,
} = defineProps<{
  progress?: number
  min?: number
  max?: number
  transition?: boolean
}>()

const width = computed(() => {
  let progressValue = progress
  if (progressValue > max) {
    progressValue = max
  } else if (progressValue < min) {
    progressValue = min
  }
  const percent: number = (progressValue - min) / (max - min)
  return `${100 * percent}%`
})
</script>

<style lang="scss" scoped>
.be-progress-bar {
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  height: 4px;
  background-color: #8884;
  border-radius: 2px;
  min-width: 24px;
  overflow: hidden;
  .progress {
    border-radius: 2px;
    background-color: var(--theme-color);
    &.transition {
      transition: width 0.3s ease-out;
    }
  }
}
</style>
