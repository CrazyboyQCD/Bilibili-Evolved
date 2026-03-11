<template>
  <div class="danmaku-send-bar">
    <input
      type="text"
      placeholder="发个弹幕呗~"
      :value="value"
      maxlength="30"
      @keydown.enter="send()"
      @input="updateValue(($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { select } from '@/core/spin-query'
import { raiseEvent } from '@/core/utils'
import { originalTextAreaSelector, sendButtonSelector } from './original-elements'

let changeEventHook = false

const originalTextArea = ref<HTMLTextAreaElement | null>(null)
const sendButton = ref<HTMLButtonElement | null>(null)
const value = ref('')

const updateValue = (newValue: string) => {
  if (originalTextArea.value) {
    originalTextArea.value.value = newValue
    raiseEvent(originalTextArea.value, 'input')
  }
}

const send = () => {
  if (sendButton.value && !sendButton.value.disabled) {
    value.value = ''
    sendButton.value.click()
  }
}

const listenChange = (e: InputEvent) => {
  value.value = (e.target as HTMLTextAreaElement).value
}

onMounted(async () => {
  const textArea = (await select(originalTextAreaSelector)) as HTMLTextAreaElement
  const button = (await select(sendButtonSelector)) as HTMLButtonElement
  if (!textArea || !button) {
    throw new Error(
      `[danmakuSendBar] ref elements not found. originalTextArea = ${
        textArea === null
      } sendButton = ${button === null}`,
    )
  }
  originalTextArea.value = textArea
  sendButton.value = button
  value.value = textArea.value
  textArea.addEventListener('input', listenChange)
  textArea.addEventListener('change', listenChange)
  if (!changeEventHook) {
    const original = Object.getOwnPropertyDescriptors(HTMLTextAreaElement.prototype).value
    Object.defineProperty(textArea, 'value', {
      ...original,
      set(newValue: string) {
        original.set?.call(this, newValue)
        raiseEvent(textArea, 'input')
      },
    })
    changeEventHook = true
  }
})

onUnmounted(() => {
  if (originalTextArea.value) {
    originalTextArea.value.removeEventListener('input', listenChange)
    originalTextArea.value.removeEventListener('change', listenChange)
  }
})
</script>
<style lang="scss">
.live-web-player-controller {
  .danmaku-send-bar {
    display: none;
  }
}
.live-web-player-controller {
  background-image: linear-gradient(to bottom, transparent 20%, rgba(0, 0, 0, 0.9));
}
@media screen and (min-width: 1038px) {
  .player-full-win {
    &:not(.danmaku-send-bar-unloaded) {
      .live-web-player-controller .control-area {
        .danmaku-send-bar {
          display: flex;
          margin: 0 24px;
          flex: 1 1 0;
          height: 24px;
          justify-content: center;
          align-items: center;
          input {
            outline: none !important;
            border: none;
            border-bottom: 2px solid #fff8;
            background-color: transparent;
            color: #fff;
            padding: 4px;
            line-height: normal;
            flex: 1;
            width: 0;
            max-width: 400px;
            min-width: 70px;
            &:focus-within {
              border-color: var(--theme-color);
            }
            &::-webkit-input-placeholder {
              color: #fff8 !important;
            }
          }
        }
        .right-area {
          flex: 0 0 auto !important;
        }
      }
    }
  }
}
</style>
