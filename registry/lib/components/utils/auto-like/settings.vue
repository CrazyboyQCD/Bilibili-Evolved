<template>
  <div>
    <div class="custom-black-list-extra-options">
      <VButton ref="button" @mouseover="setBlackListPropsHandler" @click="toggleBlackList">
        黑名单
        <VIcon icon="right-arrow" :size="16" />
      </VButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { VIcon, VButton } from '@/ui'
import { loadBlackList, setBlackListProps, toggleBlackList } from './vm'

const button = useTemplateRef('button')

const isFirstLoad = ref(false)

const setBlackListPropsHandler = async () => {
  if (isFirstLoad.value) {
    return
  }
  isFirstLoad.value = await loadBlackList()
  if (isFirstLoad.value) {
    const triggerButton = button.value.root
    setBlackListProps(triggerButton)
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
