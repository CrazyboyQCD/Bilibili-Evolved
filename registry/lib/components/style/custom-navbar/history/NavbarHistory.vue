<template>
  <div class="custom-navbar-history-list">
    <div class="header">
      <div class="header-row">
        <div class="search">
          <TextBox :text="search" placeholder="搜索" linear @change="search = $event" />
        </div>
        <div class="operations">
          <div class="operation">
            <VButton title="刷新" round @click="reloadHistoryItems()">
              <VIcon icon="mdi-refresh" :size="16" />
            </VButton>
          </div>
          <div class="operation" @click="toggleHistoryPause">
            <VButton v-if="!paused" title="暂停记录历史" round>
              <VIcon icon="mdi-pause" :size="14" />
            </VButton>
            <VButton v-else title="继续记录历史" round>
              <VIcon icon="mdi-play" :size="14" />
            </VButton>
          </div>
          <a class="operation" target="_blank" href="https://www.bilibili.com/history">
            <VButton title="查看更多" round>
              <VIcon icon="mdi-dots-horizontal" :size="18" />
            </VButton>
          </a>
        </div>
      </div>
      <div class="header-row">
        <div class="row-title">过滤:</div>
        <div class="type-filters">
          <div v-for="t of types" :key="t.name" class="type-filter">
            <RadioButton
              :class="{ checked: t.checked }"
              :checked="t.checked"
              :disabled="loading"
              @change="toggleTypeFilter(t)"
            >
              {{ t.displayName }}
            </RadioButton>
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <VLoading v-if="loading" />
      <VEmpty v-else-if="!loading && groups.length === 0" />
      <transition-group v-else name="cards" tag="div" class="cards">
        <div v-for="g of groups" :key="g.name" class="time-group">
          <div class="time-group-name">
            {{ g.name }}
          </div>
          <transition-group name="time-group" tag="div" class="time-group-items">
            <div v-for="h of g.items" :key="h.id" class="time-group-item">
              <a class="history-cover-container" target="_blank" :href="h.url">
                <DpiImage
                  class="cover"
                  :src="h.cover"
                  :size="{ width: 160, height: 110 }"
                  placeholder-image
                />
                <div
                  v-if="h.progress"
                  class="progress"
                  :style="{ width: h.progress * 100 + '%' }"
                />
                <div v-if="h.pages !== undefined && h.pages > 1" class="floating pages">
                  {{ h.page }}P / {{ h.pages }}P
                </div>
              </a>
              <a class="title" target="_blank" :href="h.url" :title="h.title">{{
                h.title || h.upName + '的直播间'
              }}</a>
              <a
                class="up"
                target="_blank"
                :href="h.type === 'pgc' ? h.url : 'https://space.bilibili.com/' + h.upID"
                :title="h.upName"
              >
                <DpiImage v-if="h.upFaceUrl" class="up-face" :size="18" :src="h.upFaceUrl" />
                <div class="up-name">{{ h.upName }}</div>
              </a>
              <div class="history-info">
                <div v-if="h.progressText" class="progress-number">
                  {{ h.progress >= 0.95 ? '已看完' : h.progressText }}
                </div>
                <div
                  v-if="h.liveStatus !== undefined"
                  class="duration live-status"
                  :class="{ on: h.liveStatus === 1 }"
                >
                  {{ h.liveStatus === 1 ? '直播中' : '未开播' }}
                </div>
                <span
                  v-if="h.progressText || h.liveStatus !== undefined"
                  class="history-info-separator"
                  >|</span
                >
                <div v-if="h.timeText" class="time" :title="new Date(h.viewAt).toLocaleString()">
                  {{ h.timeText }}
                </div>
              </div>
            </div>
          </transition-group>
        </div>
        <ScrollTrigger v-if="canNextPage" key="scroll-trigger" @trigger="nextPage()" />
      </transition-group>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { bilibiliApi, getJsonWithCredentials, postTextWithCredentials } from '@/core/ajax'
