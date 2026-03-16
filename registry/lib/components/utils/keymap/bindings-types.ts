import { clickElement, changeVideoTime, showTip } from './actions-fns'

export interface KeyBindingActionContext {
  binding: KeyBinding
  event: KeyboardEvent
  isWatchlater: boolean
  isMediaList: boolean
  clickElement: typeof clickElement
  changeVideoTime: typeof changeVideoTime
  showTip: typeof showTip
}

export interface KeyBindingAction {
  displayName: string
  run: (context: KeyBindingActionContext) => unknown
  prevent?: boolean
  /** 默认打字时忽略快捷键, 将此属性设置为 false 可以在打字时允许触发快捷键 */
  ignoreTyping?: boolean
  /** 默认聚焦在可聚焦元素时不忽略快捷键, 将此属性设置为 true 可以在聚焦时禁止触发快捷键 */
  ignoreFocus?: boolean
}

export interface KeyBinding {
  keys: string[]
  action: KeyBindingAction
}
