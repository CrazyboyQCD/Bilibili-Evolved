<template>
  <div class="group-filter-panel">
    <div class="group-filter-header">
      <h1>分组</h1>
      <switch-box v-model="allChecked" />
    </div>
    <div v-for="(group, index) in groups" :key="index" class="group-item">
      <CheckBox :checked="group.checked" @change="checked => (group.checked = checked)">
        {{ group.name }}
      </CheckBox>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { CheckBox, SwitchBox } from '@/ui'
import { bilibiliApi, getJsonWithCredentials, getPages } from '@/core/ajax'
import { FeedsCard, forEachFeedsCard } from '@/components/feeds/api'
import { getUID } from '@/core/utils'

interface Group {
  name: string
  checked: boolean
  id: number
}

let cardsManager: typeof import('@/components/feeds/api').feedsCardsManager

const groups = ref<Group[]>([])
const followingMap = new Map<string, number[]>()
const selectedGroupIds = ref<number[]>([])
const allChecked = ref(true)

const updateCard = (card: FeedsCard) => {
  const userTagIds: number[] = followingMap.get(card.username)
  if (!userTagIds || !selectedGroupIds.value) {
    return
  }
  if (!userTagIds.some(item => selectedGroupIds.value.includes(item))) {
    card.element.classList.add('group-filter-hide-feed')
  } else {
    card.element.classList.remove('group-filter-hide-feed')
  }
}

watch(
  groups,
  (newGroups: Group[]) => {
    selectedGroupIds.value = newGroups.filter(({ checked }) => checked).map(({ id }) => id)
    cardsManager.cards.forEach(card => {
      updateCard(lodash.clone(card))
    })
  },
  { deep: true, immediate: true },
)

watch(allChecked, (newChecked: boolean) => {
  for (const group of groups.value) {
    group.checked = newChecked
  }
})

onMounted(async () => {
  cardsManager = await forEachFeedsCard({
    added: card => {
      updateCard(lodash.clone(card))
    },
  })

  // fetch groups
  groups.value = await bilibiliApi<Array<any>>(
    getJsonWithCredentials('https://api.bilibili.com/x/relation/tags'),
    '分组信息获取失败',
  ).then(res =>
    res.map(value => ({
      name: value.name,
      checked: true,
      id: value.tagid,
    })),
  )

  const uid = getUID()

  // fetch following
  const allPages = await getPages({
    api: page =>
      getJsonWithCredentials(
        `https://api.bilibili.com/x/relation/followings?vmid=${uid}&pn=${page}&ps=50`,
      ),
    getList: json => json.data.list,
    getTotal: json => json.data.total,
  })

  allPages.forEach(user => {
    followingMap.set(user.uname, user.tag)
  })
})
</script>

<style lang="scss">
.group-filter-hide-feed {
  display: none !important;
}

.group-filter-panel {
  background-color: white;
  font-size: 12px;
  width: 100%;
  border-radius: 4px;
  box-sizing: border-box;
  flex-direction: column;
  padding: 12px 16px;

  .group-filter-header {
    cursor: pointer;
    padding-bottom: 14px;
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h1 {
      font-weight: normal;
      font-size: 16px;
      margin: 0;
    }
  }

  .group-item {
    display: flex;
    flex-direction: row;
    font-size: 14px;
  }

  body.dark & {
    color: #eee;
    background-color: #444;
  }
}
</style>
