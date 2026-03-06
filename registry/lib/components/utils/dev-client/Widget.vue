<template>
  <div class="be-dev-client">
    <div class="title">DevClient</div>
    <div class="connection-status">
      <template v-if="isConnected">
        <div class="status-dot connected" />
        <div class="status-text">已连接</div>
        <AsyncButton title="断开连接" @click="disconnect">
          <VIcon icon="mdi-stop" :size="14" />
          断开连接
        </AsyncButton>
      </template>
      <template v-else>
        <div class="status-dot disconnected" />
        <div class="status-text">未连接</div>
        <AsyncButton title="连接" @click="connect">
          <VIcon icon="mdi-play" :size="14" />
          连接
        </AsyncButton>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { AsyncButton, VIcon } from '@/ui'
import type { DevClient } from './client'
import { DevClientEvents } from './client'

const client = ref<DevClient | null>(null)
const isConnected = ref(false)

const updateConnectionStatus = () => {
  if (client.value) {
    isConnected.value = client.value.isConnected
  }
}

const connect = () => {
  if (client.value) {
    return client.value.createSocket(true)
  }
  return Promise.resolve()
}

const disconnect = () => {
  if (client.value) {
    client.value.closeSocket()
  }
}

onMounted(async () => {
  const { devClient } = await import('./client')
  client.value = devClient
  updateConnectionStatus()
  devClient.addEventListener(DevClientEvents.ServerChange, updateConnectionStatus)
})

onUnmounted(() => {
  if (client.value) {
    client.value.removeEventListener(DevClientEvents.ServerChange, updateConnectionStatus)
  }
})
</script>
<style lang="scss" scoped>
@import 'common';

.be-dev-client {
  box-shadow: 0 0 0 1px #8884;
  order: -2;
  border-radius: 4px;
  padding: 6px 6px 6px 10px;
  @include v-stretch(6px);
  body.dark & {
    background-color: var(--be-color-card-bg, #333);
  }
  .title {
    @include semi-bold();
  }
  .connection-status {
    @include h-center(6px);
    font-size: 12px;
    .status-dot {
      height: 8px;
      width: 8px;
      border-radius: 50%;
      &.connected {
        background-color: #81c785;
      }
      &.disconnected {
        background-color: #78909c;
      }
    }
    .be-button {
      margin-left: 4px;
      padding-left: 4px;
      .be-icon {
        margin-right: 4px;
      }
    }
  }
}
</style>
