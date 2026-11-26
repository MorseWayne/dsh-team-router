# 架构与宿主触点

本插件的定位：**DSH 原生 Agent Teams 的增强插件**，只负责「任务类别 → 模型」的选择。是否分工、子智能体生命周期、权限与授权仍由 DSH 原生负责。

## 分层

```text
src/
├─ index.ts          Cordis 入口，仅 re-export adapter/dsh/runtime
├─ core/             与宿主无关：类别、V2 策略、旧策略迁移、推荐、委派参数校验、审计存储
├─ adapter/dsh/      DSH 运行时接线：团队识别、授权、配置校验、子智能体启动、工具注册
└─ ui/               设置页（DSH Web 客户端插件）及其纯状态逻辑
```

依赖方向只能向下：`adapter → core`、`ui → core`。[layering.test.ts](<../test/layering.test.ts>) 强制以下规则：

- `core/` 只能依赖 `node:*`、`zod` 和 `core/` 内部模块，不得引用任何 `@deepseek-ai/*`。
- `adapter/` 与 `ui/` 互不引用。
- DSH 运行时包（`@deepseek-ai/dsh-*`）只能出现在 `adapter/`；`ui/` 只能使用客户端侧宿主类型。

**目标：DSH 升级时只改 `adapter/`。** 如果升级迫使你改 `core/`，说明边界漏了，应先把触点挪回 adapter。

## 宿主触点清单

稳定度：🟢 公开导出且语义清晰 · 🟡 公开但语义依赖当前实现 · 🔴 内部实现或复制的语义。

| ID | 触点 | 位置 | 稳定度 | 退出路径 |
|---|---|---|---|---|
| T1 | `parentAgentOptionsForDelegation` | [runtime.ts](<../src/adapter/dsh/runtime.ts>) | 🟢 | — |
| T2 | `subagents.getProvider('spawn')` 的 `prepareContinuable`/`agentOptions`/`depthLimit` 能力检查 | runtime.ts | 🟡 | 上游提案 §2 |
| T3 | `subagents.startActivation`：rc.3 可能在已接纳后才 reject，因此失败一律记为 `unknown` | runtime.ts | 🟡 | 上游提案 §4 |
| T4 | `subagents.resolveMaxDepth` / `rootOf` / `namesOf` / `listDescendants` | runtime.ts、[native-team.ts](<../src/adapter/dsh/native-team.ts>) | 🟢 | — |
| T5 | `agentTeams.isEnabled` 与 `team/mode` 会话事件 | native-team.ts、runtime.ts | 🟡 | — |
| T6 | 自行折叠 `subagent/model-selection-policy` 事件，复制 `dsh-tool-subagent` 的授权语义 | [authorization.ts](<../src/adapter/dsh/authorization.ts>) | 🔴 | 上游提案 §1 |
| T7 | `llm.listModels` / `llm.resolveCallConfig` 预检 | runtime.ts | 🟢 | — |
| T8 | `internal/config` 钩子与 `fiber.effectiveConfig`，用于保存前校验与旧策略备份 | [config.ts](<../src/adapter/dsh/config.ts>) | 🔴 | 上游提案 §3 |
| T9 | `agent/created`、`subagent/start`、`agent/disposed`、`session/event` 事件与工具注册 | runtime.ts | 🟢 | 上游提案 §2 可删掉专用委派工具 |
| T10 | `session.requestHeader().config`，用于报告实际模型 | runtime.ts | 🟡 | — |
| T11 | 客户端：`configForms` 中的 `subagent-model-selection-settings` 表单、`plugins.bundle.config`/`settings.section` 插槽、`remote.pluginManager`/`remote.settings` | [client.tsx](<../src/ui/client.tsx>)、[model-grants.ts](<../src/ui/model-grants.ts>) | 🟡 | 上游提案 §1 后可只读 |

🔴 项是升级时最容易「静默失效」的地方，每次加入新宿主版本都应优先人工核对。

## 范围之外：外部执行器

Codex、agy、Cursor 等外部 Agent 的执行（权限根、递归限制、整树取消、不重放）属于**执行器**问题，不属于路由问题。本插件不实现它们，[delegation.ts](<../src/core/delegation.ts>) 中的 `EXTERNAL_GATES` 会一直拒绝。正确方向是由独立的 DSH 执行器/provider 插件接入；一旦它们以原生模型或 provider 的形式出现在 DSH 模型目录中，本插件无需修改即可路由过去。

## 宿主兼容性验证

- **发布门禁**：[publish.yml](<../.github/workflows/publish.yml>) 在 `engines.dsh` 列出的每个版本上，安装同一个打包产物并跑完整测试。
- **提前预警**：[host-canary.yml](<../.github/workflows/host-canary.yml>) 每天把同一份构建产物在本地临时改写清单后，对 npm 上最新的 DSH 版本跑一遍，**只预警，不影响发布**。失败说明下一版宿主可能触碰到上表中的某个触点。
