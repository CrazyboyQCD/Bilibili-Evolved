<template>
  <div class="component-option" :data-type="type">
    <div class="option-name">
      {{ displayName }}
    </div>
    <TextBox
      v-if="type === 'text' || type === 'number'"
      change-on-blur
      :validator="option.validator as ComponentOptionValidator<string>"
      :text="value.toString()"
      :placeholder="value.toString()"
      @change="type === 'text' ? valueChange($event) : numberChange($event)"
    />
    <TextArea
      v-if="type === 'textArea'"
      change-on-blur
      :validator="option.validator as ComponentOptionValidator<string>"
      :text="value.toString()"
      :placeholder="value.toString()"
      @change="valueChange($event)"
    />
    <SwitchBox
      v-if="type === 'boolean'"
      :checked="value as boolean"
      @change="valueChange($event)"
    />
    <ColorPicker
      v-if="type === 'color'"
      :compact="true"
      :popup-offset="-95"
      :color="value as string"
      @change="valueChange($event)"
    />
    <RangeInput
      v-if="type === 'range'"
      :validator="option.validator as ComponentOptionValidator<Range<string>>"
      :range="value as Range"
      @change="valueChange($event)"
    />
    <ImagePicker
      v-if="type === 'image'"
      :image="value as ImageItem"
      @change="valueChange($event)"
    />
    <VDropdown
      v-if="type === 'dropdown'"
      :value="value"
      :items="getDropdownItems(option.dropdownEnum)"
      :key-mapper="it => it"
      @change="valueChange($event)"
    >
      <template #item="{ item }">
        {{ item }}
      </template>
    </VDropdown>
    <SwitchOptions
      v-if="type === 'switch'"
      small-size
      :popup-mode="false"
      :options="option.defaultValue as any"
    />
    <VSlider
      v-if="type === 'slider'"
      v-bind="option.slider"
      :value="value as number"
      @change="debounceValueChange($event)"
    />
    <div v-if="type === 'unknown'" class="unknown-option-type">未知的选项类型</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  TextBox,
  TextArea,
  SwitchBox,
  ColorPicker,
  RangeInput,
  VDropdown,
  ImagePicker,
  VSlider,
} from '@/ui'
import { getComponentSettings, ComponentSettings } from '@/core/settings'
import { ComponentOptionValidator, OptionMetadata } from '../component'
import { getDropdownItems } from './dropdown'
import SwitchOptions from '../SwitchOptions.vue'
import { Range } from '@/ui/range'
import { ImageItem } from '@/ui/image-store'

const { name, displayName, option, component } = defineProps<{
  name: string
  displayName?: string
  option: OptionMetadata
  component: any
}>()

const settings = ref<ComponentSettings>(getComponentSettings(component))
const value = ref(settings.value.options[name])

const type = computed(() => {
  const { defaultValue } = option
  switch (typeof defaultValue) {
    case 'boolean':
      return 'boolean'
    case 'number': {
      if (option.slider) {
        return 'slider'
      }
      return 'number'
    }
    case 'string': {
      if (option.color) {
        return 'color'
      }
      if (option.dropdownEnum) {
        return 'dropdown'
      }
      if (option.multiline) {
        return 'textArea'
      }
      return 'text'
    }
    case 'object': {
      if ('start' in defaultValue && 'end' in defaultValue) {
        return 'range'
      }
      if ('name' in defaultValue && 'url' in defaultValue) {
        return 'image'
      }
      if ('name' in defaultValue && 'switches' in defaultValue) {
        return 'switch'
      }
      return 'unknown'
    }
    default:
      return 'unknown'
  }
})

const valueChange = (newValue: unknown) => {
  settings.value.options[name] = newValue
  value.value = newValue
}

const numberChange = (newValue: string) => {
  const numberValue = parseFloat(newValue)
  if (Number.isNaN(numberValue)) {
    return
  }
  settings.value.options[name] = numberValue
  value.value = numberValue
}

const debounceValueChange = lodash.debounce(valueChange, 200)
</script>

<style lang="scss">
.component-option {
  display: flex;
  align-items: center;
  min-height: 24px;
  .unknown-option-type,
  .be-slider,
  .be-range-input,
  .be-text-box {
    flex: 1 0 0;
  }
  @each $type in ('boolean', 'dropdown', 'color') {
    &[data-type='#{$type}'] .option-name {
      flex: 1 0 0;
    }
  }
  &[data-type='switch'] {
    justify-content: center;
    .option-name {
      display: none;
    }
  }
  .option-name {
    margin-right: 8px;
  }
  .be-slider {
    margin: 0 8px;
  }
  textarea {
    resize: vertical;
    min-height: 16px;
  }
}
</style>
