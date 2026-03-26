<template>
  <div class="keymap-extra-options">
    <VButton
      ref="button"
      class="keymap-settings-button"
      @mouseover="loadSettings()"
      @click="toggleSettings()"
    >
      <VIcon icon="mdi-keyboard-settings-outline" :size="18" />
      快捷键设置
    </VButton>
  </div>
</template>
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { VButton, VIcon } from '@/ui'
import { loadKeymapSettings, toggleKeymapSettings } from './vm'

const button = useTemplateRef('button')

const loadSettings = async () => {
  await loadKeymapSettings(button.value.root)
}

const toggleSettings = async () => {
  await toggleKeymapSettings(button.value.root)
}
</script>
<style lang="scss">
@import 'common';
.keymap-extra-options {
  @include h-center();
  justify-content: center;
  .keymap-settings-button {
    .be-icon {
      margin-right: 8px;
    }
  }
}
</style>
