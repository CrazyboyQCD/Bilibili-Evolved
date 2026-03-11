import { Ref, ComputedRef, ref, computed } from 'vue'
import {
  getFeeds,
  FeedsCardType,
  applyContentFilter,
  isPreOrderedVideo,
} from '@/components/feeds/api'
import { descendingBigIntSort, descendingStringSort } from '@/core/utils/sort'
import { logError } from '@/core/utils/log'
import { setLatestID } from '@/components/feeds/notify'

/**
 * 获取用于支持顶栏动态无限滚动的Vue Mixin
 * @param type 动态类型
 * @param jsonMapper 解析JSON数据的映射函数
 */
export const useNextPage = <MappedItem extends { id: string } = { id: string }, RawItem = unknown>(
  type: FeedsCardType,
  jsonMapper: (obj: RawItem) => MappedItem,
  onCardsUpdate?: (cards: MappedItem[]) => MappedItem[],
): {
  loading: Ref<boolean>
  cards: Ref<MappedItem[]>
  hasMorePage: Ref<boolean>
  sortedCards: ComputedRef<MappedItem[]>
  nextPage: () => Promise<void>
} => {
  const loading = ref(true)
  const cards: Ref<MappedItem[]> = ref([])
  const hasMorePage = ref(true)

  const sortedCards = computed(() => [...cards.value].sort(descendingStringSort(it => it.id)))

  const nextPage = async () => {
    try {
      const sortedCardsValue: MappedItem[] = sortedCards.value
      const lastCardID = sortedCardsValue[sortedCardsValue.length - 1]?.id ?? 0

      const json = await getFeeds(type, lastCardID)
      console.log(json)
      if (json.code !== 0) {
        hasMorePage.value = false
        throw new Error(json.message)
      }
      const jsonCards = lodash.get(json, 'data.items', []).map(jsonMapper) as MappedItem[]

      let concatCards = applyContentFilter(
        sortedCardsValue
          .concat(jsonCards)
          .sort(descendingBigIntSort(it => it.id))
          .filter(card => !isPreOrderedVideo(card)),
      )

      if (concatCards.length > 0 && onCardsUpdate) {
        concatCards = onCardsUpdate(concatCards)
      }
      console.log('nextPage get', concatCards)
      cards.value = concatCards
      if (cards.value.length === 0) {
        hasMorePage.value = false
        return
      }
      hasMorePage.value = lastCardID === 0 ? true : Boolean(lodash.get(json, 'data.has_more', true))
    } catch (error) {
      logError(error)
    } finally {
      loading.value = false
    }
  }

  nextPage().then(() => {
    if (sortedCards.value.length > 0) {
      setLatestID(sortedCards.value[0].id)
      // console.log('setLatestID', sortedCards.value[0].id)
    }
  })

  return {
    loading,
    cards,
    hasMorePage,
    sortedCards,
    nextPage,
  }
}
