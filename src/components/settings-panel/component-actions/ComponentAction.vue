<template>
  <div
    class="component-action"
    :class="{ disabled }"
    :aria-disabled="disabled"
    :title="item.title"
    @click="handleClick"
  >
    <VIcon :icon="item.icon" :size="16" />
    {{ item.displayName }}
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { VIcon } from '@/ui'
import { ComponentConfigAction } from './types'
import { ComponentMetadata } from '../../types'

const { item, component } = defineProps<{
  item: ComponentConfigAction
  component: ComponentMetadata
}>()

const disabled = ref(false)

const handleClick = async () => {
  if (disabled.value) {
    return
  }
  try {
    disabled.value = true
    await item.action(component)
  } finally {
    disabled.value = false
  }
}
</script>
<style lang="scss">
@import 'common';

.component-action {
  @include h-center(6px);
  cursor: pointer;
  border-radius: 4px;
  padding: 4px 8px 4px 6px;
  font-size: 13px;

  &:hover {
    background-color: #8884;
  }
  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
</style>
