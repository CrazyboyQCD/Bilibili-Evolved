import { select } from '@/core/spin-query'
import { mountVueComponent } from '@/core/utils'
import { getData } from '@/plugins/data'
import type BlackList from './blackList.vue'

export const BlackListDataKey = 'like-black-List.data'

let blacklistVM: InstanceType<typeof BlackList> | null = null

export const setBlackListProps = (element: HTMLElement) => {
  if (!blacklistVM) {
    return
  }
  blacklistVM.triggerElement = element
  const blackList = getData(BlackListDataKey)
  blacklistVM.list = blackList[0].users
  blacklistVM.titleName = '黑名单'
}
export const loadlikeButton = async () => {
  const LikeButton = await import('./like.vue')
  const blackList = getData(BlackListDataKey)
  const [el, likebuttonVM] = mountVueComponent(LikeButton)
  likebuttonVM.list = blackList[0].users
  const bg = (await select('#app')) as HTMLElement
  bg.insertAdjacentElement('afterbegin', el)
}

export const loadBlackList = async () => {
  if (blacklistVM) {
    return false
  }
  const blackList = await import('./blackList.vue')
  const [el, vm] = mountVueComponent(blackList)
  blacklistVM = vm
  document.body.insertAdjacentElement('beforeend', el)
  return true
}

export const toggleBlackList = async () => {
  if (!blacklistVM) {
    await loadBlackList()
  }
  blacklistVM.toggle()
}
