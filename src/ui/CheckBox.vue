<template>
  <VButton
    ref="root"
    class="be-check-box"
    :class="{ checked, 'left-icon': iconPosition === 'left' }"
    role="checkbox"
    :aria-checked="checked"
    type="transparent"
    v-bind="attrs"
    @click="emit('change', !checked)"
  >
    <div class="text-container">
      <slot>CheckBox</slot>
    </div>
    <div class="icon-container">
      <VIcon :size="16" class="not-checked" :icon="notCheckedIcon" />
      <VIcon :size="16" class="checked" :icon="checkedIcon" />
    </div>
  </VButton>
</template>

<script setup lang="ts">
import { defineAsyncComponent, useAttrs, useTemplateRef } from 'vue'

const VButton = defineAsyncComponent(() => import('./VButton.vue'))
const VIcon = defineAsyncComponent(() => import('./icon/VIcon.vue'))

const {
  checked,
  iconPosition = 'left',
  checkedIcon = 'mdi-checkbox-marked-circle',
  notCheckedIcon = 'mdi-checkbox-blank-circle-outline',
} = defineProps<{
  checked: boolean
  iconPosition?: 'left' | 'right'
  checkedIcon?: string
  notCheckedIcon?: string
}>()
const attrs = useAttrs()
const emit = defineEmits<{
  change: [checked: boolean]
}>()
const root = useTemplateRef('root')
defineExpose({
  root,
})
</script>

<style lang="scss" scoped>
.be-check-box {
  .text-container {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
  }
  .icon-container {
    flex-shrink: 0;
    position: relative;
    margin: 2px 0 2px 8px;
    > * {
      transition: 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
    }
    .not-checked {
      opacity: 0.75;
    }
    .checked {
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0;
      transform: scale(0);
    }
  }
  &.checked {
    .icon-container {
      color: var(--theme-color);
      .not-checked {
        transform: scale(0);
        opacity: 0;
      }
      .checked {
        transform: scale(1);
        opacity: 1;
      }
    }
  }
  &.left-icon {
    .icon-container {
      order: -1;
      margin: 2px 6px 2px 0;
    }
  }
}
</style>
