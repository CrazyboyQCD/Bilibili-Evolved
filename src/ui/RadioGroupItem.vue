<template>
  <CollapsibleContainer
    :expanded="computedExpanded"
    :default-expanded="defaultExpanded"
    :hide-expand-button="hideExpandButton"
    :enable-expand-by-header="false"
    :disable-content="disableContent"
    @expanded="onExpanded"
  >
    <template #title>
      <RadioButton
        class="group-title"
        no-effects
        :checked="computedChecked"
        :allow-uncheck="allowUncheck"
        :group="group"
        :checked-icon="checkedIcon"
        :not-checked-icon="notCheckedIcon"
        @change="onRadioChanged"
      >
        {{ title }}
      </RadioButton>
    </template>

    <slot />
  </CollapsibleContainer>
</template>

<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { RadioButton } from '@/ui'
import CollapsibleContainer from './CollapsibleContainer.vue'

const {
  title = '',
  expanded,
  defaultExpanded = false,
  hideExpandButton = false,
  disableContent = false,
  checked,
  allowUncheck = false,
  group = '',
  checkedIcon = 'mdi-radiobox-marked',
  notCheckedIcon = 'mdi-radiobox-blank',
} = defineProps<{
  /** 选项文本 */
  title?: string

  // #region CollapsibleContainer 参数
  /** 当前展开状态 */
  expanded?: boolean
  /** 初始展开状态 */
  defaultExpanded?: boolean
  /** 隐藏展开按钮 */
  hideExpandButton?: boolean
  /** 禁用内容区域 */
  disableContent?: boolean
  // #endregion

  // #region RadioButton 参数
  checked?: boolean
  allowUncheck?: boolean
  group?: string
  checkedIcon?: string
  notCheckedIcon?: string
  // #endregion
}>()

const emit = defineEmits<{
  expanded: [expanded: boolean]
  change: [checked: boolean]
}>()

// 定义内部值以便在未传递参数时能正常工作
const internalExpanded = shallowRef(defaultExpanded)
const computedExpanded = computed(() =>
  expanded !== undefined ? expanded : internalExpanded.value,
)
// 切换展开/收起状态
const onExpanded = (expandedValue: boolean) => {
  if (expanded !== undefined) {
    emit('expanded', expandedValue)
  } else {
    internalExpanded.value = expandedValue
  }
}

// 定义内部值以便在未传递参数时能正常工作
const internalChecked = shallowRef(false)
const computedChecked = computed(() => (checked !== undefined ? checked : internalChecked.value))
// 切换选择状态
const onRadioChanged = (checkedValue: boolean) => {
  if (checked !== undefined) {
    emit('change', checkedValue)
  } else {
    internalChecked.value = checkedValue
  }
}
</script>
<style lang="scss" scoped>
@import 'common';

.group-title {
  flex-grow: 1;
  padding: 6px 8px;
}
</style>
