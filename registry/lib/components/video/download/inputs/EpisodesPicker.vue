<template>
  <div class="episodes-picker download-video-config-section">
    <div class="episodes-picker-header">
      <div class="episodes-picker-title">选集:</div>
      <div class="episodes-picker-checked-ratio">
        {{ checkedRatio }}
      </div>
      <div class="episodes-picker-actions">
        <VButton
          class="select-all"
          title="全选"
          type="transparent"
          @click="forEachItem(it => (it.isChecked = true))"
        >
          <VIcon :size="16" icon="mdi-checkbox-multiple-marked-circle" />
        </VButton>
        <VButton
          class="deselect-all"
          title="全不选"
          type="transparent"
          @click="forEachItem(it => (it.isChecked = false))"
        >
          <VIcon :size="16" icon="mdi-checkbox-multiple-blank-circle-outline" />
        </VButton>
        <VButton
          class="invert-selection"
          title="反选"
          type="transparent"
          @click="forEachItem(it => (it.isChecked = !it.isChecked))"
        >
          <VIcon :size="16" icon="mdi-circle-slice-4" />
        </VButton>
      </div>
    </div>
    <div class="episodes-picker-items">
      <div v-if="episodeItems.length === 0" class="episodes-picker-empty">
        <VEmpty />
      </div>
      <div v-for="(item, index) of episodeItems" :key="item.key" class="episodes-picker-item">
        <CheckBox
          :checked="item.isChecked"
          icon-position="left"
          :data-aid="item.inputItem.aid"
          :data-cid="item.inputItem.cid"
          :data-bvid="item.inputItem.bvid"
          @change="checked => (item.isChecked = checked)"
          @click.native="shiftSelect($event, item, index)"
        >
          <span class="episode-title">
            {{ item.title }}
          </span>
          <span v-if="item.durationText" class="episode-duration">
            {{ item.durationText }}
          </span>
        </CheckBox>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { VButton, VIcon, CheckBox, VEmpty } from '@/ui'
import { EpisodeItem } from './episode-item-types'

const { api } = defineProps<{
  api: (component: any) => Promise<EpisodeItem[]>
}>()

const episodeItems = ref<EpisodeItem[]>([])
const lastCheckedEpisodeIndex = ref(-1)

const checkedRatio = computed(() => {
  const checked: number = episodeItems.value.filter((it: EpisodeItem) => it.isChecked).length
  return `(${checked}/${episodeItems.value.length})`
})

const inputItems = computed(() => episodeItems.value.map(it => it.inputItem))
const checkedInputItems = computed(() =>
  episodeItems.value.filter(it => it.isChecked).map(it => it.inputItem),
)

const getEpisodeItems = async () => {
  if (episodeItems.value.length > 0) {
    return
  }
  episodeItems.value = await api({})
}

onMounted(() => {
  getEpisodeItems()
})

const shiftSelect = (e: MouseEvent, item: EpisodeItem, index: number) => {
  if (!e.shiftKey || lastCheckedEpisodeIndex.value === -1) {
    lastCheckedEpisodeIndex.value = index
    return
  }
  if (e.shiftKey && lastCheckedEpisodeIndex.value !== -1) {
    episodeItems.value
      .slice(
        Math.min(lastCheckedEpisodeIndex.value, index) + 1,
        Math.max(lastCheckedEpisodeIndex.value, index),
      )
      .forEach(it => {
        it.isChecked = !it.isChecked
      })
    lastCheckedEpisodeIndex.value = index
    e.preventDefault()
  }
}

const forEachItem = (action: (item: EpisodeItem, index: number) => void) => {
  const items: EpisodeItem[] = episodeItems.value
  items.forEach(action)
}
defineExpose({
  inputItems,
  checkedInputItems,
})
</script>
<style lang="scss">
@import 'common';
.episodes-picker {
  &-header {
    @include h-center();
  }
  &-checked-ratio {
    flex-grow: 1;
    margin-left: 4px;
  }
  &-actions {
    @include h-center();
    .be-button {
      padding: 4px;
      &.invert-selection .be-icon {
        font-size: 14px;
      }
      &.select-all .be-icon,
      &.deselect-all .be-icon {
        transform: translateY(1px);
      }
    }
  }
  &-items {
    max-height: 400px;
    overflow: auto;
    &:not(:empty) {
      margin-top: 4px;
      border: 1px solid #8884;
      border-radius: 6px;
    }
    .be-check-box {
      padding: 2px 6px;
    }
    .episode-duration {
      margin-right: 4px;
      text-align: right;
      flex: 1 1 0;
      opacity: 0.5;
    }
  }
  &-empty {
    @include h-center();
    justify-content: center;
    padding: 4px 0;
  }
}
</style>
