import * as VueLibrary from 'vue'

export const initVue = () => {
  // # 在 core 和 features 中使用同一个 Vue 库的实现方式
  //
  // 1. 在 core 中使用 commonjs 版本的 vue。通过配置 webpack/webpack.dev.ts, webpack/webpack.prod.ts 完成
  // 2. 将 `window.Vue` 设置为 'vue' 模块的命名空间导出。在 src/client/init-vue.ts 中完成
  // 3. 在 registry 中将 'vue' 设置为外部依赖，来源为 `window.Vue`。在 registry/webpack/config.ts 中完成
  //
  window.Vue = VueLibrary as any
}
