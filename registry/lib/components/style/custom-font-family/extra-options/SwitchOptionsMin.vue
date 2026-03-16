<!-- 这个 Vue 组件是因为无法正常从 @/components/SwitchOptions.vue 导入 SwitchOptions 组件而新建的 -->

<template>
  <div ref="root" class="switch-options-min">
    <div class="switch-options-min-grid">
      <component
        :is="options.radio ? 'RadioButton' : 'CheckBox'"
        v-for="name of Object.keys(options.switches)"
        :key="name"
        :class="{ dim: !(Number(componentOptions[name]) ^ Number(isDimAtChecked)) }"
        v-bind="mergedSwitchProps"
        :checked="componentOptions[name]"
        @change="componentOptions[name] = $event"
      >
        <!-- dim 这里原来的写法在使用 export default defineComponent 的情况下会报错，虽然能运行，但还是改了改 -->
        {{ options.switches[name].displayName }}
      </component>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, useTemplateRef } from 'vue'
import { getComponentSettings } from '@/core/settings'
import { SwitchMetadataOption } from '@/components/switch-options'

const { options } = defineProps<{
  options: SwitchMetadataOption<string, string>
}>()

const root = useTemplateRef('root')

const componentOptions = getComponentSettings(options.componentName).options

const getIsDimAtChecked = () => {
  if (options.dimAt === 'checked' || options.dimAt === undefined) {
    return true
  }
  if (options.dimAt === 'notChecked') {
    return false
  }
  return false
}

const isDimAtChecked = getIsDimAtChecked()

const mergedSwitchProps = computed(() => ({
  checkedIcon: 'mdi-eye-off-outline',
  notCheckedIcon: 'mdi-eye-outline',
  ...options.switchProps,
}))

const updateColumnsCount = () => {
  const columns = Math.ceil(Object.keys(options.switches).length / 12)
  root.value.style.setProperty('--columns', columns.toString())
}

watch(() => options, updateColumnsCount)

onMounted(updateColumnsCount)
</script>

<style lang="scss">
@import 'common';

.switch-options-min {
  position: relative;
  --columns: 1;
  width: 100%;

  .switch-icon {
    margin-right: 8px;
    transform: scale(0.9);
  }

  .dim {
    opacity: 0.5;
  }

  & > &-grid {
    font-size: 12px;
    display: grid;
    grid-template-columns: repeat(auto-fill, 50%);
  }
}
</style>
