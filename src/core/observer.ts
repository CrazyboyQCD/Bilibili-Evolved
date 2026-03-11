import { dqa } from './utils'

type ObserverTarget = string | Element[] | Element
type MutationObserverTarget = string | Node[] | Node
export const resolveTargets = <
  T extends ObserverTarget | MutationObserverTarget,
  ResultType = T extends ObserverTarget ? Element[] : Node[],
>(
  target: T,
): ResultType => {
  if (typeof target === 'string') {
    return dqa(target) as ResultType
  }
  if (Array.isArray(target)) {
    return target as ResultType
  }
  return [target] as ResultType
}

export const mutationObserve = (
  targets: Node[],
  config: MutationObserverInit,
  callback: MutationCallback,
) => {
  const observer = new MutationObserver(callback)
  targets.forEach(it => observer.observe(it, config))
  callback([], observer)
  return [observer, config] as const
}
/** 监听直接子元素
 * @param target 监听目标
 * @param callback 回调函数
 */
export const childList = (target: MutationObserverTarget, callback: MutationCallback) =>
  mutationObserve(
    resolveTargets(target),
    {
      childList: true,
      subtree: false,
      attributes: false,
    },
    callback,
  )
/** 监听所有子孙元素
 * @param target 监听目标
 * @param callback 回调函数
 */
export const childListSubtree = (target: MutationObserverTarget, callback: MutationCallback) =>
  mutationObserve(
    resolveTargets(target),
    {
      childList: true,
      subtree: true,
      attributes: false,
    },
    callback,
  )
/** 监听自身的HTML属性变化
 * @param target 监听目标
 * @param callback 回调函数
 */
export const attributes = (target: MutationObserverTarget, callback: MutationCallback) =>
  mutationObserve(
    resolveTargets(target),
    {
      childList: false,
      subtree: false,
      attributes: true,
    },
    callback,
  )
/** 监听自身及其子孙元素的HTML属性变化
 * @param target 监听目标
 * @param callback 回调函数
 */
export const attributesSubtree = (target: MutationObserverTarget, callback: MutationCallback) =>
  mutationObserve(
    resolveTargets(target),
    {
      childList: false,
      subtree: true,
      attributes: true,
    },
    callback,
  )
/** 监听自身的文本内容变化
 * @param target 监听目标
 * @param callback 回调函数
 */
export const characterData = (target: MutationObserverTarget, callback: MutationCallback) =>
  mutationObserve(
    resolveTargets(target),
    {
      childList: false,
      subtree: false,
      attributes: false,
      characterData: true,
    },
    callback,
  )
/** 监听自身及其子孙元素的文本内容变化
 * @param target 监听目标
 * @param callback 回调函数
 */
export const characterDataSubtree = (target: MutationObserverTarget, callback: MutationCallback) =>
  mutationObserve(
    resolveTargets(target),
    {
      childList: false,
      subtree: true,
      attributes: false,
      characterData: true,
    },
    callback,
  )
/** 监听指定目标上的所有变化, 包括自身及子孙元素的元素增减, 属性变化, 文本内容变化
 *
 * 若需要监听 `document.body` 上的, 请使用 allMutations
 * @param target 监听目标
 * @param callback 回调函数
 */
export const allMutationsOn = (target: MutationObserverTarget, callback: MutationCallback) =>
  mutationObserve(
    resolveTargets(target),
    {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    },
    callback,
  )

const everyNodesObserver: {
  observer: MutationObserver
  config: MutationObserverInit
  callbacks: MutationCallback[]
} = {
  observer: null,
  config: null,
  callbacks: [],
}
/**
 * 监听 `document.body` 上的所有变化, 包括自身及子孙元素的元素增减, 属性变化, 文本内容变化
 * @param callback 回调函数
 */
export const allMutations = (callback: MutationCallback) => {
  if (!everyNodesObserver.observer) {
    everyNodesObserver.callbacks.push(callback)
    const [observer, config] = allMutationsOn(document.body, records =>
      everyNodesObserver.callbacks.forEach(c => c(records, everyNodesObserver.observer)),
    )
    everyNodesObserver.observer = observer
    everyNodesObserver.config = config
  } else {
    everyNodesObserver.callbacks.push(callback)
  }
  return everyNodesObserver
}

export const intersectionObserve = (
  targets: Element[],
  config: IntersectionObserverInit,
  callback: IntersectionObserverCallback,
) => {
  const observer = new IntersectionObserver(callback, config)
  targets.forEach(it => observer.observe(it))
  return [observer, config] as const
}
/**
 * 监听元素进入视图内/变为可见
 * @param target 监听目标
 * @param callback 回调函数
 */
export const visible = (target: ObserverTarget, callback: IntersectionObserverCallback) =>
  intersectionObserve(resolveTargets(target), {}, callback)
/**
 * 监听元素进入指定容器内/变为可见
 * @param target 监听目标
 * @param container 容器
 * @param margin 检测边距
 * @param callback 回调函数
 */
export const visibleInside = (
  target: ObserverTarget,
  container: HTMLElement,
  margin: string,
  callback: IntersectionObserverCallback,
) =>
  intersectionObserve(
    resolveTargets(target),
    {
      root: container,
      rootMargin: margin,
    },
    callback,
  )

export const resizeObserve = (
  targets: Element[],
  config: ResizeObserverOptions,
  callback: ResizeObserverCallback,
) => {
  const observer = new ResizeObserver(callback)
  targets.forEach(it => observer.observe(it, config))
  return [observer, config] as const
}
/**
 * 监听元素自身的尺寸变化
 * @param target 监听目标
 * @param callback 回调函数
 */
export const sizeChange = (target: ObserverTarget, callback: ResizeObserverCallback) =>
  resizeObserve(
    resolveTargets(target),
    {
      box: 'border-box',
    },
    callback,
  )

const setupUrlChangeListener = lodash.once(() => {
  let lastUrl = document.URL
  const fireEvent = () => {
    const event = new CustomEvent('urlChange', { detail: document.URL })
    window.dispatchEvent(event)
  }
  allMutations(() => {
    if (lastUrl !== document.URL) {
      fireEvent()
      lastUrl = document.URL
    }
  })
})
/**
 * 监听 URL 变化
 * @param callback 回调函数
 * @param config 事件监听选项
 */
export const urlChange = (callback: (url: string) => void, config?: AddEventListenerOptions) => {
  setupUrlChangeListener()
  callback(document.URL)
  window.addEventListener('urlChange', () => callback(document.URL), config)
}
