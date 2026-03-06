<template>
  <DefaultWidget
    name="顶栏布局设置"
    icon="mdi-sort"
    @mouseover="loadNavbarSettings()"
    @click="toggleNavbarSettings()"
  />
</template>
<script setup lang="ts">
import { DefaultWidget } from '@/ui'
import { loadNavbarSettings, toggleNavbarSettings } from './vm'
</script>
