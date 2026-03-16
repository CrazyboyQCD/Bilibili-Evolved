import { defineAsyncComponent, markRaw } from 'vue'
import { getUID } from '@/core/utils'
import { CustomNavbarItemInit } from '../custom-navbar-item'

export const userInfo: CustomNavbarItemInit = {
  name: 'userInfo',
  displayName: '个人信息',
  content: markRaw(defineAsyncComponent(() => import('./UserFace.vue'))),

  href: getUID() ? 'https://space.bilibili.com' : null,
  touch: true,

  popupContent: markRaw(defineAsyncComponent(() => import('./UserInfoPopup.vue'))),
  lazy: false,
  noPopupPadding: true,
  boundingWidth: 240,
}
