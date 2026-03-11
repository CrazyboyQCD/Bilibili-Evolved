<template>
  <div class="grid-row">
    <div class="row-name" :title="row.name">
      {{ row.displayName }}
    </div>
    <div
      class="row-default-binding row-binding"
      :class="{
        overwritten: isOverwrittern(presets[selectedPreset], customKeyBindings),
        'not-set': presetBase[row.name] === undefined,
      }"
    >
      {{ showReadonlyKey(presetBase) }}
    </div>
    <div
      class="row-preset-binding row-binding"
      :class="{
        overwritten: isOverwrittern(customKeyBindings),
        'not-set': presets[selectedPreset][row.name] === undefined,
      }"
    >
      {{ showReadonlyKey(presets[selectedPreset]) }}
    </div>
    <div class="row-custom-binding row-binding">
      <div v-if="editable" class="custom-binding-edit">
        <TextBox
          ref="customBindingTextBox"
          placeholder="禁用"
          change-on-blur
          :text="customKeyBindings[row.name]"
          :validator="() => ''"
          @change="updateCustomBinding"
        />
        <VButton type="transparent" title="删除自定义键位" @click="removeCustomBinding()">
          <VIcon icon="mdi-trash-can-outline" :size="16" />
        </VButton>
      </div>
      <div v-else class="custom-binding-add">
        <VButton type="transparent" title="添加自定义键位" @click="addCustomBinding()">
          <VIcon icon="mdi-plus" :size="16" />
        </VButton>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick, useTemplateRef } from 'vue'
import { TextBox, VButton, VIcon } from '@/ui'
import { getComponentSettings } from '@/core/settings'
import { presetBase, presets } from '../presets'
import { Options } from '../options'

interface Row {
  name: string
  displayName: string
}

const keymapOptions = getComponentSettings<Options>('keymap').options

const { row, selectedPreset } = defineProps<{
  row: Row
  selectedPreset: string
}>()

const customBindingTextBox = useTemplateRef('customBindingTextBox')

const customKeyBindings = ref<Record<string, string>>(keymapOptions.customKeyBindings)
const editable = ref(false)

const checkEditable = () => {
  editable.value = customKeyBindings.value[row.name] !== undefined
}

const showReadonlyKey = (preset: Record<string, string>) => {
  const { name } = row
  const key = preset[name]
  if (key === undefined) {
    return '继承'
  }
  if (key === '') {
    return '禁用'
  }
  return key
}

const isOverwrittern = (...higherPresets: Record<string, string>[]) => {
  const { name } = row
  return higherPresets.some(p => p[name] !== undefined)
}

const addCustomBinding = async () => {
  const { name } = row
  customKeyBindings.value[name] = ''
  checkEditable()
  await nextTick()
  customBindingTextBox.value.inputRef.focus()
}

const removeCustomBinding = () => {
  const { name } = row
  delete customKeyBindings.value[name]
  checkEditable()
}

const updateCustomBinding = (text: string) => {
  console.log('update', text)
  const { name } = row
  customKeyBindings.value[name] = text
}

checkEditable()
</script>
<style lang="scss">
@import 'common';

.keymap-settings-grid .grid-row {
  padding: 2px 0;
  .row-name,
  .row-default-binding,
  .row-preset-binding {
    @include single-line();
    @include no-scrollbar();
    &.not-set,
    &.overwritten {
      opacity: 0.25;
    }
  }
  .row-binding {
    &,
    & input {
      font-family: monospace, sans-serif;
    }
  }
  .row-custom-binding {
    .be-button {
      padding: 4px;
      margin-right: 4px;
    }
    .be-icon {
      margin: 0;
    }
    .be-textbox {
      margin-right: 6px;
      flex: 1 0 auto;
    }
    .custom-binding-edit,
    .custom-binding-add {
      @include h-center();
      flex: 1 0 auto;
    }
  }
}
</style>
