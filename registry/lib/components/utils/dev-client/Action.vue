<template>
  <div v-show="isConnected">
    <div v-if="canStartDebug" class="component-action dev-client-action" @click="startDebug">
      <VIcon v-if="busy" icon="mdi-network-outline" :size="16" />
      <VIcon v-else icon="mdi-play-network-outline" :size="16" />
      {{ busy ? '启动中' : '开始调试' }}
    </div>
    <div v-if="canStopDebug" class="component-action dev-client-action" @click="stopDebug">
      <VIcon v-if="busy" icon="mdi-network-outline" :size="16" />
      <VIcon v-else icon="mdi-minus-network-outline" :size="16" />
      {{ busy ? '停止中' : '停止调试' }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { ComponentMetadata } from '@/components/types'
import { Toast } from '@/core/toast'
import { DevClientEvents } from './client'
import { autoUpdateOptions, getDevClientOptions } from './options'
import { urlConverter } from './converter'

const options = getDevClientOptions()

const { component } = defineProps<{
  item: Record<string, unknown>
  component: ComponentMetadata
}>()

const busy = ref(false)
const autoUpdateComponents = autoUpdateOptions.urls.components
const sessions = ref<string[]>([])
const isConnected = ref(false)

const autoUpdateRecord = computed(() => autoUpdateComponents[component.name])
const componentUpdateUrl = computed(() => autoUpdateRecord.value?.url)

const isDebugging = computed(() => {
  if (!componentUpdateUrl.value) {
    return false
  }
  return sessions.value.some((path: string) => {
    const { pathname } = new URL(componentUpdateUrl.value)
    return path === pathname
  })
})

const canStartDebug = computed(() => {
  return !isDebugging.value && urlConverter.toDevUrl(componentUpdateUrl.value) !== null
})

const canStopDebug = computed(() => {
  return Boolean(isDebugging.value && componentUpdateUrl.value)
})

const handleSessionsUpdate = (e: CustomEvent<string[]>) => {
  sessions.value = e.detail
}

const handleServerChange = (e: CustomEvent<boolean>) => {
  isConnected.value = e.detail
}

const handleClick = async (action: () => Promise<void>) => {
  if (busy.value) {
    return
  }
  try {
    busy.value = true
    await action()
  } finally {
    busy.value = false
  }
}

const startDebug = async () => {
  await handleClick(async () => {
    const { devClient } = await import('./client')
    const devUrl = urlConverter.toDevUrl(componentUpdateUrl.value)
    if (autoUpdateRecord.value.url !== devUrl) {
      options.devRecords[component.name] = {
        name: component.name,
        originalUrl: componentUpdateUrl.value,
      }
      autoUpdateRecord.value.url = devUrl
    }
    const toast = Toast.info('启动调试中...', 'DevClient')
    try {
      await devClient.startDebug(autoUpdateRecord.value.url)
    } catch (error) {
      console.error(error)
    } finally {
      toast.close()
    }
  })
}

const stopDebug = async () => {
  await handleClick(async () => {
    const { devClient } = await import('./client')
    const { pathname } = new URL(componentUpdateUrl.value)
    if (devClient.isConnected) {
      await devClient.stopDebug(pathname)
    }
    if (options.devRecords[component.name]) {
      autoUpdateRecord.value.url = options.devRecords[component.name].originalUrl
      delete options.devRecords[component.name]
    }
  })
}

onMounted(async () => {
  const { devClient } = await import('./client')
  sessions.value = devClient.sessions
  isConnected.value = devClient.isConnected
  devClient.addEventListener(DevClientEvents.ServerChange, handleServerChange)
  devClient.addEventListener(DevClientEvents.SessionsUpdate, handleSessionsUpdate)
})

onUnmounted(async () => {
  const { devClient } = await import('./client')
  devClient.removeEventListener(DevClientEvents.SessionsUpdate, handleSessionsUpdate)
})
</script>
