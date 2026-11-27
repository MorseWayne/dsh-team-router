# 架构与宿主触点

本插件是 **DSH 原生子智能体与 Agent Teams 的可配置分类选模插件（1.0.0 / V3 配置）**，提供「活跃任务类别 → 模型」路由和委派指引，但不自动发起委派；子智能体的生命周期、权限与授权仍由 DSH 原生负责。

DSH Web 的宿主 `subagent` 默认启用 `modelSelection: true`，无需开启团队协作即可使用分类选模。没有可选模的宿主工具时，开启团队模式的 Lead 仍可用 `team_route_delegate` 兜底，并通过 `team_route_status` 查询实时活跃类别。

## 活跃注册表、提示词与安全边界

- **单一真相源（[active-registry.ts](<../src/core/active-registry.ts>)）**：`resolveActiveRegistry(config)` 一次性校验并解析 V3 `RoutingConfig`，产出所有当前已启用的类别（启用的内置 12 类 ∪ 启用的最多 8 个自定义类）及其唯一有效目标（`effectiveTarget`）。系统提示、首步近场提醒、严格校验、团队委派、推荐预览范围和设置页授权集合（`requiredGrantPairs`）全部消费同一份活跃注册表，避免语义漂移。
- **停用即真退出**：已停用的内置或自定义类别保留其休眠绑定以便随时再启用，但彻底退出系统提示、近场提醒、严格校验允许集、推荐范围、所需授权和团队委派。
- **按完整三元组合并渲染**：[native-subagent.ts](<../src/core/native-subagent.ts>) 使用结构化键 `[provider, model, reasoningEffort ?? null]` 对齐和合并路由。多个类别指向完全相同的三元组时合并为一行展示；显式指定同一模型但省略推理强度表示采用模型默认值，绝不与带显式强度的条目合并，也不继承父会话强度。
- **自定义文本的非指令边界**：自定义类别的 `name`、`purpose`、`avoid` 强制单行、有界长度并拒绝控制字符/双向控制字符；在系统提示、首步提醒和子代理初始消息中以确定性 JSON 字符串编码，并明确声明仅作交付物验收描述，不能更改系统指令、要求调用工具或扩大权限。
- **委派模式与每轮近场提醒**：
  - `passive`（默认）仅在系统提示提供路由表；`specialist-first` 主动委派实质专长任务；`orchestrator` 要求主助手拆解、验收、汇总并委派匹配的实质执行。
  - `team-router:policy` 注册于系统提示词后部（`DEPLOYMENT_PERSONA_SUFFIX` 前一位，失败回退 `10199`）。
  - `agent/pre-step` 首步（`step === 1`）在下游允许进入后，仅对存活且已注册的 root、非被动模式、`guidance: true` 且存在与本步 `modelSelection` 三元组不同的已授权主动专长路由时，在 `decision.messages` 末尾追加自足的 `team-router:reminder`（不依赖适配器重发完整系统提示）。工具循环后续步、自动续跑与子代理均不注入。
- **严格校验四行真值表（`validateNativeSubagentCall`）**：
  - `strict === false` 或活跃类别数 `A === 0`：放行（插件不阻塞宿主）。
  - `A > 0`、已授权显式三元组集 `E` 非空且无可继承活跃类（`I === false`）：拒绝省略参数，只放行 `E` 中的精确三元组。
  - `A > 0`、`E` 非空且 `I === true`：允许省略参数，显式调用只放行 `E` 中的精确三元组。
  - `A > 0`、`E` 为空且 `I === true`：允许省略参数，**拒绝**任何显式模型三元组（防止借由停用类别残留的历史授权绕过当前策略）。
- **与注册表解耦的执行历史（[execution-store.ts](<../src/core/execution-store.ts>)）**：落盘在 `executions/<team-hash>.json`（`format: 1`），记录发起时的 `categoryId`、`categoryNameAtStart`、`categoryOrigin`、`source`、`target` 和 `policyDigest`。读取时仅校验落盘结构与长度，不回查当前注册表，确保停用或删除自定义类别后保留期内的历史始终可读。旧目录原封不动。

