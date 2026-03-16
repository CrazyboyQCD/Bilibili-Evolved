import { defineAsyncComponent } from 'vue'
import { defineComponentMetadata } from '@/components/define'
import { getUID, none } from '@/core/utils'
import { autoMatchMedal } from './auto-match'
import { badgeHelperOptions } from './options'

export const component = defineComponentMetadata({
  name: 'badgeHelper',
  displayName: '直播勋章快速更换',
  entry: () => autoMatchMedal(),
  reload: none,
  unload: none,
  tags: [componentsTags.live],
  widget: {
    component: defineAsyncComponent(() => import('./BadgeHelper.vue')),
    condition: () => Boolean(getUID()),
  },
  options: badgeHelperOptions,
  urlInclude: ['//live.bilibili.com'],
})
