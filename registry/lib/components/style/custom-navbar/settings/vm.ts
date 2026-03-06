import { mountVueComponent } from '@/core/utils'
import type NavbarSettings from './NavbarSettings.vue'

let navbarSettingsVM: InstanceType<typeof NavbarSettings> | undefined
export const setTriggerElement = (element: HTMLElement) => {
  if (!navbarSettingsVM) {
    return
  }
  navbarSettingsVM.triggerElement = element
}
export const loadNavbarSettings = async () => {
  if (navbarSettingsVM) {
    return false
  }
  const NavbarSettings = await import('./NavbarSettings.vue')
  const [el, vm] = mountVueComponent(NavbarSettings)
  navbarSettingsVM = vm
  document.body.insertAdjacentElement('beforeend', el)
  return true
}
export const toggleNavbarSettings = async () => {
  if (!navbarSettingsVM) {
    await loadNavbarSettings()
  }
  navbarSettingsVM.toggle()
}
