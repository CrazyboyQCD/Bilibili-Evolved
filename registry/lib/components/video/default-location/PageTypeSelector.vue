<template>
  <div class="video-default-location-page-type-selector">
    <VDropdown v-model="curItem" :items="items" @change="onChange">
      <template #arrow>
        <div class="video-default-location-page-type-selector-icon">
          <VIcon :size="15" icon="mdi-chevron-down" />
        </div>
      </template>
    </VDropdown>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { VDropdown, VIcon } from '@/ui'
import { pageTypeInfos } from '.'

const itemsMap = lodash.mapValues(pageTypeInfos, (v, k) => ({
  name: k,
  displayName: v.displayName,
}))

interface Item {
  name: string
  displayName: string
}
const emit = defineEmits<{
  change: [value: string]
}>()
const value = defineModel<string>({
  set: v => {
    emit('change', v)
    return v
  },
})

const items = Object.values(itemsMap)
const curItem = ref<Item>(itemsMap[value.value])

watch(
  () => value.value,
  newValue => {
    if (curItem.value.name !== newValue) {
      curItem.value = itemsMap[newValue]
    }
  },
)

const onChange = (item: string | Item) => {
  const itemName = typeof item === 'string' ? item : item.name
  emit('change', itemName)
}
</script>

<style lang="scss">
@import 'bar';

.video-default-location-page-type-selector-icon {
  @include icon-container;
}
</style>
