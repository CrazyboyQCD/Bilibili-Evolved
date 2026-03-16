import { reactive } from 'vue'
import { Toast } from '@/core/toast'
import { registerAndGetData } from '@/plugins/data'
import { isBuiltInComponent } from '../built-in-components'
import { ComponentMetadata } from '../types'
import { uninstallComponent } from '../user-component'
import { SearchBarAction } from './search-bar-actions-types'

const builtInActions: SearchBarAction[] = [
  {
    key: 'uninstallSelectedComponent',
    title: '卸载所选组件',
    icon: 'mdi-trash-can-outline',
    disabled: ({ selectedComponents }) => selectedComponents.length === 0,
    run: context => {
      if (!window.confirm(`确定要卸载所选的 ${context.selectedComponents.length} 个组件吗?`)) {
        return
      }
      context.selectedComponents.forEach(({ name }: ComponentMetadata) => {
        if (!isBuiltInComponent(name)) {
          uninstallComponent(name)
        } else {
          Toast.info('内置组件不能卸载', '检查更新', 3000)
        }
      })
      context.selectedComponents = []
    },
  },
]
export const [searchBarActions] = registerAndGetData(
  'settingsPanel.searchBarActions',
  reactive([...builtInActions]),
)
