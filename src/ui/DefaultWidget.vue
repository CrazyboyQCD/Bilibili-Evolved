<template>
  <VButton ref="root" class="default-widget" v-bind="attrs">
    <div class="widget-icon">
      <slot name="icon">
        <VIcon :type="iconType" :icon="icon"></VIcon>
      </slot>
    </div>
    <div class="widget-name">
      <slot>{{ name }}</slot>
    </div>
  </VButton>
</template>

<script setup lang="ts">
import { useAttrs, useTemplateRef } from 'vue'
import VIcon from './icon/VIcon.vue'
import VButton from './VButton.vue'

const attrs = useAttrs()
const {
  name = '',
  icon = '',
  iconType = '',
} = defineProps<{
  name?: string
  icon?: string
  iconType?: string
}>()
const root = useTemplateRef('root')
defineExpose({
  root,
})
</script>

<style lang="scss" scoped>
@import 'common';
.default-widget {
  position: relative;
  .widget-icon {
    margin-right: 8px;
    opacity: 0.75;
  }
  .widget-name {
    display: flex;
  }
}
</style>
