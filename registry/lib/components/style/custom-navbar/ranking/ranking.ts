import { defineAsyncComponent, markRaw } from 'vue'
import { type CustomNavbarItemInit } from '../custom-navbar-item'

const rankingUrl = 'https://www.bilibili.com/v/popular/rank/'
export const ranking: CustomNavbarItemInit = {
  name: 'ranking',
  displayName: '排行',
  content: '排行',

  href: `${rankingUrl}all`,
  active: document.URL.startsWith(rankingUrl),
  touch: true,

  popupContent: markRaw(defineAsyncComponent(() => import('./NavbarRanking.vue'))),
}
