<template>
  <div class="settings-panel" :class="{ collapsed, peek }">
    <div class="settings-panel-header">
      <VIcon icon="settings-outline" />
      <div class="title">设置</div>
      <div
        class="peek"
        title="透视"
        style="margin-left: auto"
        @mouseover="peek = true"
        @mouseout="peek = false"
      >
        <VIcon icon="eye" :size="18" />
      </div>
      <div class="close" @click="emit('close')">
        <VIcon icon="close" :size="18" />
      </div>
    </div>
    <div class="settings-panel-content">
      <div ref="sidebarContainer" class="sidebar">
        <ComponentTags ref="componentTags" @change="searchFilter = $event" />
      </div>
      <div ref="mainContainer" class="main">
        <div ref="componentList" class="component-list">
          <div class="settings-panel-search-bar">
            <TextBox
              :text="searchKeyword"
              class="settings-panel-search"
              placeholder="搜索"
              @change="searchKeyword = $event"
            />
            <VButton
              v-for="action of searchBarActions"
              :key="action.key"
              type="transparent"
              icon
              :title="
                typeof action.title === 'function' ? action.title(searchBarContext) : action.title
              "
              :disabled="action.disabled ? action.disabled(searchBarContext) : false"
            >
              <VIcon :icon="action.icon" :size="18" @click="action.run(searchBarContext)" />
            </VButton>
          </div>
          <div
            v-for="c of renderedComponents"
            :key="c.name"
            @click.ctrl.stop.capture="selectMultipleComponent(c)"
            @click.shift.stop.capture="selectMultipleComponent(c, true)"
          >
            <ComponentSettings
              :class="{ selected: isComponentSelected(c.name) }"
              :component-data="c"
              :data-name="c.name"
              @click.native="selectComponent(c)"
            >
            </ComponentSettings>
          </div>
          <VEmpty v-if="renderedComponents.length === 0" />
        </div>
      </div>
      <VPopup
        ref="detailsPopup"
        class="component-detail-panel"
        :trigger-element="componentList"
        :model-value="componentDetailOpen"
        @update:modelValue="() => {}"
        @popup-change="!$event && closePopper()"
      >
        <ComponentDetail
          v-if="selectedComponent"
          :key="selectedComponent.name"
          :component-data="selectedComponent"
          @close="closePopper()"
        />
      </VPopup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, useTemplateRef } from 'vue'
import { VIcon, TextBox, VPopup, VEmpty, VButton } from '@/ui'
import { getHook } from '@/plugins/hook'
import { deleteValue } from '@/core/utils'
import ComponentSettings from './ComponentSettings.vue'
import { ComponentMetadata, components } from '../component'
import ComponentDetail from './ComponentDetail.vue'
import ComponentTags from './ComponentTags.vue'
import { getDescriptionText } from '../description'
import { searchBarActions } from './search-bar-actions'
import { SearchBarActionContext } from './search-bar-actions-types'

const emit = defineEmits(['close'])

const componentTags = useTemplateRef('componentTags')
const componentList = useTemplateRef('componentList')

const defaultSearchFilter = (items: ComponentMetadata[]) => items

const renderedComponentsRef = ref<ComponentMetadata[]>(components.filter(c => !c.hidden))
const selectedComponent = ref<ComponentMetadata | null>(null)
const selectedComponents = ref<ComponentMetadata[]>([])
const componentDetailOpen = ref(false)
const collapsed = ref(false)
const peek = ref(false)
const searchKeyword = ref('')
const searchFilter = ref<(items: ComponentMetadata[]) => ComponentMetadata[]>(defaultSearchFilter)

const isComponentSelected = (name: string) =>
  selectedComponents.value.some((c: ComponentMetadata) => c.name === name)