import { getCsrf } from '@/core/utils'
import { descendingSort } from '@/core/utils/sort'
import {
  VButton,
  VIcon,
  RadioButton,
  TextBox,
  VLoading,
  VEmpty,
  ScrollTrigger,
  DpiImage,
} from '@/ui'
import { usePopper, UsePopperProps } from '../mixins'
import {
  navbarFilterTypes,
  TypeFilter,
  HistoryItem,
  getHistoryItems,
  group,
  HistoryType,
} from './types'

const popper = usePopper(defineProps<UsePopperProps>())

const types = ref(navbarFilterTypes)
const search = ref('')
const viewTime = ref(0)
const cards = ref<HistoryItem[]>([])
const groups = ref<{ name: string; items: HistoryItem[] }[]>([])
const loading = ref(true)
const hasMorePage = ref(true)
const paused = ref(false)

const filterFunc = (item: HistoryItem) => {
  const isAllType = navbarFilterTypes.find(it => it.name === HistoryType.All).checked
  if (!isAllType && navbarFilterTypes.some(t => t.name === item.type && !t.checked)) {
    return false
  }
  const content = search.value.toLowerCase()
  return item.title.toLowerCase().includes(content) || item.upName.toLowerCase().includes(content)
}

const updateGroups = () => {
  groups.value = group(cards.value.filter(filterFunc))
}

const nextPage = async () => {
  const items = await getHistoryItems(
    viewTime.value,
    navbarFilterTypes.find(t => t.checked),
  )
  const newCards: HistoryItem[] = lodash.uniqBy(
    cards.value.concat(items).sort(descendingSort((item: HistoryItem) => item.viewAt)),
    item => item.id,
  )
  cards.value = newCards
  updateGroups()
  if (newCards.length > 0) {
    viewTime.value = lodash.last(newCards).viewAt
  }
  hasMorePage.value = items.length !== 0
  if (hasMorePage.value && groups.value.length === 0) {
    await nextPage()
  }
}

const reloadHistoryItems = async () => {
  cards.value = []
  viewTime.value = 0
  hasMorePage.value = true
  loading.value = true
  try {
    await nextPage()
  } finally {
    loading.value = false
  }
}

const toggleTypeFilter = (typeFilter: TypeFilter) => {
  navbarFilterTypes.forEach(t => (t.checked = t.name === typeFilter.name))
  reloadHistoryItems()
}

const canNextPage = computed(() => {
  return search.value === '' && !loading.value && hasMorePage.value
})

const updateHistoryPauseState = async () => {
  const result = await bilibiliApi(
    getJsonWithCredentials('https://api.bilibili.com/x/v2/history/shadow'),
  )
  /*
    result == true: 暂停
    result == {}: 没暂停
  */
  paused.value = result === true
}

const toggleHistoryPause = async () => {
  const targetState = !paused.value
  try {
    paused.value = targetState
    await postTextWithCredentials(
      'https://api.bilibili.com/x/v2/history/shadow/set',
      new URLSearchParams({
        csrf: getCsrf(),
        switch: targetState.toString(),
      }).toString(),
    )
  } catch (error) {
    paused.value = !targetState
  }
}

const debounceReloadHistoryItems = lodash.debounce(reloadHistoryItems, 200)

watch(search, () => {
  debounceReloadHistoryItems()
})

const init = async () => {
  try {
    await Promise.all([nextPage(), updateHistoryPauseState()])
  } finally {
    loading.value = false
  }
}

init()

defineExpose({
  popupShow() {
    popper.popupShow()
  },
})
</script>
<style lang="scss">
@import 'common';
@import '../popup';

