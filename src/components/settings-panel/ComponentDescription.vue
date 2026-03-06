<template>
  <div class="component-description" v-html="html"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getDescriptionHTML, ItemWithDescription } from '../description'

const { componentData } = defineProps<{
  componentData: ItemWithDescription
}>()

const html = ref('')

watch(
  () => componentData.description,
  async () => {
    html.value = await getDescriptionHTML(componentData)
  },
  {
    immediate: true,
  },
)
</script>

<style lang="scss">
@import 'common';
@import 'markdown';

.component-description {
  word-break: break-all;
  @include markdown();
}
</style>
