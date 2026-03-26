import { defineAsyncComponent, markRaw } from 'vue'
import { type CustomNavbarItemInit } from '../custom-navbar-item'

export const logo: CustomNavbarItemInit = {
  name: 'logo',
  displayName: 'Logo',
  content: markRaw(defineAsyncComponent(() => import('./NavbarLogo.vue'))),

  href: 'https://www.bilibili.com/',
}
