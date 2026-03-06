<template>
  <div ref="rootRef">
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

const rootRef = useTemplateRef('rootRef')

const peek = ref(false)

watch(peek, value => {
  const dialogElement = rootRef.value.closest('.be-dialog') as HTMLElement | null
  if (dialogElement) {
    dialogElement.style.opacity = value ? '0.1' : '1'
  }
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
