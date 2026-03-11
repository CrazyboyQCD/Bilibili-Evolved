<template>
  <VPopup
    ref="popup"
    v-model="showPopup"
    class="bigger-video-preview-video-container"
    @popup-change="onPopupChange"
  >
  </VPopup>
</template>

<script setup lang="ts">
import { ref, nextTick, useTemplateRef } from 'vue'
import { VPopup } from '@/ui'

const popup = useTemplateRef('popup')
const popupChangeHandler = ref<((val: boolean) => void) | null>(null)

const showPopup = ref(false)
const movedDom = ref<HTMLElement | null>(null)
const originalParent = ref<Node | null>(null)
const originalNextSibling = ref<Node | null>(null)

const restoreDom = () => {
  if (movedDom.value && originalParent.value) {
    if (originalNextSibling.value) {
      originalParent.value.insertBefore(movedDom.value, originalNextSibling.value)
    } else {
      originalParent.value.appendChild(movedDom.value)
    }
    movedDom.value = null
    originalParent.value = null
    originalNextSibling.value = null
  }
}

const togglePopup = () => {
  // 调用VPopup的toggle方法
  popup.value.toggle()
}

const openPopup = (dom: HTMLElement) => {
  restoreDom()
  if (!dom) {
    return
  }

  // 保存原父节点和下一个兄弟节点
  originalParent.value = dom.parentNode
  originalNextSibling.value = dom.nextSibling

  togglePopup()
  // 移动到popup
  nextTick(() => {
    if (popup.value && dom.parentNode !== popup.value.root) {
      popup.value.root.appendChild(dom)
      movedDom.value = dom
    }
  })
}

const closePopup = () => {
  restoreDom()
  togglePopup()
}

const onPopupChange = (val: boolean) => {
  if (!val) {
    restoreDom()
  }
  popupChangeHandler.value?.(val)
}

defineExpose({
  openPopup,
  closePopup,
  popupChangeHandler,
  popup,
})
</script>

<style lang="scss">
.bigger-video-preview-video-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 99999;
}
</style>
