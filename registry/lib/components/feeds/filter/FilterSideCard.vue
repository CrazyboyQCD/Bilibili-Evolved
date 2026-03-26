<template>
  <div class="filter-side-card-switch feeds-filter-switch" v-bind="attrs">
    <label :class="{ disabled }">
      <span class="name" :class="{ disabled }">{{ name }}</span>
      <VIcon :size="16" class="disabled" icon="mdi-cancel" />
      <VIcon :size="16" icon="mdi-check" />
    </label>
  </div>
</template>
<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { VIcon } from '@/ui'

const attrs = useAttrs()

const { blockSideCards, id, name } = defineProps<{
  blockSideCards: number[]
  id: number
  name: string
}>()

const disabled = computed(() => blockSideCards.includes(id))
</script>
