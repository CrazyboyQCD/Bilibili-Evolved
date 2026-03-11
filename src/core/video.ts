import { allMutations } from './observer'
import { select } from './spin-query'
import { matchCurrentPage, playerUrls } from './utils/urls'

/** 等待 cid */
const selectCid = lodash.once(() =>
  select(() => {
    if (unsafeWindow.cid) {
      return unsafeWindow.cid
    }
    return null
  }),
)
let cidHooked = false
export type VideoChangeCallback = (id: { aid: string; cid: string }) => void
/**
 * 监听视频的变化, 等待视频加载并开始监听后 resolve
 * @param callback 回调函数
 * @param config 事件监听选项
 * @returns 是否有视频存在
 */
export const videoChange = async (
  callback: VideoChangeCallback,
  config?: AddEventListenerOptions,
) => {
  if (!matchCurrentPage(playerUrls)) {
    return false
  }
  const cid = await selectCid()
  if (cid === null) {
    return false
  }
  const getId = () => ({
    aid: unsafeWindow.aid,
    cid: unsafeWindow.cid,
  })
  const fireEvent = () => {
    const detail = getId()
    const event = new CustomEvent('videoChange', { detail })
    window.dispatchEvent(event)
  }
  if (!cidHooked) {
    let lastCid = cid
    allMutations(() => {
      const { cid: newCid } = getId()
      // b 站代码的神秘行为, 在更换 cid 时会临时改成一个数组, 做监听要忽略这种值
      if (Array.isArray(newCid)) {
        return
      }
      if (lastCid !== newCid && !lodash.isNil(newCid)) {
        fireEvent()
        lastCid = newCid
      }
    })
    cidHooked = true
  }
  callback(getId())
  window.addEventListener(
    'videoChange',
    (e: CustomEvent<ReturnType<typeof getId>>) => callback(e.detail),
    config,
  )
  return true
}

let hasVideoPromiseCache: Promise<string> | undefined
/**
 * 等待视频加载, 可获取到 `cid` 时结束, 返回 `boolean` 值代表是否存在视频
 */
export const hasVideo = async () => {
  if (!hasVideoPromiseCache) {
    hasVideoPromiseCache = new Promise(resolve => {
      videoChange(() => resolve(unsafeWindow.cid))
    })
  }
  const cid = await hasVideoPromiseCache
  return Boolean(cid)
}
