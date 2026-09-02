# Vue 3 升级设计方案

> Bilibili-Evolved · vue 2.7.16 → vue ^3.5 · 状态：设计定稿，未开始实施
> 分支：`vue3-upgrade`（基于 master）。本文档由 2026-09-02 会话综合代码考古与历史尝试教训产出。

## 1. 目标与已定决策

| 决策项 | 结论 |
| --- | --- |
| 目标版本 | vue ^3.5.x（获得 reactive props destructure、`useTemplateRef`、`defineModel`） |
| 组件改写深度 | 顺势全面改写 `<script setup>`（225 个 .vue：src 68 / registry 157） |
| 构建工具链 | 保留 webpack；vue-loader 15 → 17（配 @vue/compiler-sfc 3.x） |
| 兼容层 | 不引入 `@vue/compat`（共享单实例架构下成本高于收益） |
| 类型检查 | 引入 `vue-tsc` 补上 SFC 内部检查缺口（现状 tsc + shims 不检查 .vue 内部） |
| 发布方式 | 大版本硬切换 + 面向第三方组件作者的迁移文档 |

## 2. 决定整体策略的架构约束

1. **全站共享单实例 Vue，无法新旧共存**：
   - core 把 Vue 打包进 userscript 并挂到 `window.Vue`（`src/client/init-vue.ts:11`）；
   - registry 组件 webpack external `vue: 'global Vue'`（`registry/webpack/config.ts:38`）；
   - registry 产物为 UMD，经 `src/core/external-input/load-feature-code.ts` 的 sandbox（Proxy over window）执行。
   - 推论：已安装的旧第三方组件升级后必然失效，属于大版本 breaking change；**core 基础设施必须先行合入，代码无法分批上线**。
2. **Vue 2 与 Vue 3 的 `window.Vue` 语义不同**：2.7 靠 CJS 构建让全局对象同时带默认导出和具名导出；Vue 3 无等价物。方案见 §4 阶段 1。

## 3. 现状盘点（迁移面）

- 依赖：`vue@^2.7.14`、`vue-loader@^15.10.1`、eslint 7 + eslint-plugin-vue 9（`plugin:vue/recommended`）、typescript 5.8、webpack 5。**无** vuex / vue-router / class 装饰器 / 旧 slot 语法 / functional 组件（迁移面比一般老项目小）。
- 组件风格：~205 处 `Vue.extend`（Options API）、~45 个普通 options 对象、33 个文件已用 2.7 Composition API 具名导入。
- 高危 API 存量：`$emit` 92 处、`$listeners` ~14 处（VButton/VPopup/AsyncButton/text-control/VIcon/CustomNavbarLink/FilterSideCard）、`$on/$off` 挂载后监听 ~35 处、`Vue.set/$set/$delete` ~36 处、模板过滤器 4 文件、`$children` 6 处、自定义 `model:` 选项 10+ 处、`render(h)` 3 处、`::v-deep` 1 文件、`el.__vue__` 内部访问 4 处。
- 关键接缝：`mountVueComponent`（`src/core/utils/index.ts:180`，所有动态挂载的收口）、`init-vue.ts`（window.Vue + 全局 v-hit 指令）、`registry/webpack/config.ts`（externals + coreApis 映射）。

## 4. 阶段计划

### 阶段 0：工具链切换（不动业务代码）
1. 升级 `vue@^3.5`、`@vue/compiler-sfc@3.x`、`vue-loader@^17`；alias 从 `vue/dist/vue.runtime.common.prod.js`（`webpack/webpack.prod.ts:23`、`webpack.dev.ts:21`）改为 ESM 构建。
2. ESLint extends 改 `plugin:vue/vue3-recommended`；开启 `vue/require-explicit-emits`。
3. `src/shims.d.ts` 改 Vue 3 泛型形式；移除 `vueCompilerOptions.target`、`consolidate` 的 pnpm override。
4. **第一个任务（最小实验）**：验证 `window.Vue = { default, ...ESM命名空间, __esModule: true }` 方案下，registry 侧 `global Vue` external 的具名导入（`Vue.ref`）与默认导入 interop 行为。
5. 记录基线：`pnpm run type` / `lint-check` / `build-core` / `build-features` 全绿留作对照。

