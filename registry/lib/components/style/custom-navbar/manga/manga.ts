import { defineAsyncComponent } from 'vue'
import { CustomNavbarItemInit } from '../custom-navbar-item'

export const manga: CustomNavbarItemInit = {
  name: 'manga',
  displayName: '漫画',
  content: '漫画',

  touch: true,
  href: 'https://manga.bilibili.com/',

  boundingWidth: 500,
  noPopupPadding: true,
  popupContent: defineAsyncComponent(() => import('./MangaPopup.vue')),
}
