import { Component } from 'vue'
import { ComponentMetadata } from '@/components/types'

export interface ComponentConfigAction {
  name: string
  displayName: string
  action: (component: ComponentMetadata) => Promise<void>
  icon: string
  visible?: boolean
  title?: string
  // condition?: () => boolean
}

export interface ComponentVueAction {
  name: string
  component: Component
}
export type ComponentAction = (
  metadata: ComponentMetadata,
) => ComponentConfigAction | ComponentVueAction
