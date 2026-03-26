<template>
  <div class="custom-font-family-extra-options-entry">
    <VButton @mouseover="loadPanel()" @click="togglePanelDisplay()">
      更多选项<VIcon icon="right-arrow" :size="16" />
    </VButton>
  </div>
</template>

<script setup lang="ts">
import { VIcon, VButton } from '@/ui'
import { loadPanel, togglePanelDisplay } from './vm'
</script>

<style lang="scss">
.custom-font-family-extra-options-entry {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
