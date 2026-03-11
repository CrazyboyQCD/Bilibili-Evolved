import { defineAsyncComponent } from 'vue'
import { defineComponentMetadata } from '@/components/define'
import { matchUrlPattern } from '@/core/utils'
import { columnUrls, feedsUrls } from '@/core/utils/urls'
import { setupFeedImageExporter } from './feed'
import { options } from './options'

export const component = defineComponentMetadata({
  name: 'imageExporter',
  displayName: '图片批量导出',
  tags: [componentsTags.feeds, componentsTags.utils],
  entry: async context => {
    await setupFeedImageExporter(context)
  },
  widget: {
    condition: () => columnUrls.some(url => matchUrlPattern(url)),
    component: defineAsyncComponent(() => import('./Widget.vue')),
  },
  urlInclude: [...feedsUrls, ...columnUrls],
  options,
})
