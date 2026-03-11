<template>
  <VPopup v-model="popupOpen" class="be-extra-options-panel" fixed :lazy="false">
    <div class="be-eop-header">
      <div class="be-eop-h-title">
        <VIcon class="be-eop-h-t-icon" :icon="initData.header.title.icon" :size="24" />
        <div class="be-eop-h-t-text">{{ initData.header.title.text }}</div>
      </div>

      <div class="be-eop-h-actions">
        <div :key="initData.header.actions[0].id" class="be-eop-h-a-action">
          <VIcon
            ref="action0"
            :class="`action-${initData.header.actions[0].actionClassNameSuffix}`"
            :title="initData.header.actions[0].title"
            :icon="initData.header.actions[0].icon"
            :size="24"
          />
        </div>
        <div :key="initData.header.actions[1].id" class="be-eop-h-a-action">
          <VIcon
            ref="action1"
            :class="`action-${initData.header.actions[1].actionClassNameSuffix}`"
            :title="initData.header.actions[1].title"
            :icon="initData.header.actions[1].icon"
            :size="24"
          />
        </div>
        <div class="be-eop-h-a-action">
          <VIcon
            class="action-close"
            title="关闭"
            icon="mdi-close"
            :size="24"
            @click="popupOpen = false"
          />
        </div>
      </div>
    </div>

    <div class="be-eop-separator" />

    <div class="be-eop-content">
      <div v-for="option in initData.content.options" :key="option.id" class="be-eop-c-option">
        <div class="be-eop-c-o-title">{{ option.title }}</div>
        <div class="be-eop-c-o-description">{{ option.description }}</div>
        <div class="be-eop-c-o-input" :class="`input-${option.inputClassNameSuffix}`">
          <slot :name="`input${option.id}`">
            选项输入入口默认文字，使用含 v-slot 指令的 template 元素以替换默认内容
          </slot>
        </div>
      </div>
    </div>
  </VPopup>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { VPopup, VIcon } from '@/ui'
import { defaultInitData, type ExtraOptionsPanelInitData } from './extra-options-panel'

const action0 = useTemplateRef('action0')
const action1 = useTemplateRef('action1')
const { initData = defaultInitData } = defineProps<{
  initData?: ExtraOptionsPanelInitData
}>()

const popupOpen = ref(false)
defineExpose({
  action0,
  action1,
  popupOpen,
})
</script>

<style lang="scss">
@import './extra-options-panel';

.be-extra-options-panel {
  @include extra-options-panel();
}
</style>
