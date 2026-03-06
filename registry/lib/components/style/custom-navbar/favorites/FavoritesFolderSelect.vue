<template>
  <VDropdown
    class="favorites-folder-select"
    round
    :items="folders"
    :key-mapper="f => f.id"
    :value="folder"
    @change="change($event)"
  >
    <template #item="{ item }"> {{ item.name }} ({{ item.count }}) </template>
  </VDropdown>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VDropdown } from '@/ui'
import { getUID } from '@/core/utils'
import { getJsonWithCredentials } from '@/core/ajax'
import { getComponentSettings } from '@/core/settings'
import { FavoritesFolder, notSelectedFolder } from './favorites-folder'
import { CustomNavbarOptions } from '..'

const navbarOptions = getComponentSettings<CustomNavbarOptions>('customNavbar').options

const folders = ref([] as FavoritesFolder[])

const folder = defineModel<FavoritesFolder>()

const change = (selectedFolder: FavoritesFolder) => {
  navbarOptions.lastFavoriteFolder = selectedFolder.id
  folder.value = selectedFolder
}

onMounted(async () => {
  const uid = getUID()
  if (!uid) {
    return
  }
  const url = `https://api.bilibili.com/medialist/gateway/base/created?pn=1&ps=100&up_mid=${uid}&is_space=0`
  const json = await getJsonWithCredentials(url)
  if (json.code !== 0) {
    throw new Error(`获取收藏夹列表失败: ${json.message}`)
  }
  folders.value = lodash.get(json, 'data.list', []).map(
    (item: { id: number; title: string; media_count: number }) =>
      ({
        id: item.id,
        name: item.title,
        count: item.media_count,
      } as FavoritesFolder),
  )
  if (folders.value.length > 0 && folder.value.id === notSelectedFolder.id) {
    const { lastFavoriteFolder } = navbarOptions
    const selectedFolder = folders.value.find((f: FavoritesFolder) => f.id === lastFavoriteFolder)
    if (selectedFolder) {
      folder.value = selectedFolder
    } else {
      folder.value = folders.value[0]
    }
  }
})
</script>
