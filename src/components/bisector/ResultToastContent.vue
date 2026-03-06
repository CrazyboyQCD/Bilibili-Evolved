<template>
  <div>
    <div>可能出问题的组件是：{{ displayName }}（{{ name }}）</div>
    <div>
      <span class="link" @click="restore">恢复原状（{{ countdown }} 秒）</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { RecordValue } from '../types'
import type { Settings } from '@/core/settings/types'

const { userComponent, onRestore } = defineProps<{
  userComponent: RecordValue<Settings['userComponents']>
  onRestore: () => Promise<void>
}>()

const countdown = ref(30)
let interval: NodeJS.Timeout

const displayName = computed(() => userComponent.metadata?.displayName)
const name = computed(() => userComponent.metadata?.name)

const restore = () => {
  clearInterval(interval)
  onRestore()
}

onMounted(() => {
  interval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(interval)
      restore()
    }
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>
