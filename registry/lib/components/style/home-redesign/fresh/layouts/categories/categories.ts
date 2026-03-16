import { defineAsyncComponent } from 'vue'
import { FreshLayoutItem } from '../fresh-layout-item'

export const categories: FreshLayoutItem = {
  name: 'categories',
  displayName: '分区',
  grow: true,
  component: defineAsyncComponent(() => import('./Categories.vue')),
}
