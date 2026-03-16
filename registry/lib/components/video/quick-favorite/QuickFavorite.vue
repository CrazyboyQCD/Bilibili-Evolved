<template>
  <span
    ref="root"
    class="quick-favorite be-quick-favorite video-toolbar-left-item"
    title="快速收藏"
    :class="{ on: isFavorite, ...displayModeClass }"
    @click.left.self="toggle()"
    @click.right.prevent.self="listShowing = !listShowing"
  >
    <i
      class="quick-favorite-icon icon"
      @click.left="toggle()"
      @click.right.prevent="listShowing = !listShowing"
    ></i>
    <div class="text" @click.left="toggle()" @click.right.prevent="listShowing = !listShowing">
      快速收藏
    </div>
    <div class="select-list" :class="{ show: listShowing }">
      <div class="lists">
        选择快速收藏夹:
        <VDropdown
          :value="selectedFavoriteList"
          :items="list"
          :key-mapper="it => it.id"
          @change="saveFavoriteList"
        />
      </div>
      <div class="lists-tip" :class="{ show: listShowing }">右键点击快速收藏可再次打开</div>
    </div>
    <div class="tip" :class="{ show: tipShowing }">{{ tipText }}</div>
  </span>
</template>
<script setup lang="ts">
import { ref, computed, watch, useTemplateRef } from 'vue'
import { addComponentListener, getComponentSettings } from '@/core/settings'
import { BilibiliApiResponse, getJsonWithCredentials } from '@/core/ajax'
import { getUID, getCsrf } from '@/core/utils'
import { logError } from '@/core/utils/log'
import { Toast } from '@/core/toast'
import { VDropdown } from '@/ui'
import { DisplayMode, Options } from './options'

const { options } = getComponentSettings<Options>('quickFavorite')
interface RawFavoriteListItem {
  id: number
  title: string
  fav_state: number
}
interface FavoriteListItem {
  id: number
  displayName: string
}
const EmptyFavoriteList: FavoriteListItem = {
  id: 0,
  displayName: '<未选择>',
}

const emit = defineEmits<{
  change: [value: FavoriteListItem]
}>()

const root = useTemplateRef('root')
const aid = ref(unsafeWindow.aid)
const isFavorite = ref(false)
const tipText = ref('')
const tipShowing = ref(false)
const tipHandle = ref(0)
const list = ref<FavoriteListItem[]>([])
const selectedFavoriteList = ref<FavoriteListItem>(EmptyFavoriteList)
const listShowing = ref(false)
const { displayMode: outerDisplayMode } = getComponentSettings<Options>('outerWatchlater').options
const displayMode = ref(outerDisplayMode)

const displayModeClass = computed(() => ({
  'icon-only': displayMode.value === DisplayMode.Icon,
  'icon-and-text': displayMode.value === DisplayMode.IconAndText,
}))

const showTip = (text: string) => {
  tipText.value = text
  tipShowing.value = true
  if (tipHandle.value) {
    clearTimeout(tipHandle.value)
  }
  tipHandle.value = window.setTimeout(() => {
    tipShowing.value = false
  }, 2000)
}

const syncFavoriteState = async () => {
  if (options.favoriteFolderID === 0 || !aid.value) {
    return
  }
  try {
    const json = await getJsonWithCredentials(
      `https://api.bilibili.com/x/v3/fav/folder/created/list-all?type=2&rid=${
        aid.value
      }&up_mid=${getUID()}`,
    )
    if (json.code !== 0) {
      throw new Error(`获取收藏状态失败: ${json.message}`)
    }
    const listData: { id: number; title: string; fav_state: number }[] = lodash.get(
      json,
      'data.list',
      [],
    )
    const favoriteFolder = listData.find(it => it.id === options.favoriteFolderID)
    if (favoriteFolder === undefined) {
      options.favoriteFolderID = 0
      return
    }
    isFavorite.value = Boolean(favoriteFolder.fav_state)
    selectedFavoriteList.value = {
      id: favoriteFolder.id,
      displayName: favoriteFolder.title,
    } as FavoriteListItem
  } catch (error) {
    logError(error)
  }
}

const saveFavoriteList = (listItem: FavoriteListItem) => {
  // selectedFavoriteList.value = listItem
  options.favoriteFolderID = listItem.id
  syncFavoriteState()
  emit('change', listItem)
}

