import { defineAsyncComponent, markRaw } from 'vue'
import { type CustomNavbarItemInit } from '../custom-navbar-item'

export const upload: CustomNavbarItemInit = {
  name: 'upload',
  displayName: '投稿',
  content: markRaw(defineAsyncComponent(() => import('./NavbarUpload.vue'))),

  touch: true,
  href: 'https://member.bilibili.com/platform/upload/video/frame',

  popupContent: markRaw(defineAsyncComponent(() => import('./UploadPopup.vue'))),
}
