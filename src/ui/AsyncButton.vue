<template>
  <VButton v-bind="attrs" :disabled="disabled || internalDisabled" @click="onClick">
    <slot>Button</slot>
  </VButton>
</template>
<script setup lang="ts">
import { ref, useAttrs } from 'vue'
import VButton from './VButton.vue'

const { disabled = false } = defineProps<{
  disabled?: boolean
}>()

const internalDisabled = ref(false)

const attrs = useAttrs()

const onClick = async (event: Event) => {
  try {
    internalDisabled.value = true
    const clickHandler = attrs.onClick as ((event: Event) => Promise<void> | void) | undefined
    await clickHandler?.(event)
  } finally {
    internalDisabled.value = false
  }
}
</script>