const loadSavedList = async () => {
  try {
    const json = await getJsonWithCredentials(
      `https://api.bilibili.com/x/v3/fav/folder/created/list-all?type=2&rid=${
        aid.value
      }&up_mid=${getUID()}`,
    )
    if (json.code !== 0) {
      throw new Error(`获取收藏状态失败: ${json.message}`)
    }

    const listData: RawFavoriteListItem[] = lodash.get(json, 'data.list', [])
    const favoriteFolder = listData.find(it => it.id === options.favoriteFolderID)
    if (favoriteFolder === undefined) {
      options.favoriteFolderID = 0
      return
    }
    isFavorite.value = Boolean(favoriteFolder.fav_state)
    selectedFavoriteList.value = {
      id: favoriteFolder.id,
      displayName: favoriteFolder.title,
    } as FavoriteListItem
  } catch (error) {
    logError(error)
  }
}

const loadFavoriteList = async () => {
  try {
    const json = await getJsonWithCredentials(
      `https://api.bilibili.com/medialist/gateway/base/created?pn=1&ps=100&up_mid=${getUID()}&is_space=0`,
    )
    if (json.code !== 0) {
      throw new Error(`获取收藏夹列表失败: ${json.message}`)
    }
    const listData: RawFavoriteListItem[] = lodash.get(json, 'data.list', [])
    list.value = listData.map(it => ({ id: it.id, displayName: it.title }))
  } catch (error) {
    logError(error)
  }
}

const toggle = async () => {
  if (options.favoriteFolderID === 0) {
    listShowing.value = true
    return
  }
  const formData = {
    rid: aid.value,
    type: 2,
    add_media_ids: '',
    del_media_ids: '',
    csrf: getCsrf(),
  }
  formData[isFavorite.value ? 'del_media_ids' : 'add_media_ids'] =
    options.favoriteFolderID.toString()
  try {
    const request = new Request('https://api.bilibili.com/x/v3/fav/resource/deal', {
      method: 'POST',
      body: Object.entries(formData)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&'),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'include',
    })
    const response: BilibiliApiResponse = await (await fetch(request)).json()
    if (response.code !== 0) {
      throw new Error(response.message)
    }
    // favoriteButton.classList.toggle('on', isFavorite.value)
    isFavorite.value = !isFavorite.value
    showTip(
      isFavorite.value
        ? `已添加至收藏夹: ${selectedFavoriteList.value.displayName}`
        : `已移出收藏夹: ${selectedFavoriteList.value.displayName}`,
    )
    // await syncFavoriteState()
  } catch (error) {
    Toast.error(`快速收藏失败: ${error.message}`, '快速收藏')
    console.error(error)
  }
}

watch(listShowing, async (value: boolean) => {
  if (value) {
    document.addEventListener('click', e => {
      const el = root.value as HTMLElement
      const target = e.target as HTMLElement
      if (target !== el && !el?.contains(target)) {
        listShowing.value = false
      }
    })
    if (list.value.length === 0) {
      loadFavoriteList()
    }
  }
})

loadSavedList()
addComponentListener('quickFavorite.displayMode', (value: DisplayMode) => {
  displayMode.value = value
})

defineExpose({
  aid,
  syncFavoriteState,
})
</script>
<style lang="scss" scoped>
@import 'common';
@import './font';

.quick-favorite {
  margin-right: 28px !important;
  position: relative;
  font-size: 14px;
  width: auto !important;
  .text {
    display: inline;
  }

  @mixin icon-only {
    margin-right: max(calc(min(11vw, 11vh) - 117.2px), 6px) !important;
    .text {
      display: none;
    }
  }
  &.icon-only {
    @include icon-only();
  }
  &:not(.icon-and-text) {
    @media screen and (max-width: 1340px), (max-height: 750px) {
      @include icon-only();
    }
  }

  &-icon {
    font-family: 'quick-favorite' !important;
    font-size: 28px;
    display: inline-block;
    font-style: normal;
    text-align: center;
    text-transform: none;
    line-height: 1;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    @media (min-width: 1681px) {
      font-size: 36px;
    }
    &:after {
      content: '\ea01';
    }
    .video-toolbar-v1 & {
      transform: translateY(1px);
    }
    .video-toolbar-left & {
      margin-right: 8px;
    }
  }
  .tip,
  .select-list {
    line-height: normal;
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: #000d;
    padding: 8px;
    border-radius: 4px;
    color: #eee;
    transition: all 0.2s ease-out;
    opacity: 0;
    pointer-events: none;
    &.show {
      opacity: 1;
      pointer-events: initial;
    }
  }
  .select-list {
    @include v-center(8px);
    > * {
      white-space: nowrap;
    }
    .lists-loading {
      padding: 4px 32px;
    }
    .lists {
      @include h-center(8px);
    }
    .lists-tip {
      color: #aaa;
      font-size: 12px;
    }
  }
}
</style>
