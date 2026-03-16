import { defineAsyncComponent } from 'vue'
import { FreshLayoutItem } from '../fresh-layout-item'

export const blackboard: FreshLayoutItem = {
  name: 'blackboard',
  displayName: '活动',
  component: defineAsyncComponent(() => import('./Blackboard.vue')),
}
