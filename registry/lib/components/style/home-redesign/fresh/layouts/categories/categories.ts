import { defineAsyncComponent } from 'vue'
import { type FreshLayoutItem } from '../fresh-layout-item'

export const categories: FreshLayoutItem = {
  name: 'categories',
  displayName: '分区',
  grow: true,
  component: defineAsyncComponent(() => import('./Categories.vue')),
}
