<template>
  <div ref="root" class="manage-item" :class="{ virtual }">
    <slot v-if="!virtual"></slot>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'

const root = useTemplateRef('root')
const virtual = ref(false)

onMounted(async () => {
  const { dq } = await import('@/core/utils')
  const { visibleInside } = await import('@/core/observer')
  const container = dq('.manage-panel .manage-item-list') as HTMLElement
  if (!container) {
    console.warn('virtual container not found, virtual scroll will be disabled!')
    return
  }
  visibleInside(root.value, container, '150% 0px', records => {
    records.forEach(record => {
      virtual.value = !record.isIntersecting
    })
  })
})
</script>
<style lang="scss">
.manage-panel .manage-item {
  flex: 0 0 auto;
  min-height: 30px;
  width: 100%;
  box-sizing: border-box;
  // padding: 8px;

  // &:not(.virtual) {
  //   border-radius: 8px;
  //   border: 1px solid #8882;
  // }
  // &:not(:last-child) {
  //   margin-bottom: 8px;
  // }
}
</style>