### 阶段 1：core 基础设施（必须先行）
- 重写 `mountVueComponent` 为 `createApp` + per-app 注册 `v-hit` 指令 + detached div 挂载；签名升级为接受 props（**事件回调作为 `onXxx` props 传入，结构性消灭全仓库 `vm.$on` 挂载监听模式**）。所有动态挂载点收口到它。
- `init-vue.ts`：v-hit `inserted` → `mounted`；移除 `Vue.config` 全局配置；按 §4.0.4 方案重设 `window.Vue`。
- `el.__vue__` → `mountVueComponent` 维护 `WeakMap<Element, Vm>` + 新增 `getInstanceFromElement(el)`。
- `createComponentWithProps` 用 `defineComponent` + 导入 `h` 重写；`$children`（show-upload-time）改模板引用。

### 阶段 2：src/ 全量改写（68 个 .vue + 3 组 mixin）
- Options API / `Vue.extend` → `<script setup lang="ts">`；mixins（componentSettingsMixin、virtualScrollMixin、textControlMixin）→ composables。
- 自定义 `model:` 选项 → `defineModel`（消费端模板 v-model 不用改）；`$listeners` 删除。
- 特殊点：`v-hit` 在每个 app 上注册（由 mountVueComponent 收口保证）。

### 阶段 3：registry/lib 全量改写（157 个 .vue + 相关 ts）
- 与阶段 2 同规格，另有明确特殊清单：
  - 过滤器 4 文件（UserInfoPopup、RankList、CompactRankList、GesturePreview）→ 函数调用；
  - `::v-deep`（merger/ui/PreviewModal.vue）→ `:deep()`；
  - **danmaku merger `vue-host.ts` 是最大单点**（`$on`/`Vue.set`/`Vue.nextTick` 约 60 处，且大量外部改 `$data`）→ 成块重构：状态收进组件 + `defineExpose` 显式 API，单独 commit 重点回归；
  - `feeds/filter/index.ts` 等 3 处 `render(h)` → 导入 `h`。

### 阶段 4：版本与第三方
- 大版本 bump + changelog；迁移文档：`window.Vue` 新语义（default 导入的 interop 约定）、`Vue.extend`→`defineComponent`、`$set/$on/$listeners/$children/filters` 移除清单、指令钩子改名、`update:xxx` → `v-model:xxx`。

### 阶段 5：验证
1. `pnpm run type`（含 vue-tsc）+ `lint-check`（vue3-recommended 全绿）。
2. `build-core` + registry 装依赖 + `build-features` 全量构建（225 个 SFC 过编译）。
3. dev 构建临时换用 Vue 开发版（当前 alias 指向 prod，warning 被吞），全页面巡检 console，**响应式 warning 与 Illegal invocation 清零才算过**。
4. 浏览器实测矩阵：设置面板（最重）、视频页（danmaku merger、player-gestures）、动态页（feeds filter）、直播页（badge-keepalive、chat-panel-fit）、全局 toast/dialog/launch-bar、dev-client 与 dev-server 全流程。
5. 事件密集路径专测"触发次数"（双触发/静默丢失两类症状，见 §5.2）。

## 5. 迁移 Checklist（改写时逐条对照）

### 5.1 响应式规则
1. **原生对象和类实例（WebSocket、EventTarget 子类、DOM、持有原生资源的对象）永远不进 `ref()`/`reactive()`/`data()`**——需要时用 `shallowRef`/`markRaw` 或模块级单例。深度代理会让品牌检查（brand check）的原生方法抛 `Illegal invocation`（Vue 为 Map/Set 特设 collection handlers、官方推荐 markRaw 正是这个原因）。重点：dev-client、runtime-library、下载相关。
2. `<script setup>` 内 `defineProps` 解构在 Vue 3.5+ 安全（编译期转回 `props.x`）；但 **watch 解构出的 prop 必须用 getter**（`watch(() => checked, ...)`）；解构规则只在 SFC 编译转换覆盖的位置生效。
3. 不把每实例状态提到模块作用域（丢响应 + 跨实例共享双坑）。
4. 不整体替换 `reactive` 变量引用、不解构 reactive；ref 更新用 `.value`。
5. 外部直接改组件 `$data` 的模式（vue-host.ts）不做机械替换，重构为 `defineExpose` 显式 API。
6. `Vue.set/$set` 一律改直接赋值（Vue 3 Proxy 下新增属性天然响应）。

