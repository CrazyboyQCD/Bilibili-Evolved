<template>
  <div
    ref="root"
    class="be-popup"
    :class="{ open, fixed, close: !open, 'closed-style': closedStyle }"
    v-bind="attrs"
  >
    <slot v-if="loaded" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, useTemplateRef, watch } from 'vue'

const {
  closedStyle = true,
  fixed = false,
  triggerElement = null,
  lazy = true,
  autoClose = true,
  autoDestroy = false,
  escClose = false,
  autoClosePredicate = null,
} = defineProps<{
  closedStyle?: boolean
  fixed?: boolean
  triggerElement?: HTMLElement | null
  lazy?: boolean
  autoClose?: boolean
  autoDestroy?: boolean
  escClose?: boolean
  autoClosePredicate?:
    | ((payload: {
        target: HTMLElement
        element: HTMLElement | null
        trigger: HTMLElement | null
      }) => boolean)
    | null
}>()

const emit = defineEmits<{
  'popup-change': [value: boolean]
}>()

const open = defineModel<boolean>({
  default: false,
  set: v => {
    emit('popup-change', v)
    return v
  },
})

const attrs = useAttrs()

const root = useTemplateRef('root')

const loaded = ref(!lazy)

const trigger = computed(() => {
  if (!triggerElement) {
    return null
  }
  return triggerElement
})

const openHandler = (e: Event) => {
  const targetElement = e.target as HTMLElement
  const toastContainer = document.querySelector('.toast-card-container')
  let isOutside =
    targetElement !== trigger.value &&
    !trigger.value?.contains(targetElement) &&
    targetElement !== root.value &&
    !root.value.contains(targetElement) &&
    !toastContainer?.contains(targetElement)

  if (autoClosePredicate) {
    isOutside =
      isOutside &&
      autoClosePredicate({
        target: targetElement,
        element: root.value,
        trigger: trigger.value,
      })
  }

  if (isOutside) {
    open.value = false
  }
}

const addAutoClose = () => {
  if (!autoClose) {
    return
  }
  const eventTypes = ['mousedown', 'touchstart'] as const
  eventTypes.forEach(type => {
    document.documentElement.addEventListener(type, openHandler)
  })
}

const removeAutoClose = () => {
  const eventTypes = ['mousedown', 'touchstart'] as const
  eventTypes.forEach(type => {
    document.documentElement.removeEventListener(type, openHandler)
  })
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('popup-change', false)
  }
}
const onTransitionEnd = () => {
  if (!open.value) {
    loaded.value = false
  }
}

watch(
  open,
  newVal => {
    if (lazy && !loaded.value && newVal) {
      loaded.value = true
    }
    if (newVal) {
      addAutoClose()
    } else {
      removeAutoClose()
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (escClose) {
    document.addEventListener('keydown', onKeydown)
  }
  if (autoDestroy) {
    root.value.addEventListener('transitionend', onTransitionEnd)
  }
})

onBeforeUnmount(() => {
  removeAutoClose()
  document.removeEventListener('keydown', onKeydown)
  if (autoDestroy) {
    root.value.removeEventListener('transitionend', onTransitionEnd)
  }
})

const toggle = () => {
  emit('popup-change', !open.value)
}

defineExpose({ toggle, loaded, root })
</script>

<style lang="scss">
@import './common';

.be-popup {
  position: absolute;
  z-index: 1;
  // @include shadow();
  @include round-corner();

  &.fixed {
    position: fixed;
  }

  &.close.closed-style {
    pointer-events: none;
    opacity: 0;
  }

  &.open {
    pointer-events: initial;
    opacity: 1;
  }
}
</style>
