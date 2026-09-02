# HANDOFF — Vue 3 升级项目交接

> 生成于 2026-09-02 会话结束。工作分支 `vue3-upgrade`（基于 master，已切换）。

## 下一会话的任务

开始实施 Vue 2.7 → Vue 3.5+ 升级。**第一步是 vue3-upgrade/DESIGN.md §4 阶段 0 的第 4 项：`window.Vue` interop 最小实验**——它决定 registry externals 方案能否成立，是全计划的第一块多米诺。之后按 DESIGN.md 的阶段 0 → 1 → 2 → 3 → 4 → 5 顺序推进。

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
