import { videoChange } from '@/core/video'
import { matchUrlPattern, mountVueComponent } from '@/core/utils'
import { playerUrls } from '@/core/utils/urls'
import { VideoControlBarItem } from './common'
import type VideoControlBar from './VideoControlBar.vue'

const controlBarClass = '.be-video-control-bar-extend'
type VideoControlBarInstanceType = InstanceType<typeof VideoControlBar>
let controlBarInstance: VideoControlBarInstanceType | null = null

const initControlBar = lodash.once(() => {
  if (!playerUrls.some(url => matchUrlPattern(url))) {
    return Promise.resolve<null>(null)
  }
  return new Promise<VideoControlBarInstanceType>(resolve => {
    videoChange(async () => {
      const { playerAgent } = await import('@/components/video/player-agent')
      const time = await playerAgent.query.control.buttons.time()
      if (time === null || time.parentElement?.querySelector(controlBarClass) !== null) {
        return
      }
      const [el, vm] = mountVueComponent(await import('./VideoControlBar.vue'))
      time.insertAdjacentElement('afterend', el)
      resolve(vm)
    })
  })
})
/** 向视频控制栏添加按钮 */
export const addControlBarButton = async (button: VideoControlBarItem) => {
  if (!controlBarInstance) {
    controlBarInstance = await initControlBar()
  }
  controlBarInstance.items.push(button)
}
