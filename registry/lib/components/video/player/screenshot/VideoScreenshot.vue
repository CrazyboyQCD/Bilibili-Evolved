<template>
  <div class="video-screenshot-thumbnail">
    <img v-if="objectUrl" :src="objectUrl" />
    <div v-if="objectUrl" class="mask">
      <a
        ref="link"
        target="_blank"
        class="link"
        style="display: none"
        :href="objectUrl"
        :download="filename"
      ></a>
      <button class="save" title="保存" @click="save">
        <VIcon :size="28" icon="mdi-content-save-outline" />
      </button>
      <button class="copy" title="复制" @click="copy">
        <VIcon :size="24" :icon="showCopyTip ? 'mdi-check' : 'mdi-content-copy'" />
      </button>
      <button class="discard" title="丢弃" @click="discard">
        <VIcon :size="28" icon="mdi-delete-forever-outline" />
      </button>
      <span class="time">{{ time }}</span>
    </div>
    <div v-else class="loading" @click="discard" />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'
import { VIcon } from '@/ui'
import { Screenshot } from './screenshot'

const { screenshot } = defineProps<{
  screenshot: Screenshot
}>()

const emit = defineEmits<{ discard: [] }>()

const link = useTemplateRef('link')
const showCopyTip = ref(false)

const objectUrl = computed(() => screenshot.url)
const filename = computed(() => screenshot.filename)
const time = computed(() => screenshot.time)

const discard = () => {
  emit('discard')
}

const copy = async () => {
  await navigator.clipboard.write([new ClipboardItem({ [screenshot.mimeType]: screenshot.blob })])
  showCopyTip.value = true
  setTimeout(() => {
    showCopyTip.value = false
  }, 1000)
}

const save = () => {
  link.value.addEventListener(
    'click',
    e => {
      e.stopPropagation()
    },
    { capture: true, once: true },
  )
  link.value.click()
  discard()
}
</script>
<style lang="scss">
.video-screenshot-thumbnail {
  margin: var(--thumbnail-margin-vertical) var(--thumbnail-margin-horizontal);
  position: relative;
  transition: 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  width: var(--screenshot-width);
  height: var(--screenshot-height);
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;

  @keyframes spinner {
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }

  img {
    max-width: var(--screenshot-width);
    max-height: var(--screenshot-height);
    display: block;
    background-color: black;
  }
  .loading::before {
    content: '';
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 3px solid #8888;
    border-top-color: var(--theme-color);
    animation: spinner 0.6s linear infinite;
  }
  &.video-screenshot-list-leave-active {
    position: absolute;
    transition: 0.35s cubic-bezier(0.6, -0.28, 0.74, 0.05);
  }
  .mask {
    position: absolute;
    opacity: 0;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #0008;
    display: flex;
    justify-content: space-around;
    align-items: center;
    transition: none;
    pointer-events: none;
    .time {
      color: #fff;
      position: absolute;
      bottom: 4px;
      left: 8px;
      font-size: 10pt;
    }
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000a;
      color: #fff;
      border: none;
      border-radius: 50%;
      font-size: 24pt;
      cursor: pointer;
      width: 48px;
      height: 48px;
      pointer-events: initial;
      outline: none !important;
    }
  }
  &:hover .mask {
    opacity: 1;
  }
}
</style>