## 分层

```text
src/
├─ index.ts          Cordis 入口：薄导出 adapter/dsh/runtime 及公共委派模式类型/常量
├─ core/             与宿主无关：12 内置类与 4 模板、V3 策略解析、浏览器安全活跃注册表、推荐、委派、提示渲染与严格校验、独立历史存储
├─ adapter/dsh/      DSH 运行时接线：团队识别、授权投影、配置校验、系统提示、pre-step 与 pre-execute 钩子、动态团队工具与子智能体启动
└─ ui/               设置页（DSH Web 客户端插件）：V3 编辑器状态、4 分组折叠视图、自定义类别编辑器与模型授权同步
```

依赖方向只能向下：`adapter → core`、`ui → core`。[layering.test.ts](<../test/layering.test.ts>) 强制以下规则：

- `core/` 只能依赖 `node:*`、`zod` 和 `core/` 内部模块，不得引用任何 `@deepseek-ai/*`（且供 UI 导入的 `categories`、`routing-policy`、`active-registry`、`recommendations` 保持浏览器安全，不引入 `node:*`）。
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
| T8 | `internal/config` 钩子，用于保存前全量校验 `routing`（1.0.0 已移除旧策略备份） | [config.ts](<../src/adapter/dsh/config.ts>) | 🔴 | 上游提案 §3 |
| T9 | `agent/created`、`subagent/start`、`agent/disposed`、`session/event` 事件与工具注册（`team_route_delegate` 接受 `string` 并在执行前与预检后按实时活跃注册表校验；已移除 `team_route_set`/`team_route_reset`） | runtime.ts | 🟢 | 上游提案 §2 可删掉专用委派工具 |
| T10 | `session.requestHeader().config`，用于报告实际模型 | runtime.ts | 🟡 | — |
| T11 | 客户端：`configForms` 中的 `team-router`（单字段 `routing`）与 `subagent-model-selection-settings` 表单、`plugins.bundle.config`/`settings.section` 插槽、`remote.pluginManager`/`remote.settings`；授权仅按活跃有效目标求并集 | [client.tsx](<../src/ui/client.tsx>)、[model-grants.ts](<../src/ui/model-grants.ts>) | 🟡 | 上游提案 §1 后可只读 |
| T12 | 可选依赖 `systemPrompt.section`（`DEPLOYMENT_PERSONA_SUFFIX` 前一位，有限数值检查，失败回退 `10199`；`interpolate: false`），组装回调的 `modelSelection` 与 `tools.get('subagent', agent)` 选模检查 | runtime.ts | 🟡 | 上游提案 §2 后可简化 |
| T13 | `tools/pre-execute` 瀑布钩子（仅在 `routing.behavior.strict === true` 时校验原生 `subagent` 调用） | runtime.ts | 🟢 | 上游提案 §2 后可删除 |
| T14 | `agent/pre-step` 瀑布钩子与 `MessageSourceMap` 扩展，用于追加首步同模合并提醒；依赖宿主的 1-based step 和本步模型选择 | runtime.ts | 🟡 | — |

🔴 项是升级时最容易「静默失效」的地方，每次加入新宿主版本都应优先人工核对。

## 范围之外：外部执行器

Codex、agy、Cursor 等外部 Agent 的执行（权限根、递归限制、整树取消、不重放）属于**执行器**问题，不属于路由问题。1.0.0 配置模型已彻底移除外部执行器占位字段。正确方向是由独立的 DSH 执行器/provider 插件接入；一旦它们以原生模型或 provider 的形式出现在 DSH 模型目录中，本插件无需修改即可路由过去。

## 宿主兼容性验证

- **发布门禁**：[publish.yml](<../.github/workflows/publish.yml>) 在 `engines.dsh` 列出的每个版本上，安装同一个打包产物并跑完整测试。
- **提前预警**：[host-canary.yml](<../.github/workflows/host-canary.yml>) 每天把同一份构建产物在本地临时改写清单后，对 npm 上最新的 DSH 版本跑一遍，**只预警，不影响发布**。失败说明下一版宿主可能触碰到上表中的某个触点。
