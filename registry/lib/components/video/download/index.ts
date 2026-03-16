import { defineAsyncComponent } from 'vue'
import { OptionsOfMetadata, defineComponentMetadata } from '@/components/define'
import { hasVideo } from '@/core/video'
import { options } from './options'

export type DownloadVideoOptions = OptionsOfMetadata<typeof options>
export const component = defineComponentMetadata({
  name: 'downloadVideo',
  displayName: '下载视频',
  entry: none,
  reload: none,
  unload: none,
  widget: {
    component: defineAsyncComponent(() => import('./Widget.vue')),
    condition: () => hasVideo(),
  },
  tags: [componentsTags.video],
  options,
  // plugin,
})
