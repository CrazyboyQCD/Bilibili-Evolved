<template>
  <VButton @mouseover="initPopup()" @click="togglePopup()">
    <slot />
  </VButton>
</template>
<script setup lang="ts">
import { VButton } from '@/ui'
import { initPopup, togglePopup } from './vm'
</script>
