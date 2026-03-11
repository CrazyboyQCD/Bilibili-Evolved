import { mountVueComponent } from '@/core/utils'
import OnlineRegistry from './OnlineRegistry.vue'

let vm: InstanceType<typeof OnlineRegistry> | undefined
export const initPopup = () => {
  if (!vm) {
    const [el, _vm] = mountVueComponent(OnlineRegistry)
    vm = _vm
    document.body.append(el)
  }
}
export const togglePopup = () => {
  if (!vm) {
    initPopup()
  }
  vm.popupOpen = !vm.popupOpen
}
