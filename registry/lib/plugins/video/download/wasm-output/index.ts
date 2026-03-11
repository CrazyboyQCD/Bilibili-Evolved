import { defineAsyncComponent } from 'vue'
import { Toast } from '@/core/toast'
import { PluginMetadata } from '@/plugins/plugin'
import { DownloadVideoOutput } from '../../../../components/video/download/types'
import { run } from './handler'
import { Options } from './types'
import { title, desc } from './common'

export const plugin: PluginMetadata = {
  name: 'downloadVideo.outputs.wasm',
  displayName: `下载视频 - ${title}`,
  description: desc,
  author: [
    {
      name: 'WakelessSloth56',
      link: 'https://github.com/WakelessSloth56',
    },
    {
      name: 'LainIO24',
      link: 'https://github.com/LainIO24',
    },
  ],
  setup: ({ addData }) => {
    addData('downloadVideo.outputs', (outputs: DownloadVideoOutput[]) => {
      outputs.push({
        name: 'wasm',
        displayName: 'WASM',
        description: `${desc}。运行过程中请勿关闭页面，初次使用或清除缓存后需要加载约 30 MB 的 WASM 文件。由于浏览器限制，仅支持合并 2GB 以内的音视频。`,
        runAction: async (action, instance: Options) => {
          try {
            await run(action, instance.outputType, instance.muxWithMetadata, instance.attachCover)
          } catch (error) {
            Toast.error(String(error), title)
          }
        },
        component: defineAsyncComponent(() => import('./Config.vue')),
      })
    })
  },
}
