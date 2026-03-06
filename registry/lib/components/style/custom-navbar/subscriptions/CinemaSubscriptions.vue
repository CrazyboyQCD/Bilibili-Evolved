<template>
  <SubscriptionsList type="cinema" :filter="filter"></SubscriptionsList>
</template>
<script setup lang="ts">
import SubscriptionsList from './SubscriptionsList.vue'
import type { SubscriptionStatusFilter } from './types'

const { filter = null } = defineProps<{
  filter?: SubscriptionStatusFilter | null
}>()
</script>
