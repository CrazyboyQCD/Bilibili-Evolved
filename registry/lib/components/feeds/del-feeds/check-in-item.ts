import { reactive } from 'vue'
import { getJsonWithCredentials, postJsonWithCredentials } from '@/core/ajax'
import { Toast } from '@/core/toast'
import { getUID, getCsrf } from '@/core/utils'
import { registerAndGetData } from '@/plugins/data'

export interface CheckInItem {
  name: string
  displayName: string
  icon: string
  action: (button: HTMLDivElement, event: MouseEvent) => Promise<void>
  disabled?: boolean
}
const builtInItems: CheckInItem[] = [
  {
    name: 'del-all-feeds',
    displayName: '删除所有动态',
    icon: 'mdi-delete',
    action: async () => {
      const { forEachFeedsCard } = await import('@/components/feeds/api')
      Toast.info('如果想删除所有动态, 可以一直下拉页面到没有动态为止', '删除动态', 3000)

      // 只能删除本页
      await forEachFeedsCard({
        added: async card => {
          // 检查是否是转发动态
          const post_del_dynamic_data = {
            dyn_id_str: card.id,
            dyn_type: card.type.id,
            rid_str: card.id,
          }
          // 删除动态
          const del_dynamic_resp = JSON.parse(
            await postJsonWithCredentials(
              `https://api.bilibili.com/x/dynamic/feed/operate/remove?platform=web&csrf=${getCsrf()}`,
              post_del_dynamic_data,
            ),
          ) as {
            code: number
            message: string
            ttl: number
            data: null
          }

          if (del_dynamic_resp.code === 0) {
            console.info('删除动态成功: ', card.id)
          } else {
            console.info('删除动态失败: ', card.id, del_dynamic_resp)
          }
        },
      })
      Toast.success(`打开控制台查看删除动态结果`, '删除动态', 3000)
    },
  },
  {
    name: 'del-feeds',
    displayName: '删除转发抽奖动态',
    icon: 'mdi-delete',
    action: async () => {
      const { forEachFeedsCard } = await import('@/components/feeds/api')
      Toast.info('如果想删除所有动态, 可以一直下拉页面到没有动态为止', '删除动态', 3000)
      await forEachFeedsCard({
        added: async card => {
          const { isRepostType } = await import('@/components/feeds/api')

          // 判断是否是转发动态
          if (isRepostType(card)) {
            const uid = getUID()

            const dynamic_info = (await getJsonWithCredentials(
              `https://api.vc.bilibili.com/lottery_svr/v2/lottery_svr/lottery_notice?dynamic_id=${card.repostId}`,
            )) as {
              code: number
              data: {
                lottery_time: number
                lottery_result: {
                  first_prize_result: {
                    uid: number
                  }[]
                }
              }
            }

            // 检查抽奖时间
            if (
              dynamic_info.data.lottery_time &&
              dynamic_info.data.lottery_time > Date.now() / 1000
            ) {
              // 抽奖未开始, 不能删除
              return
            }

            if (dynamic_info.code === 0) {
              // 检查是否中奖
              for (let i = 0; i < dynamic_info.data.lottery_result.first_prize_result.length; i++) {
                if (dynamic_info.data.lottery_result.first_prize_result[i].uid === Number(uid)) {
                  Toast.info(`居然中奖了, 不能接受😭😭😭, 动态ID: ${card.id}`, '删除动态', 10000)
                  return
                }
              }

              const post_del_dynamic_data = {
                dyn_id_str: card.id,
                dyn_type: card.type.id,
                rid_str: card.id,
              }
              // 删除动态
              const del_dynamic_resp = JSON.parse(
                await postJsonWithCredentials(
                  `https://api.bilibili.com/x/dynamic/feed/operate/remove?platform=web&csrf=${getCsrf()}`,
                  post_del_dynamic_data,
                ),
              ) as {
                code: number
                message: string
                ttl: number
                data: null
              }

              if (del_dynamic_resp.code === 0) {
                console.info('删除动态成功: ', card.id)
              } else {
                console.info('删除动态失败: ', card.id, del_dynamic_resp)
              }
            }
          }
        },
      })

      Toast.success(`打开控制台查看删除动态结果`, '删除动态', 3000)
    },
  },
]

export const [checkInItems] = registerAndGetData('deleteFeeds.items', reactive(builtInItems))
