import { defineAsyncComponent } from 'vue'
import { defineComponentMetadata } from '@/components/define'
import { liveUrls } from '@/core/utils/urls'

export const component = defineComponentMetadata({
  name: 'downloadEmoticons',
  displayName: '下载表情',
  tags: [componentsTags.utils, componentsTags.live],
  entry: none,
  author: {
    name: 'Pencilqaq',
    link: 'https://github.com/pencilqaq',
  },
  widget: {
    component: defineAsyncComponent(() => import('./Widget.vue')),
  },
  urlInclude: liveUrls,
})