// const tags = computed(() => {
//   const renderedComponents = renderedComponentsRef.value
//   let tagsArray = [] as (ComponentTag & { count: number })[]
//   renderedComponents.forEach(it =>
//     it.tags.forEach(t => {
//       tagsArray.push({ count: 0, ...t })
//     }),
//   )
//   const counts = lodash.countBy(tagsArray, (t: ComponentTag) => t.name)
//   tagsArray = lodash.uniqBy(tagsArray, t => t.name)
//   tagsArray.forEach(t => (t.count = counts[t.name]))
//   return tagsArray
// })

const searchBarContext = computed((): SearchBarActionContext => {
  return {
    components,
    selectedComponent: selectedComponent.value,
    selectedComponents: selectedComponents.value,
    searchKeyword: searchKeyword.value,
    searchFilter: searchFilter.value,
  }
})

const renderedComponents = computed({
  get: () => renderedComponentsRef.value,
  set: value => (renderedComponentsRef.value = value),
})

const closePopper = () => {
  selectedComponent.value = null
  selectedComponents.value = []
  componentDetailOpen.value = false
}

const selectMultipleComponent = (component: ComponentMetadata, listSelect = false) => {
  if (selectedComponent.value && listSelect) {
    // handle shift + click
    const { name } = component
    const { name: selectedComponentName } = selectedComponent.value
    const list = renderedComponentsRef.value
    let startIdx = list.findIndex(c => c.name === selectedComponentName)
    let endIdx = list.findIndex(c => c.name === name)
    if (startIdx > endIdx) {
      // if start index is greater than end index, swap them
      ;[startIdx, endIdx] = [endIdx, startIdx]
    }
    selectedComponents.value = list.slice(startIdx, endIdx + 1)
    return
  }
  const selectedList = selectedComponents.value
  const selectedComponentItem = selectedList.find(c => c.name === component.name)
  if (selectedComponentItem) {
    deleteValue(selectedList, c => c.name === selectedComponentItem.name)
  } else {
    selectedList.push(component)
  }
}

const selectComponent = (component: ComponentMetadata) => {
  selectedComponents.value = []
  const closeHooks = getHook('settingsPanel.componentDetail.close')
  const openHooks = getHook('settingsPanel.componentDetail.open')
  const selectedName = selectedComponent.value?.name
  const isAlreadySelected = componentDetailOpen.value && selectedName === component.name
  closeHooks.before(selectedName)
  closePopper()
  closeHooks.after(selectedName)
  if (isAlreadySelected) {
    return
  }
  openHooks.before(component.name)
  selectedComponents.value.push(component)
  selectedComponent.value = component
  componentDetailOpen.value = true
  openHooks.after(component.name)
}

const updateRenderedComponents = async () => {
  const textMap: Record<string, string> = await (async () => {
    if (!searchKeyword.value) {
      return {}
    }
    return Object.fromEntries(
      await Promise.all(
        components.map(async c => [
          c.name,
          [
            c.name,
            c.displayName,
            c.tags.map(t => `${t.name}\n${t.displayName}`).join('\n'),
            await getDescriptionText(c),
          ]
            .join('\n')
            .toLowerCase(),
        ]),
      ),
    )
  })()
  const internalFiltered = components.filter(c => {
    if (c.hidden) {
      return false
    }
    if (searchKeyword.value) {
      const text = textMap[c.name]
      if (!text) {
        return false
      }
      return text.includes(searchKeyword.value.toLowerCase())
    }
    return true
  })
  renderedComponentsRef.value = searchFilter.value(internalFiltered)
}

watch(
  searchKeyword,
  lodash.debounce(() => {
    updateRenderedComponents()
  }, 200),
)

watch(searchFilter, () => {
  searchKeyword.value = ''
  selectedComponents.value = []
  updateRenderedComponents()
})

watch(
  () => components,
  () => {
    updateRenderedComponents()
    componentTags.value.refreshTags()
    if (!components.some((c: ComponentMetadata) => c.name === selectedComponent.value?.name)) {
      selectedComponent.value = null
    }
  },
  { deep: true },
)
</script>

