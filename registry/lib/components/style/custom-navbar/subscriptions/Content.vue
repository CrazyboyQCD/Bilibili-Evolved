<template>
  <div class="">{{ content }}</div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  addComponentListener,
  getComponentSettings,
  removeComponentListener,
} from '@/core/settings'
import type { CustomNavbarOptions } from '..'

const isBangumiLinkHidden = ref(
  getComponentSettings<CustomNavbarOptions>('customNavbar').options.hidden.includes('bangumi'),
)

const content = computed(() => (isBangumiLinkHidden.value ? '番剧' : '追番追剧'))

const updateBangumiLinkStatus = (hiddenItems: string[]) => {
  isBangumiLinkHidden.value = hiddenItems.includes('bangumi')
}

onMounted(() => {
  addComponentListener('customNavbar.hidden', updateBangumiLinkStatus)
})

onBeforeUnmount(() => {
  removeComponentListener('customNavbar.hidden', updateBangumiLinkStatus)
})
</script>
