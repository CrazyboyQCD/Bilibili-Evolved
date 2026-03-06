<template>
  <div ref="root" class="multiple-widgets">
    <DefaultWidget
      v-for="item in items"
      :key="item.name"
      :disabled="item.disabled"
      :data-name="item.name"
      :name="item.displayName"
      :icon="item.icon"
      @click="runItemAction(item, $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { DefaultWidget } from '@/ui'
import { CheckInItem, checkInItems } from './check-in-item'

const root = useTemplateRef('root')

const items = ref(checkInItems)

const runItemAction = async (item: CheckInItem, event: MouseEvent) => {
  try {
    // 一开始可能是 undefined
    item.disabled = true
    const button = root.value.querySelector(`[data-name='${item.name}']`) as HTMLDivElement
    await item.action(button, event)
  } finally {
    item.disabled = false
  }
}
</script>
