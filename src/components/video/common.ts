export interface VideoControlBarItem {
  name: string
  displayName: string
  icon: string
  order: number
  action: (event: MouseEvent) => void | Promise<void>
}
