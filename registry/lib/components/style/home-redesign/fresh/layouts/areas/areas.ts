import { defineAsyncComponent } from 'vue'
import { FreshLayoutItem } from '../fresh-layout-item'

export const areas: FreshLayoutItem = {
  name: 'areas',
  displayName: '栏目',
  component: defineAsyncComponent(() => import('./Areas.vue')),
}
