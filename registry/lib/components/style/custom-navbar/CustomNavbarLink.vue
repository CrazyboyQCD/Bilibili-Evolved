<template>
  <a v-bind="attrs" :target="newTab ? '_blank' : null">
    <slot />
  </a>
</template>
<script setup lang="ts">
import { useAttrs } from 'vue'

const { newTab = true } = defineProps<{
  newTab?: boolean
}>()
const attrs = useAttrs()
</script>
