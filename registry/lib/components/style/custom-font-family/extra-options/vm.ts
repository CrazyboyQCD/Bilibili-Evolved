import { mountVueComponent } from '@/core/utils'
import type Panel from './Panel.vue'

let panelVm: InstanceType<typeof Panel>

const getPanelLoadState = () => {
  return Boolean(panelVm)
}

const mountPanel = async () => {
  const [el, vm] = mountVueComponent(await import('./Panel.vue'), {})
  panelVm = vm
  document.body.insertAdjacentElement('beforeend', el)
}

export const loadPanel = async () => {
  const isLoaded = getPanelLoadState()
  if (!isLoaded) {
    await mountPanel()
  }
}

export const togglePanelDisplay = async () => {
  panelVm.toggleDisplay()
}
