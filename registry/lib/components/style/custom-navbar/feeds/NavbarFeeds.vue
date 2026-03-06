<template>
  <div class="navbar-feeds">
    <TabControl ref="tabControl" :tabs="tabs" more-link="https://t.bilibili.com/">
      <template #more-link>
        所有动态
        <VIcon icon="feeds" :size="18" />
      </template>
    </TabControl>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { TabControl, VIcon } from '@/ui'
import { FeedsCardType, feedsCardTypes } from '@/components/feeds/api'
import { getNotifyCountByType } from '@/components/feeds/notify'
import { tabs } from './tabs/tabs'
import { usePopper, UsePopperProps } from '../mixins'

const popper = usePopper(defineProps<UsePopperProps>())
const tabsRef = ref(tabs)

const refreshNotifyCount = async () => {
  // const totalJson = await getFeeds(navbarFeedsTypeList)
  // item.notifyCount = lodash.get(totalJson, 'data.update_num', 0)
  tabsRef.value.forEach(async tab => {
    if (tab.name === 'live') {
      return
    }
    const feedsCardType = feedsCardTypes[tab.name] as FeedsCardType
    if (!feedsCardType.apiType) {
      return
    }
    const count = await getNotifyCountByType(feedsCardType.apiType)
    tab.count = count
    console.log(tab)
  })
}

onMounted(() => {
  refreshNotifyCount()
  // setInterval(() => refreshNotifyCount(), updateInterval)
})

defineExpose({
  popupShow() {
    this.item.notifyCount = 0
    popper.popupShow()
  },
})
</script>
<style lang="scss">
@import '../popup';

.navbar-feeds {
  width: 380px;
  @include navbar-popup-height();
  line-height: normal;
  white-space: nowrap;
  box-sizing: border-box;
  padding: 4px 4px 0 4px;
  font-size: 12px;
  .be-tab-control {
    height: 100%;
    padding-top: 8px;
    box-sizing: border-box;
    .default-header {
      .default-tabs {
        .default-tab:not(:last-child) {
          margin-right: 16px;
        }
      }
    }
  }
}
</style>
