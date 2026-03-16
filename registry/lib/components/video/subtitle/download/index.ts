import { defineAsyncComponent } from 'vue'
import { defineComponentMetadata } from '@/components/define'
import { PackageEntry } from '@/core/download'
import { hasVideo } from '@/core/video'
import { Toast } from '@/core/toast'
import { videoAndBangumiUrls } from '@/core/utils/urls'
import { DownloadVideoAssets } from '../../download/types'
import { getSubtitleBlob, SubtitleDownloadType } from './utils'
import type Plugin from './Plugin.vue'

export const component = defineComponentMetadata({
  name: 'downloadSubtitle',
  displayName: '下载字幕',
  tags: [componentsTags.video],
  entry: none,
  urlInclude: videoAndBangumiUrls,
  widget: {
    condition: hasVideo,
    component: defineAsyncComponent(() => import('./DownloadSubtitle.vue')),
  },
  plugin: {
    displayName: '下载视频 - 下载字幕支持',
    setup: ({ addData }) => {
      addData('downloadVideo.assets', async (assets: DownloadVideoAssets[]) => {
        assets.push({
          name: 'downloadSubtitles',
          displayName: '下载字幕',
          getAssets: async (infos, instance: InstanceType<typeof Plugin>) => {
            const { type, enabled } = instance
            if (!enabled) {
              return []
            }
            const toast = Toast.info('获取字幕中...', '下载字幕')
            let downloadedItemCount = 0
            const results = await Promise.allSettled(
              infos.map(async info => {
                const blob = await getSubtitleBlob(type as SubtitleDownloadType, info.input)
                downloadedItemCount++
                toast.message = `获取字幕中... (${downloadedItemCount}/${infos.length})`
                return {
                  name: `${info.input.title}.${type}`,
                  data: blob,
                }
              }),
            )
            const success = results.filter(
              it => it.status === 'fulfilled',
            ) as PromiseFulfilledResult<PackageEntry>[]
            const fail = results.filter(it => it.status === 'rejected') as PromiseRejectedResult[]
            toast.message = `获取完成. 成功 ${success.length} 个, 失败 ${fail.length} 个.`
            return success.map(it => it.value)
          },
          component: defineAsyncComponent(() => import('./Plugin.vue')),
        })
      })
    },
  },
})
