import { playerAgent } from '@/components/video/player-agent'
import { simulateClick } from '@/core/utils'

export const keyboardEventToPointer = (event: KeyboardEvent): PointerEventInit => {
  return {
    ...lodash.pick(event, 'ctrlKey', 'shiftKey', 'altKey', 'metaKey'),
    bubbles: true,
    cancelable: true,
    view: unsafeWindow,
  }
}
export const clickElement = (target: string | HTMLElement, context: { event: KeyboardEvent }) => {
  const { event } = context
  const eventParams = keyboardEventToPointer(event)
  if (typeof target === 'string') {
    const targetElement = dq(target) as HTMLElement
    if (!targetElement) {
      return false
    }
    simulateClick(targetElement, eventParams)
  } else {
    if (!target) {
      return false
    }
    simulateClick(target, eventParams)
  }
  return true
}

export const useClickElement =
  (target: string | HTMLElement) => (context: { event: KeyboardEvent }) =>
    clickElement(target, context)
export const changeVideoTime = (delta: number | (() => number)) => () =>
  playerAgent.changeTime(typeof delta === 'number' ? delta : delta())
/** 提示框用的`setTimeout`句柄 */
let tipTimeoutHandle: number
/**
 * 显示提示框
 * @param text 文字 (可以 HTML)
 * @param icon MDI 图标 class
 */
export const showTip = async (text: string, icon: string) => {
  let tip = dq('.keymap-tip') as HTMLDivElement
  if (!tip) {
    const player = (await playerAgent.query.playerArea()) as HTMLElement
    if (!player) {
      return
    }
    player.insertAdjacentHTML(
      'afterbegin',
      /* html */ `
      <div class="keymap-tip-container">
        <i class="keymap-tip-icon mdi ${icon}"></i>
        <div class="keymap-tip">${text}</div>
      </div>
    `,
    )
    tip = dq('.keymap-tip') as HTMLDivElement
  }
  tip.innerHTML = text
  const container = dq('.keymap-tip-container') as HTMLDivElement
  const iconElement = dq(container, '.mdi') as HTMLElement
  iconElement.classList.remove(...iconElement.classList.values())
  iconElement.classList.add('mdi', icon)
  if (tipTimeoutHandle) {
    clearTimeout(tipTimeoutHandle)
  }
  container.classList.add('show')
  tipTimeoutHandle = window.setTimeout(() => {
    container.classList.remove('show')
  }, 2000)
}
