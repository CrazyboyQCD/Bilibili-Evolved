import { type Component } from 'vue'
import Dialog from './Dialog.vue'
import { mountVueComponent } from '../utils'

export interface DialogInputs {
  icon?: string
  title?: string | Component
  zIndex?: number
  content: string | Component
  contentProps?: Record<string, unknown>
}
export interface DialogInstance extends Required<DialogInputs> {
  open: boolean
  close(): Promise<void>
  closeListeners: (() => void)[]
}
export const showDialog = (inputs: DialogInputs) => {
  const { icon, title, zIndex, content, contentProps } = inputs
  const [el, vm, app] = mountVueComponent(Dialog, {
    icon,
    title,
    zIndex,
    content,
    contentProps,
  })
  vm.closeListeners.push(() => {
    app.unmount()
    el.remove()
  })
  document.body.appendChild(el)
  setTimeout(() => {
    vm.open = true
  })
  return vm as DialogInstance
}
