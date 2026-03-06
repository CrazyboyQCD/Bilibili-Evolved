<template>
  <div class="component-tags-preview">
    <VPopup
      v-model="selectedSubPageOpen"
      :lazy="false"
      :trigger-element="selectedSubPageTrigger"
      class="settings-panel-sub-page"
    >
      <keep-alive>
        <component :is="selectedSubPage" v-if="selectedSubPage" />
      </keep-alive>
    </VPopup>
    <div class="icon-list">
      <div
        v-for="t of tags"
        :key="t.name"
        class="component-tags-item"
        :class="{ selected: t.name === selectedTagName }"
        @click="selectTag(t)"
      >
        <VIcon :size="20" :icon="t.icon" :style="{ color: t.color }" />
      </div>
      <div class="grow"></div>
      <div v-for="t of subPages" :key="t.name" class="component-tags-item">
        <VIcon :size="20" :icon="t.icon" :style="{ color: 'inherit' }" />
      </div>
    </div>
    <div class="component-tags">
      <div
        v-for="t of tags"
        :key="t.name"
        class="component-tags-item"
        :class="{ selected: t.name === selectedTagName }"
        @click="selectTag(t)"
      >
        <VIcon :size="20" :icon="t.icon" :style="{ color: t.color }" />
        <div class="tag-name">
          {{ t.displayName }}
        </div>
        <div class="tag-count">({{ t.count }})</div>
      </div>
      <div class="grow"></div>
      <div
        v-for="t of subPages"
        :key="t.name"
        class="component-tags-item"
        @click="openSubPage($event, t.component)"
      >
        <VIcon :size="20" :icon="t.icon" :style="{ color: 'inherit' }" />
        <div class="tag-name">
          {{ t.displayName }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, Component } from 'vue'
import { ascendingSort } from '@/core/utils/sort'
import VIcon from '@/ui/icon/VIcon.vue'
import VPopup from '@/ui/VPopup.vue'
import { ComponentMetadata, components, ComponentTag } from '../component'
import { subPages } from './sub-pages'
import { SettingsTag, tagFilters } from './tag-filter'

// 标签数据
const tags = ref<SettingsTag[]>([])
const selectedTagName = ref('')

const selectedSubPage = ref<Component | null>(null)
const selectedSubPageOpen = ref(false)
const selectedSubPageTrigger = ref<HTMLElement | null>(null)

const emit = defineEmits<{
  change: [(components: ComponentMetadata[]) => ComponentMetadata[]]
}>()

const refreshTags = () => {
  const renderedComponents = components.filter(c => !c.hidden)
  const newTags = tagFilters.flatMap(f => {
    if (typeof f === 'function') {
      return f({ components, renderedComponents })
    }
    return f
  })
  tags.value = newTags.sort(ascendingSort(it => it.order))
}

const reset = () => {
  selectedTagName.value = tags.value[0].name
}

const selectTag = (tag: ComponentTag) => {
  selectedTagName.value = tag.name
  const { filter } = tags.value.find(t => t.name === tag.name)
  emit('change', filter)
}

const openSubPage = async (e: MouseEvent, component: Component) => {
  if (selectedSubPage.value === component) {
    selectedSubPageOpen.value = !selectedSubPageOpen.value
    return
  }
  selectedSubPage.value = component
  selectedSubPageTrigger.value = e.currentTarget as HTMLElement
  await nextTick()
  selectedSubPageOpen.value = true
}

refreshTags()
reset()

defineExpose({
  refreshTags,
})

onMounted(() => {
  selectTag(tags.value[0])
})
</script>

<style lang="scss">
@import 'common';
.settings-panel-content .sidebar > * {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .settings-panel-sub-page {
    font-size: 13px;
    top: 12px;
    transition: 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
    transform: translateX(calc(-12.5% * var(--direction)));
    min-width: 372px;
    padding: 12px;
    box-sizing: border-box;
    @include popup();
    &.open {
      transform: translateX(0);
    }
    .sub-page-row {
      @include h-center();
      justify-content: space-between;
      flex-shrink: 0;
      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }
    .separator {
      height: 1px;
      background-color: #8882;
      width: 100%;
    }
  }
  .component-tags-item {
    background-color: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    white-space: nowrap;
    padding: 8px;
    padding-right: 10px;
    font-size: 13px;
    .tag-name {
      margin-right: 4px;
      margin-left: 8px;
    }
    &:hover,
    &.selected {
      background-color: #8882;
    }
  }
  .icon-list,
  .component-tags {
    flex-grow: 1;
    max-height: calc(var(--panel-height) - var(--header-height));
    @include no-scrollbar();
    background-color: transparent;
    width: 40px;
    display: flex;
    flex-direction: column;
    .grow {
      flex-grow: 1;
    }
    .be-icon {
      margin-left: 2px;
    }
  }
  .component-tags {
    height: 100%;
    width: auto;
    position: absolute;
    top: 0;
    opacity: 0;
    transition: 0.2s ease-out;
    pointer-events: none;
    background-color: #fff;
    border-right: 1px solid #8882;

    body.dark & {
      background-color: var(--be-color-panel-bg, #222);
    }
  }
  .icon-list:hover ~ .component-tags,
  .component-tags:hover {
    opacity: 1;
    pointer-events: initial;
  }
}
</style>
