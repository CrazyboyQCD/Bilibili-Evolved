<template>
  <div ref="root" class="be-mini-toast-wrapper">
    <div ref="content" class="be-mini-toast-content">
      <slot />
    </div>
    <div ref="toast" class="be-mini-toast">
      <slot name="toast" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, useTemplateRef, useAttrs } from 'vue'
import { Placement } from 'tippy.js'
import { createMiniToast } from './mini'

const containerMap: Record<string, HTMLElement | (() => HTMLElement)> = {
  body: () => document.body,
  local: undefined,
}
const emit = defineEmits<{
  change: [value: boolean]
}>()

const show = defineModel<boolean>({
  default: false,
  set: v => {
    emit('change', v)
    return v
  },
})

const { container = 'local', placement } = defineProps<{
  container?: string
  placement?: Placement
}>()

const attrs = useAttrs()

const root = useTemplateRef('root')
const content = useTemplateRef('content')
const toast = useTemplateRef('toast')

defineExpose({
  root,
})

const toastInstance = ref<ReturnType<typeof createMiniToast> | null>(null)

watch(
  () => placement,
  newValue => {
    if (newValue && toastInstance.value) {
      toastInstance.value.placement = newValue
    }
  },
)

onMounted(async () => {
  await new Promise(resolve => {
    setTimeout(resolve, 0)
  })
  const appendTarget = containerMap[container]
  toastInstance.value = createMiniToast(toast.value, content.value, {
    placement,
    showOnCreate: show.value,
    trigger: 'mouseenter focusin',
    onHide: () => {
      emit('change', false)
    },
    onShow: () => {
      emit('change', true)
    },
    appendTo: typeof appendTarget === 'function' ? appendTarget() : appendTarget,
    ...attrs,
  })
})
</script>
