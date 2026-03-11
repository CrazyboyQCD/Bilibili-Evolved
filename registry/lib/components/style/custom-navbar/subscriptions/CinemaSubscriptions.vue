<template>
  <SubscriptionsList type="cinema" :filter="filter" />
</template>
<script setup lang="ts">
import SubscriptionsList from './SubscriptionsList.vue'
import type { SubscriptionStatusFilter } from './types'

const { filter = null } = defineProps<{
  filter?: SubscriptionStatusFilter | null
}>()
</script>
