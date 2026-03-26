<template>
  <div class="navbar-channel" :data-channel-id="channelId">频道</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { bilibiliApi, getJsonWithCredentials } from '@/core/ajax'

const channelId = ref<string | null>(null)

const fetchChannelId = async () => {
  const { channel_id } = await bilibiliApi(
    getJsonWithCredentials('https://api.bilibili.com/x/web-interface/web/channel/red'),
  )
  if (!channel_id) {
    return
  }
  channelId.value = channel_id as string
}

fetchChannelId()
</script>
