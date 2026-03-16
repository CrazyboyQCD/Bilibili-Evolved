import { defineAsyncComponent, markRaw } from 'vue'
import { CustomNavbarItemInit } from '../custom-navbar-item'

const messagesUrl = 'https://message.bilibili.com/'
export const messages: CustomNavbarItemInit = {
  name: 'messages',
  displayName: '消息',
  content: '消息',

  href: messagesUrl,
  active: document.URL.startsWith(messagesUrl),
  loginRequired: true,
  touch: true,

  popupContent: markRaw(defineAsyncComponent(() => import('./NavbarMessages.vue'))),
  lazy: false,
}
