import { reactive } from 'vue'
import { registerAndGetData } from '@/plugins/data'
import { getHook } from '@/plugins/hook'
import { isUserComponent } from '@/core/settings'
import { uninstallComponent } from '../../user-component'
import { ComponentAction } from './types'

const builtInActions: ComponentAction[] = [
  metadata => ({
    name: 'uninstall',
    displayName: '卸载',
    icon: 'mdi-trash-can-outline',
    visible: isUserComponent(metadata),
    action: async () => {
      const { before, after } = getHook('userComponents.remove', metadata)
      await before()
      await uninstallComponent(metadata.name)
      await after()
    },
  }),
]
export const [componentActions] = registerAndGetData(
  'settingsPanel.componentActions',
  reactive(builtInActions),
)
