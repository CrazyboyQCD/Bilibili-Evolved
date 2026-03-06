import { CustomNavbarItemInit } from '../custom-navbar-item'

const count = 4
export const blanks: CustomNavbarItemInit[] = Array.from({ length: count }, (_, index) => ({
  name: `blank${index + 1}`,
  displayName: `弹性空白${index + 1}`,
  content: '',

  disabled: true,
  flexStyle: '1 0 auto',
}))
