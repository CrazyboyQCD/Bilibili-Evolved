# HANDOFF — Vue 3 升级项目交接

> 生成于 2026-09-02 会话结束。工作分支 `vue3-upgrade`（基于 master，已切换）。
> 2026-09-03 更新：§4.0.4 `window.Vue` interop 最小实验已完成并通过（结论与修正后的方案已回写 DESIGN.md），实验代码在 `vue3-upgrade/interop-experiment/`（未跟踪的临时实验，含自己的 node_modules/dist，勿提交）。
> 2026-09-04 更新：**阶段 0 完成**——工具链切换（§4.0.1–0.3）+ build-core 编译通过 + type/lint 红项记录在案（全部见 DESIGN.md §4.0.6），已提交。下一任务从阶段 1（core 基础设施）开始。

## 下一会话的任务

**阶段 1：core 基础设施（DESIGN.md §4）**，按序：

1. `mountVueComponent`（`src/core/utils/index.ts:180`）重写为 `createApp` + per-app 注册 `v-hit` 指令 + detached div 挂载；签名升级为接受 props（事件回调作为 `onXxx` props）。所有动态挂载点收口到它。
2. `init-vue.ts` 重写：直接采用 DESIGN.md §4.0.4 已验证的 `window.Vue` 形态（整库对象 + `__esModule: true` + default 自引用）；v-hit `inserted` → `mounted`；移除 `Vue.config` 全局配置。
3. `el.__vue__`/实例取用 → `mountVueComponent` 维护 `WeakMap<Element, Vm>` + `getInstanceFromElement(el)`；`createComponentWithProps` 用 `defineComponent` + `h` 重写；解 TS2456 循环引用（§4.0.6 备忘）。
4. 验收：`pnpm run type` 的 76 个红中 core 接缝部分（init-vue/utils/dialog/toast/settings-panel/bisector/widget/common-types/core-apis）清零，lint 的 128 红中 core 部分清零；build-core 保持绿。
5. 之后按阶段 2（src/ 全量）→ 3（registry）→ 4（版本与第三方）→ 5（验证）推进。改写时逐条对照 §5 checklist，注意 §5.4 新增的"多语句内联 handler 必须分号分隔"规则。

## 权威设计文档（勿在本文件重复其内容）

- **[vue3-upgrade/DESIGN.md](vue3-upgrade/DESIGN.md)** — 唯一权威方案：目标与决策、架构约束、阶段计划、迁移 checklist（响应式/事件/动态组件三节）、前次尝试考古结论、风险清单。实施中的任何偏差应回写该文档。

## 关键上下文（本会话沉淀、文档之外的补充）

1. **仓库工具**：本仓库有专用 skill `bilibili-evolved-dev-server`（dev server 启动、单组件构建、浏览器调试协议）；CodeGraph 已建索引（`.codegraph/`，932 文件），可用 `codegraph_explore` 快速查符号与调用链。
2. **历史尝试分支**：`origin/vue3-migration`（唯一"暂存"提交，基于落后 5 个月的 master）与 `origin/vue3`（最终跑通版）。只读参考、绝不从它们分叉；§6.2 列了可直接捡走的已验证选型。
3. **已锁定的历史 bug 根因**（§6.3 dev-client 重连失效）：AsyncButton 丢防双触发逻辑。这是迁移 checklist §5.2.2 的实证来源，同类透传组件（约 14 处 `$listeners`）务必逐个做"触发次数"验证。
4. **流程纪律**：按阶段/组件块原子提交（前次单提交"暂存"导致无法二分排查）；`preview-features`/`preview-fixes` 是常规基线，但本迁移走独立 `vue3-upgrade` 分支。
5. 用户之前多次遇到"数据响应问题"与事件问题的迁移失败，对回归风险敏感——改写时严格对照 DESIGN.md §5 checklist，验证阶段不可跳过（§4 阶段 5）。

## 建议加载的 skills

- `bilibili-evolved-dev-server` — 阶段 5 浏览器实测与单组件构建时。
- `codebase` — 查符号/调用链（项目已索引）。
- `better-code-review` / `code-review` — 各阶段提交合入前。

## 环境事实

- Windows / Git Bash；包管理 `pnpm@10.3.0`；常用命令：`pnpm run type`、`pnpm run lint-check`、`pnpm run build-core`、`pnpm run build-features`、`pnpm tsx dev-tools/dev-server/index.ts`。
- `vue3-upgrade/DESIGN.md` 与本文件为新增未跟踪文件，尚未提交（未获提交指令）。
