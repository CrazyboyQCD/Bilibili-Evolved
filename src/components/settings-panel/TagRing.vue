<template>
  <div class="tag-ring">
    <svg :height="size" :width="size">
      <circle
        v-for="(t, index) of tags"
        :key="t.name"
        class="tag-stroke"
        fill="transparent"
        :stroke-dasharray="circumference + ' ' + circumference"
        :style="getStyle(t, index)"
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
import { ComponentTag } from '../types'

const {
  tags,
  size = 18,
  stroke = 3,
} = defineProps<{
  tags: ComponentTag[]
  size?: number
  stroke?: number
}>()

const radius = computed(() => size / 2 - stroke)
const circumference = computed(() => radius.value * 2 * Math.PI)

const getStyle = (tag: { color: string }, index: number) => {
  const strokeDashoffset = (index / tags.length) * circumference.value
  return {
    strokeDashoffset,
    stroke: tag.color,
  }
}
</script>
<style lang="scss">
.tag-ring {
  display: flex;
  transform: scaleX(-1) rotate(-90deg);
  svg {
    height: 18px;
    width: 18px;
  }
}
</style>
