import { ComponentMetadata } from '../types'

export interface SearchBarActionContext {
  components: ComponentMetadata[]
  selectedComponent: ComponentMetadata
  selectedComponents: ComponentMetadata[]
  searchKeyword: string
  searchFilter: (items: ComponentMetadata[]) => ComponentMetadata[]
}
export interface SearchBarAction {
  key: string
  icon: string
  title: string | ((context: SearchBarActionContext) => string)
  run: (context: SearchBarActionContext) => Promise<void> | void
  disabled?: (context: SearchBarActionContext) => boolean
}
