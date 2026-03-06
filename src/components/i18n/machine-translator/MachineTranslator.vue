<template>
  <div class="translate-container">
    <div v-if="!working && !translated" class="translate" @click="translate()">
      <VIcon :size="14" icon="mdi-earth" />翻译
    </div>
    <div v-if="translated" class="translated">
      <a :href="activeTranslator && activeTranslator.link" target="_blank"> 翻译自 </a>
      <VDropdown
        :items="Object.values(translateProviders)"
        :value="activeTranslator as MachineTranslateProvider"
        :key-mapper="(it: MachineTranslateProvider) => it.name"
        @change="changeTranslator($event)"
      >
        <template #item="{ item }">
          {{ item.name }}
        </template>
      </VDropdown>
      <!-- <a
        :href="activeTranslator.link"
        target="_blank"
      >{{ activeTranslator.name }}</a>: -->
    </div>
    <VIcon v-if="working" :size="18" icon="mdi-loading" class="translating mdi-spin" />
    <div v-if="!working && translated" class="translate-result" v-text="result"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getComponentSettings } from '@/core/settings'
import { logError } from '@/core/utils/log'
import { VDropdown, VIcon } from '@/ui'
import { getTranslator, translateProviders, MachineTranslateProvider } from './translators'
import { I18nOptions } from '..'

const MachineTranslatorClass = 'machine-translator-enabled'

const { text } = defineProps<{
  text: string
}>()

const result = ref('')
const working = ref(false)
const activeTranslator = ref<MachineTranslateProvider>({} as MachineTranslateProvider)

const translated = computed(() => {
  return result.value !== ''
})

const translate = async () => {
  try {
    working.value = true
    // 移除 #话题# , '#'似乎会干扰翻译器
    const cleanText = text.replace(/#(.+?)#/g, '')
    activeTranslator.value = getTranslator()
    const translator = activeTranslator.value
    result.value = await translator.translate(cleanText)
  } catch (error) {
    logError(error)
  } finally {
    working.value = false
  }
}

const changeTranslator = (translator: MachineTranslateProvider) => {
  getComponentSettings<I18nOptions>('i18n').options.translator = translator.name
  translate()
}

onMounted(() => {
  document.body.classList.add(MachineTranslatorClass)
})
</script>

<style lang="scss">
@import 'common';

.bb-comment .translate-container,
.card-content .translate-container {
  margin: 4px 0 2px 0;
  display: inline-block;
  font-weight: normal;
  font-size: 14px;
  .translated {
    font-size: 12px;
    @include h-center(8px);
    a {
      color: #aaa !important; // 不然会被夜间盖掉
      &:hover {
        color: var(--theme-color) !important;
      }
    }
  }
  .translate {
    @include h-center(2px);
    font-size: 12px;
    height: 18px;
    color: #aaa;
    cursor: pointer;
    &:hover {
      color: var(--theme-color);
    }
  }
  .translate-result {
    padding-top: 6px;
    white-space: pre-wrap;
    line-height: 20px;
    word-break: break-all;
    overflow-wrap: break-word;
    body.dark & {
      color: #eee;
    }
  }
}
body.machine-translator-enabled {
  .bb-comment .reply-con .text-con {
    display: block;
    margin: 0 !important;
  }
  .card-content .translate-container {
    margin: 13px 0 2px 0;
  }
}
</style>