### 5.2 事件规则
1. 所有组件显式 `defineEmits`，lint 开 `vue/require-explicit-emits`——防"未声明 emit 泄漏成原生监听导致双触发"。
2. **透传组件迁移标准动作：转发 attrs 时排除已声明 emits**（如 `lodash.omit(attrs, 'onClick')`），保留防双触发语义。⚠️ 血泪案例见 §6.3：vue3-migration 分支丢了 `omit($listeners, 'click')` 语义导致 dev-client 手动重连永久失效。
3. `mount-and-$on` 模式 → 回调 props（由 mountVueComponent 新签名承载）；`update:xxx` → `v-model:xxx`。
4. 迁移完成时三类存量清单清零：92 `$emit`（逐个声明）、14 `$listeners`（验证转发链）、35 `$on`（改回调）。

### 5.3 动态组件（`<component :is>` 约 24 处）
- 组件对象/异步组件（多数）：行为不变，类型改 `Component`。
- 字符串解析本地注册组件（SwitchOptions 三元）：script setup 化后失效，**必须改为传组件对象**（不报错但渲染成自定义元素，静默失败）。
- 字符串当原生标签（`'div'`）：合法，保留；但"字符串当组件名"（Dialog title 等）逐个核对合约。若确需全局名字解析，只能在 mountVueComponent 上 per-app `app.component` 注册。

## 6. 前次尝试考古（origin/vue3-migration、origin/vue3 分支）

### 6.1 分支状态
- `vue3-migration`：基于 2026-03-23 的 master（落后 5 个月），danmaku merger 等近期组件完全缺失；591 文件 +32k/-12k 塞在单个"暂存"提交，无法二分定位。**只作参考，不从它分叉。**
- `vue3`：为最终"改成功"的版本，同样未原子化。

### 6.2 可直接捡走的已验证选型
- `vue@^3.5.30` + `vue-loader@^17.4.2` + 保留 webpack（与本方案一致，已验证可走通构建）。
- `vHit` 指令独立导出（`mounted` 钩子）、`mountVueComponent` 迁 createApp 的具体实现细节。
- `init-vue.ts` 用 `import * as VueLibrary from 'vue'` 挂命名空间的**方向**正确，但它只加 `as any` 未处理 default 导入 interop——本方案 §4.0.4 的包装与实验验证仍然必要。

### 6.3 根因案例：dev-client 重连失效（已锁定，勿重蹈）
- **症状**：dev-server 关闭后点"连接"永远失败，autoConnect 一直正常，等多久都没用；报错 `closed before connected`。
- **根因**：AsyncButton 迁移弄丢防双触发。master 用 `lodash.omit($listeners, 'click')` 剔除 click 防重复；迁移版 `v-bind="attrs"` 全量透传 + `onClick` 手动调 `attrs.onClick` → 一次点击 connect 执行两次 → 两个并发 `createSocket` 互相残杀（第二个的 closeSocket 掐死第一个 ws → 第一个报 closed before connected → 其 error 回调又掐死第二个）→ 每次手动连接自我毁灭。autoConnect 单次调用不受影响。
- **实际修复**（vue3 分支）：AsyncButton API 改为 `waitOnClick` prop，不走事件透传。当时无人知其所以然。
- **教训**：症状离病灶很远；不报错只行为错；靠代码考古（三版 diff）而非猜机制才能定位。
- **附带地雷**：vue3-migration 的 `Widget.vue` 把 DevClient 实例放 `ref()`（§5.1 规则 1 的实例）；`index.ts` 的 dev 记录恢复逻辑被改坏（删了 ServerStop 事件处理，改为连接后首个 SessionsUpdate 的嵌套 once 监听）；Action.vue 的 ServerChange 监听未在 onUnmounted 移除（master 同样漏了，两边都要修）。

## 7. 风险与开放问题
- `window.Vue` interop 实验（§4.0.4）是全计划的第一块多米诺，失败则需改 registry externals 方案（如按具名导出逐个映射 global）。
- 第三方旧组件硬失效：大版本公告 + 迁移文档，无运行时兼容手段。
- `sass 1.25` + `fast-sass-loader` 老旧：正交问题，本次不动，可列后续。
- 提交纪律：**按阶段/组件块原子提交**（工具链 → core 接缝 → src 分块 → registry 分块），出问题可二分——前次单提交暂存是排查困难的主因。
