<template>
  <div>
    <div class="custom-black-list-extra-options">
      <VButton ref="button" @mouseover="loadNameBlackListSettings()" @click="toggleNameSettings()">
        精确匹配列表<VIcon icon="right-arrow" :size="16" />
      </VButton>
    </div>
    <div class="custom-black-list-extra-options">
      <VButton @mouseover="loadRegexBlackListSettings()" @click="toggleRegexSettings()">
        正则匹配列表<VIcon icon="right-arrow" :size="16" />
      </VButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { VIcon, VButton } from '@/ui'
import {
  loadNameSettings,
  loadRegexSettings,
  setNameProps,
  setRegexProps,
  toggleNameSettings,
  toggleRegexSettings,
} from './vm'

const button = useTemplateRef('button')

const loadNameBlackListSettings = async () => {
  const isFirstLoad = await loadNameSettings()
  if (isFirstLoad) {
    const triggerButton = button.value.root
    setNameProps(triggerButton)
  }
}

const loadRegexBlackListSettings = async () => {
  const isFirstLoad = await loadRegexSettings()
  if (isFirstLoad) {
    const triggerButton = button.value.root
    setRegexProps(triggerButton)
  }
}
</script>
<style lang="scss">
.custom-black-list-extra-options {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
</style>