<style lang="scss">
@import 'common';

.settings-panel-popup {
  z-index: 1000;
  .settings-panel {
    @include shadow();
    @include v-stretch();
    --header-height: 50px;
    --settings-panel-background: #fff;
    background-color: var(--settings-panel-background);
    position: relative;
    overscroll-behavior: contain;
    border-radius: 8px;
    color: black;
    border: 1px solid #8882;
    box-sizing: content-box;
    width: auto;
    min-width: 320px;
    height: var(--panel-height);
    transition: opacity 0.2s 0.2s ease-out;
    body.dark & {
      --settings-panel-background: var(--be-color-panel-bg, #222);
      color: var(--be-color-text-title, #eee);
      // border-color: #333;
    }
    .settings-panel-header {
      box-sizing: border-box;
      height: var(--header-height);
      padding: 12px;
      border-bottom: 1px solid #8882;
      @include h-center(8px);
      @include text-color();
      // body.dark & {
      //   border-color: #333;
      // }
      .title {
        font-size: 18px;
        @include semi-bold();
      }
      .collaspe {
        .be-icon {
          font-size: 28px;
        }
      }
      .peek {
        cursor: pointer;
      }
      .collaspe,
      .close {
        .be-icon {
          cursor: pointer;
          transition: 0.2s ease-out;
          &:hover {
            color: var(--theme-color);
          }
        }
      }
    }
    .settings-panel-content {
      flex: 1;
      display: flex;
      max-height: calc(var(--panel-height) - var(--header-height));
      .sidebar {
        display: flex;
        flex-direction: column;
        z-index: 2;
      }
      .main {
        flex: 1;
        padding: 0;
        position: relative;
        @include no-scrollbar();
        .be-empty {
          min-height: 36px;
          padding: 7px;
        }
        .component-list {
          display: grid;
          grid-template-columns: auto;
          gap: 0;
          width: auto;
          margin: 0;
          // > * {
          //   margin-right: 12px;
          //   margin-bottom: 12px;
          // }

          .transition {
            &-move,
            &-enter-active,
            &-leave-active {
              transition: all 0.5s ease;
            }
            &-enter-from,
            &-leave-to {
              opacity: 0;
              transform: translateY(-30px);
            }
            &-leave-active {
              position: absolute;
            }
          }

          .settings-panel-search-bar {
            @include h-center();
            background-color: var(--settings-panel-background);
            padding-right: 8px;
            height: 36px;
            box-sizing: border-box;
            border-bottom: 1px solid #8882;
            position: sticky;
            top: 0;
            z-index: 1;
            .settings-panel-search {
              align-self: stretch;
              font-size: 13px;
              box-shadow: none;
              input {
                padding: 4px 10px;
              }
            }
          }
        }
        > * {
          flex: 1;
        }
      }
    }
    .component-detail-panel {
      @include popup();
      @include v-stretch();
      top: 50%;
      left: calc(100% - 12px);
      height: calc(100% - 22px);
      z-index: -1;
      transform: translateZ(0) translateY(-50%) translateX(calc(-48% * var(--direction)));
      transition: transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1),
        opacity 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
      padding-left: 12px;
      body.settings-panel-dock-right & {
        left: unset;
        right: calc(100% - 12px);
        padding: 0 12px 0 0;
      }
      &.open {
        transform: translateZ(0) translateY(-50%) translateX(0);
      }
    }
    &.collapsed {
      height: auto;
      transform: translateY(calc(50% - 45vh));
      .header,
      body.dark & .header {
        border-color: transparent;
      }
      .sidebar,
      .main {
        opacity: 0;
        padding: 0;
        pointer-events: none;
      }
      .sidebar {
        display: none;
      }
      opacity: 0.3;
      &:hover {
        opacity: 1;
      }
    }
    &.peek {
      opacity: 0.1;
    }
  }
}
</style>
