<template>
  <div class="be-range-input">
    <TextBox change-on-blur :text="start" @change="setStart($event)" />
    <slot name="separator">
      <div class="default-separator">~</div>
    </slot>
    <TextBox change-on-blur :text="end" @change="setEnd($event)" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TextBox from './TextBox.vue'

interface Range {
  start: string | number
  end: string | number
}

const { range, validator } = defineProps<{
  range: Range
  validator?: (range: Range) => Range | null | undefined
}>()

const emit = defineEmits<{
  change: [range: Range]
}>()
const start = computed(() => range.start.toString())
const end = computed(() => range.end.toString())
const createNewRange = (_start: string, _end: string) => {
  let newRange: Range | null | undefined = { start: _start, end: _end }
  if (validator) {
    newRange = validator(newRange) || newRange
  }
  if (newRange === null || newRange === undefined) {
    return
  }
  emit('change', newRange)
}
const setStart = (newValue: string) => {
  createNewRange(newValue, end.value)
}

const setEnd = (newValue: string) => {
  createNewRange(start.value, newValue)
}
</script>

<style lang="scss" scoped>
.be-range-input {
  display: flex;
  align-items: center;
  > .be-textbox {
    flex: 1;
  }
  .default-separator {
    margin: 0 8px;
    flex: 0 0 auto;
  }
}
</style>
