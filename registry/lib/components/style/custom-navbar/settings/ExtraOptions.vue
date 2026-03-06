<template>
  <div class="custom-navbar-extra-options">
    <VButton ref="button" @mouseover="loadNavbarSettingsHandler()" @click="toggleNavbarSettings()">
      布局设置<VIcon icon="right-arrow" :size="16"></VIcon>
    </VButton>
  </div>
</template>
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { VIcon, VButton } from '@/ui'
import { setTriggerElement, loadNavbarSettings, toggleNavbarSettings } from './vm'

const button = useTemplateRef('button')

const loadNavbarSettingsHandler = async () => {
  const isFirstLoad = await loadNavbarSettings()
  if (isFirstLoad) {
    const triggerButton = button.value.root as HTMLElement
    setTriggerElement(triggerButton)
  }
}
</script>
<style lang="scss">
.custom-navbar-extra-options {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
