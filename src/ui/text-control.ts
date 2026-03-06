import type { SetupContext, Ref, ComputedRef, ModelRef } from 'vue'
import { ref, computed } from 'vue'

export interface textControlProps {
  text?: string
  changeOnBlur?: boolean
  validator?: (value: string, oldValue: string) => string
}

export const useTextControl = (
  inputRef: Ref<HTMLInputElement | HTMLTextAreaElement>,
  textModelRef: ModelRef<string>,
  props: {
    text: string
    changeOnBlur: boolean
    validator?: (value: string, oldValue: string) => string
  },
  {
    attrs,
    emit,
  }: Pick<SetupContext<{ 'update:text': (value: string) => boolean }>, 'attrs' | 'emit'>,
): {
  composing: Ref<boolean>
  restAttrs: ComputedRef<Record<string, unknown>>
  emitChange: () => void
  input: () => void
  change: () => void
  compositionStart: () => void
  compositionEnd: () => void
  focus: () => void
} => {
  const composing = ref(false) as Ref<boolean>
  const restAttrs = computed(() =>
    lodash.omit(attrs, 'onChange', 'onInput', 'onCompositionstart', 'onCompositionend'),
  )

  const emitChange = () => {
    let { value } = inputRef.value
    if (props.validator) {
      value = props.validator(value, props.text)
      if (props.changeOnBlur) {
        inputRef.value.value = value
      }
    }
    if (value === props.text) {
      return
    }
    textModelRef.value = value
    emit('update:text', value)
  }

  const input = () => {
    if (!props.changeOnBlur && !composing.value) {
      emitChange()
    }
  }

  const change = () => {
    if (props.changeOnBlur && !composing.value) {
      emitChange()
    }
  }

  const compositionStart = () => {
    composing.value = true
  }

  const compositionEnd = () => {
    composing.value = false
    input()
  }

  const focus = () => {
    inputRef.value.focus()
  }

  return {
    composing,
    restAttrs,
    emitChange,
    input,
    change,
    compositionStart,
    compositionEnd,
    focus,
  }
}
