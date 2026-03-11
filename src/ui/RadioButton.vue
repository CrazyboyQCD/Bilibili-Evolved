<template>
  <CheckBox
    ref="root"
    class="be-radio-button"
    role="radio"
    v-bind="attrs"
    :checked="checked"
    :checked-icon="checkedIcon"
    :not-checked-icon="notCheckedIcon"
    @change="emitChange($event)"
  >
    <slot>RadioButton</slot>
  </CheckBox>
</template>

<script setup lang="ts">
import { watch, onMounted, getCurrentInstance, useTemplateRef, useAttrs } from 'vue'
import { CurriedFunction2 } from 'lodash'
import CheckBox from './CheckBox.vue'

type RadioGroup = {
  instance: any
  uncheck: () => void
}
const groups = new Map<string | HTMLElement, RadioGroup[]>()
const setGroup = lodash.curry((name: string | HTMLElement, instance: any, uncheck: () => void) => {
  if (groups.has(name)) {
    groups.get(name).push({ instance, uncheck })
  } else {
    groups.set(name, [{ instance, uncheck }])
  }
})

const attrs = useAttrs()

const {
  checked,
  allowUncheck = false,
  group = '',
  checkedIcon = 'mdi-radiobox-marked',
  notCheckedIcon = 'mdi-radiobox-blank',
} = defineProps<{
  checked: boolean
  allowUncheck?: boolean
  group?: string
  checkedIcon?: string
  notCheckedIcon?: string
}>()

const emit = defineEmits<{
  change: [value: boolean]
}>()

const instance = getCurrentInstance()
const root = useTemplateRef('root')

const emitChange = (value: boolean) => {
  if ((checked && allowUncheck) || !checked) {
    emit('change', value)
  }
}

watch(
  () => checked,
  newValue => {
    if (newValue) {
      const thisElement = root.value.root.root
      let key: string | HTMLElement
      if (group === '') {
        key = thisElement.parentElement
      } else {
        key = group
      }
      groups.get(key)?.forEach(({ instance: radioInstance, uncheck }) => {
        if (radioInstance !== instance) {
          uncheck()
        }
      })
    }
  },
)

onMounted(() => {
  const element = root.value as HTMLElement
  const uncheck = () => emit('change', false)
  let curriedSet: CurriedFunction2<any, () => void, void>
  if (group === '') {
    curriedSet = setGroup(element.parentElement)
  } else {
    curriedSet = setGroup(group)
  }
  curriedSet(instance, uncheck)
})
</script>
