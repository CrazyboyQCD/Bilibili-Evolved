declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}
declare module '*.scss' {
  const style: string
  export default style
}
declare module '*.css' {
  const style: string
  export default style
}
declare module '*.woff2' {
  const base64: string
  export default base64
}
declare module '*.md' {
  const md: string
  export default md
}
declare module '*.svg' {
  const svg: string
  export default svg
}
declare module '*.jpg' {
  const jpg: string
  export default jpg
}
