<template>
  <div ref="root">
    组件二等分
    <div
      class="peek"
      title="透视"
      style="margin-left: auto"
      @mouseover="peek = true"
      @mouseout="peek = false"
    >
      <VIcon icon="eye" :size="18" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, useTemplateRef } from 'vue'
import { VIcon } from '@/ui'

const root = useTemplateRef('root')

const peek = ref(false)

watch(peek, value => {
  const dialogElement = root.value.closest('.be-dialog') as HTMLElement | null
  dialogElement.style.opacity = value ? '0.1' : '1'
})
</script>

<style lang="scss" scoped>
@import 'common';

div {
  @include h-center(8px);
}

.peek {
  cursor: pointer;
}
</style>
