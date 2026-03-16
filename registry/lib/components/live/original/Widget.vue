<template>
  <a :href="href" tabindex="-1">
    <DefaultWidget name="返回原版直播间" icon="mdi-arrow-left-circle-outline" />
  </a>
</template>
<script setup lang="ts">
import { getOriginalLiveroomUrl } from './get-original-liveroom-url'

const href = getOriginalLiveroomUrl(document.URL)
</script>