.custom-navbar-history-list {
  width: 400px;
  @include navbar-popup-height();
  font-size: 12px;
  padding: 0;
  margin: 0;
  @include v-stretch();
  justify-content: center;
  @mixin items-animation {
    &-enter,
    &-leave-to {
      opacity: 0;
      transform: translateY(-16px) scale(0.9);
    }
    &-leave-active {
      transition: 0.24s cubic-bezier(0.22, 0.61, 0.36, 1);
      position: absolute;
    }
  }
  @mixin round-button($size: 26px) {
    width: $size;
    height: $size;
    box-sizing: border-box;
  }
  .header {
    @include v-stretch(6px);
    margin: 16px 12px 4px 12px;
    .header-row {
      @include h-stretch(8px);
      .row-title {
        @include h-center();
      }
    }
    .type-filters {
      @include h-center(6px);
      .type-filter {
        .be-button {
          padding: 4px 8px 4px 6px;
          // color: #8888;
          // .be-icon {
          //   margin-right: 6px;
          // }
          // &.checked {
          //   color: inherit;
          // }
        }
      }
    }
    .search {
      flex: 1;
      .be-textbox {
        height: 100%;
      }
    }
    .operations {
      @include h-center(8px);
      .operation {
        .be-button {
          @include round-button();
        }
      }
    }
  }
  .content {
    @include v-stretch();
    @include no-scrollbar();
    justify-content: space-between;
    flex-grow: 1;
    .be-scroll-trigger,
    .be-empty,
    .be-loading {
      align-self: center;
      text-align: center;
      margin: 12px 0;
    }
    .cards {
      @include items-animation();
      flex: 1;
      scroll-behavior: smooth;
      position: relative;
      @include no-scrollbar();
      padding-bottom: 12px;
      .empty-tip {
        text-align: center;
      }
      .time-group {
        // padding-bottom: 16px;
        @include items-animation();
        &-name {
          padding: 8px 12px;
          font-size: 12px;
          position: sticky;
          top: 0;
          z-index: 1;
          background-color: #fff;
          body.dark & {
            background-color: var(--be-color-popup-bg, #222);
          }
        }
        &-items {
          padding: 0 12px;
          .floating {
            @include round-bar(16);
            @include h-center();
            background-color: #000c;
            color: white;
            justify-content: center;
            position: absolute;
            font-size: 11px;
            padding: 2px 4px;
            &.pages {
              bottom: 4px;
              right: 4px;
            }
          }
          .time-group-item {
            display: grid;
            grid-template:
              'cover title title' 5fr
              'cover up time' 6fr / 80px 1fr auto;
            border-radius: 8px;
            color: black;
            background-color: #fff;
            box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
            border: 1px solid #8882;
            box-sizing: border-box;
            body.dark & {
              background-color: var(--be-color-card-bg, #282828);
              color: var(--be-color-text-title, #eee);
            }
            &:not(:last-child) {
              margin-bottom: 8px;
            }
            &:hover {
              .cover {
                transform: scale(1.05);
              }
            }
            .history-cover-container {
              $height: 55px;
              $padding: 2px;
              grid-area: cover;
              position: relative;
              height: $height;
              overflow: hidden;
              border-radius: 7px 0 0 7px;
              .cover {
                object-fit: cover;
                width: 80px;
                height: $height;
                body.dark &.placeholder {
                  filter: invert(0.9);
                }
              }
              .progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 2px;
                border-radius: 1px;
                background-color: var(--theme-color);
              }
            }
            .title {
              @include semi-bold();
              grid-area: title;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              align-self: end;
              margin: 0;
              line-height: normal;
              display: block;
              padding-left: 8px;
              padding-right: 6px;
              font-size: 13px;
              &:hover {
                color: var(--theme-color) !important;
              }
            }
            .up,
            .history-info {
              font-size: 11px;
              opacity: 0.75;
              align-self: center;
            }
            .up {
              grid-area: up;
              @include h-center();
              padding-left: 8px;
              opacity: 1;
              .be-icon {
                margin-right: 4px;
                font-size: 14px;
              }
              &-face {
                border-radius: 50%;
                width: 18px;
                height: 18px;
                margin-right: 4px;
              }
              &-name {
                white-space: nowrap;
                max-width: 160px;
                overflow: hidden;
                text-overflow: ellipsis;
                opacity: 0.75;
                &:hover {
                  opacity: 1;
                }
              }
            }
            .history-info {
              @include h-center(4px);
              font-size: 11px;
              grid-area: time;
              padding-right: 6px;
              &-separator {
                margin: 0 4px;
              }
            }
            .progress-number,
            .live-status {
              @include single-line();
            }
            .live-status {
              &.on {
                color: var(--theme-color);
              }
            }
          }
        }
      }
    }
  }
}
</style>
