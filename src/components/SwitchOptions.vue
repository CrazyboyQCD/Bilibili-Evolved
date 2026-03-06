<template>
  <div ref="rootRef" class="switch-options" :class="{ 'small-size': smallSize, grid: !popupMode }">
    <template v-if="popupMode">
      <VButton ref="button" @click="popupOpen = !popupOpen">
        <VIcon
          class="switch-icon"
          icon="mdi-checkbox-marked-circle-outline"
          :size="smallSize ? 16 : 24"
        ></VIcon>
        {{ options.optionDisplayName }}
      </VButton>
      <VPopup
        v-model="popupOpen"
        class="switch-options-popup widgets-popup"
        :trigger-element="button.root"
        esc-close
        auto-destroy
      >
        <component
          :is="options.radio ? 'RadioButton' : 'CheckBox'"
          v-for="name of Object.keys(options.switches)"
          :key="name"
          :class="{ dim: isDim(name) }"
          v-bind="mergedSwitchProps"
          :checked="componentOptions[`switch-${name}`]"
          @change="componentOptions[`switch-${name}`] = $event"
        >
          {{ options.switches[name].displayName }}
        </component>
      </VPopup>
    </template>
    <template v-else>
      <div class="switch-options-grid">
        <component
          :is="options.radio ? 'RadioButton' : 'CheckBox'"
          v-for="name of Object.keys(options.switches)"
          :key="name"
          :class="{ dim: isDim(name) }"
          v-bind="mergedSwitchProps"
          :checked="componentOptions[`switch-${name}`]"
          @change="componentOptions[`switch-${name}`] = $event"
        >
          {{ options.switches[name].displayName }}
        </component>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, useTemplateRef } from 'vue'
import { VPopup, VButton, VIcon } from '@/ui'
import { getComponentSettings } from '../core/settings'

const {
  options,
  smallSize = false,
  popupMode = true,
} = defineProps<{
  options: {
    componentName: string
    optionDisplayName: string
    switches: Record<string, { displayName: string }>
    radio?: boolean
    dimAt?: 'checked' | 'notChecked'
    switchProps?: {
      checkedIcon?: string
      notCheckedIcon?: string
    }
  }
  smallSize?: boolean
  popupMode?: boolean
}>()

const rootRef = useTemplateRef('rootRef')
const button = useTemplateRef('button')

const popupOpen = ref(false)
const componentOptions = ref(getComponentSettings(options.componentName).options)

const mergedSwitchProps = computed(() => ({
  checkedIcon: 'mdi-eye-off-outline',
  notCheckedIcon: 'mdi-eye-outline',
  ...options.switchProps,
}))

const updateColumnsCount = () => {
  const element = rootRef.value as HTMLElement
  const columns = Math.ceil(Object.keys(options.switches).length / 12)
  element.style.setProperty('--columns', columns.toString())
}

const isDim = (name: string) => {
  if (options.dimAt === 'checked' || options.dimAt === undefined) {
    return componentOptions.value[`switch-${name}`]
  }
  if (options.dimAt === 'notChecked') {
    return !componentOptions.value[`switch-${name}`]
  }
  return false
}

watch(
  () => options,
  () => {
    updateColumnsCount()
  },
)

onMounted(() => {
  updateColumnsCount()
})
</script>

<style lang="scss">
@import 'common';
.switch-options {
  position: relative;
  --columns: 1;
  &.grid {
    width: 100%;
  }
  .switch-icon {
    margin-right: 8px;
    opacity: 0.75;
    transform: scale(0.9);
  }
  .dim {
    opacity: 0.5;
  }
  &-grid {
    font-size: 12px;
    display: grid;
    grid-template-columns: repeat(auto-fill, 50%);
  }
  &-popup {
    font-size: 12px;
    transition: 0.2s ease-out;
    transform-origin: left;
    transform: translateY(-50%) scale(0.9);
    top: 50%;
    left: calc(100% + 8px);
    @include default-background-color();
    @include shadow();
    white-space: nowrap;
    padding: 4px;
    display: grid;
    width: max-content;
    grid-template-columns: repeat(var(--columns), auto);
    border-radius: 5px;
    border: 1px solid #8882;
    max-height: calc(100vh - 100px);
    @include no-scrollbar();

    &.open {
      transform: translateY(-50%) scale(1);
    }
    body.settings-panel-dock-right & {
      right: calc(100% + 8px);
      left: unset;
      transform-origin: right;
    }
  }
  &.small-size .switch-options-popup {
    transform-origin: top;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) scale(0.9);
    &.open {
      transform: translateX(-50%) scale(1);
    }
  }
}
</style>
