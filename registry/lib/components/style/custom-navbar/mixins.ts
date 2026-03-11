import { onMounted } from 'vue'
import { CustomNavbarItem } from './custom-navbar-item'

export interface UsePopperProps {
  item: CustomNavbarItem
  container: HTMLElement
}
export const usePopper = (props: UsePopperProps) => {
  onMounted(() => {
    const navBarItem = props.item
    const containerElement = props.container
    if (containerElement) {
      navBarItem?.usePopper(containerElement, containerElement.children[0] as HTMLElement)
    }
  })
  return {
    popupShow() {
      const navBarItem = props.item
      navBarItem?.popper?.update()
    },
  }
}
