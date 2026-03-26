<template>
  <div
    ref="root"
    class="be-button"
    role="button"
    :aria-disabled="disabled"
    :tabindex="disabled ? -1 : 0"
    :class="{
      [type]: true,
      disabled,
      round: round,
      icon: icon,
      'no-effects': noEffects,
    }"
    v-bind="!disabled ? attrs : {}"
    @click="!disabled && emit('click', $event)"
    @keydown.enter.prevent="!disabled && emit('click', $event)"
    @keydown.space.prevent="!disabled && emit('click', $event)"
  >
    <div class="content-container">
      <slot>Button</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs, useTemplateRef } from 'vue'

const {
  type = 'light',
  round = false,
  icon = false,
  noEffects = false,
} = defineProps<{
  type?: string
  round?: boolean
  icon?: boolean
  noEffects?: boolean
}>()

const emit = defineEmits<{
  click: [event: Event]
}>()

const attrs = useAttrs()

const disabled = computed(() => {
  return Boolean(attrs.disabled)
})
const root = useTemplateRef('root')
defineExpose({
  root,
})
</script>

<style lang="scss" scoped>
.be-button {
  outline: none !important;
  line-height: normal;
  transition: background-color 0.2s ease-out, box-shadow 0.2s ease-out;
  background-color: #8882;
  color: black;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &,
  & * {
    -webkit-tap-highlight-color: transparent;
  }
  body.dark & {
    color: var(--be-color-text-title, #eee);
  }
  &.round {
    border-radius: calc(1em + 8px);
    padding: 4px 10px;
  }
  &.icon {
    border-radius: 50%;
    padding: 4px;
    // b 站样式会塞个背景图
    background-image: none !important;
  }

  .content-container {
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
  }
  &.transparent {
    background-color: transparent;
  }
  &.primary {
    box-shadow: 0 0 0 1px var(--theme-color-80);
    background-color: var(--theme-color-80);
    color: var(--foreground-color);
  }
  &.light {
    background-color: #fff;
    box-shadow: 0 0 0 1px #8884;
    transition: box-shadow 0.2s ease-out;
  }
  body.dark &.light {
    background-color: var(--be-color-button-bg, #333);
    // box-shadow: 0 0 0 1px transparent;
  }
  &:not(.disabled):not(.no-effects) {
    &:hover,
    &:focus-within {
      background-color: #8884;
    }
    &:focus-within {
      box-shadow: 0 0 0 1px var(--theme-color), 0 0 0 3px var(--theme-color-20);
    }
    &.transparent {
      &:hover,
      &:focus-within {
        background-color: #8882;
      }
    }
    &.primary {
      &:hover {
        box-shadow: 0 0 0 1px var(--theme-color);
      }
      &:focus-within {
        box-shadow: 0 0 0 1px var(--theme-color), 0 0 0 3px var(--theme-color-20);
      }
      &:hover,
      &:focus-within {
        background-color: var(--theme-color);
      }
    }
    &.light {
      &:hover {
        background-color: #fff;
        box-shadow: 0 0 0 1px var(--theme-color);
      }
      &:active,
      &:focus-within {
        background-color: #fff;
        box-shadow: 0 0 0 1px var(--theme-color), 0 0 0 3px var(--theme-color-20);
      }
    }
    body.dark &.light {
      &:hover {
        background-color: var(--be-color-button-bg, #333);
        box-shadow: 0 0 0 1px var(--theme-color);
      }
      &:active,
      &:focus-within {
        background-color: var(--be-color-button-bg, #333);
        box-shadow: 0 0 0 1px var(--theme-color), 0 0 0 3px var(--theme-color-20);
      }
    }
  }
  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
</style>
