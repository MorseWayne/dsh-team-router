# dsh-team-router

给 **DSH 原生 Agent Teams** 增加可解释的模型路由，不另造团队、消息、任务板或调度器。

**实验性 V1：精确适配 DSH `0.2.2-rc.1`，Node.js 24+。不要据此推断其他版本兼容。**

## 功能与边界

- 路由优先级：Lead 手动覆盖 > 任务关键词规则 > 成员名角色映射 > 配置默认 > 原生继承。
- 规则按 `priority` 从高到低匹配；同优先级按配置顺序，任一关键词命中即匹配。英文单词有边界匹配，中文按子串匹配；关键词不是正则。
- 模型只从部署者声明的命名 `routes` 中选择，不接受模型自行提交任意 provider/model。
- 不改写 `spawn_teammate`、原生工具 schema、成员关系或任务状态。
- Lead、普通 subagent、Workflow 子代理不参与路由。
- 支持原生 fresh/fork 队友。底层 `spawn`/`fork` 是子代理后端，**不是 LLM provider**。
- 无额外 LLM 分类调用，无定时任务、额外服务或新 UI。

本项目默认配置 `routes: {}`，不会替你选择真实付费模型。本工作区开发不会自动安装或启用到你正在使用的 DSH profile。

## 开发与验证

```sh
npm ci --ignore-scripts --cache .npm-cache
npm run check
npm pack --ignore-scripts --cache .npm-cache
```

测试使用离线模型适配器，不调用真实模型、不消耗模型额度。生产插件只依赖 `peerDependencies` 中的 DSH 原生包；测试所需宿主组件在 `devDependencies` 中。

当前验证：**66 项测试通过**（46 项策略、5 项状态存储、15 项原生宿主集成），另有构建后 ESM 导出与发布声明冒烟检查。集成测试使用真实 Cordis、AgentLoop、TeamService、JSONL Session 持久化与 spawn/fork 后端，只有 LLM 传输使用离线适配器；覆盖首次请求、任务切换、同名团队隔离、权限、运行中覆盖、卸载／重载、冷成员恢复、pre-step 守卫竞争拦截及已接纳 step 的固定模型语义。

尚未安装到活跃 profile，也未测试你的真实模型 API 或 Web GUI 安装流程。这里的通过结果不代表生产环境已验收。

## 安装到独立测试 profile

先用 DSH 支持的方式初始化一个**独立测试 profile**，确保它包含 base 与原生 Agent Teams 组合包，不要直接试在有运行中成员的生产 profile。

```sh
# 在项目目录先构建；包内已经包含构建输出，不需要安装脚本。
npm run build

# 将 PROFILE_NAME 替换为已初始化的独立 profile。
dsh plugin --profile PROFILE_NAME add @deepseek-ai/dsh-experimental-agent-team-profile
dsh plugin --profile PROFILE_NAME add "$PWD"
```

然后把 [示例配置](<examples/router.patch.yml>) 中的 `team-router` 行并入你维护的 profile patch，替换所有 `YOUR_*` provider/model ID。该行会替换该插件的完整 config，不要编辑 DSH 自带 preset 或 node_modules 文件。

```sh
dsh --profile PROFILE_NAME --dump-config
```

核对合成结果包含原生 Teams 和唯一的 `team-router` 行，确认路径和模型 ID 正确后重启对应 Host，Web 客户端刷新页面并开始新会话。CLI 全局包、Desktop 内置核心以及不同 profile 不是同一运行环境；必须核对目标 Host 自己的版本。

## 配置

```yaml
- id: team-router
  config:
    routes:
      fast: { provider: YOUR_PROVIDER_ID, model: YOUR_FAST_MODEL_ID }
      deep: { provider: YOUR_PROVIDER_ID, model: YOUR_DEEP_MODEL_ID }
    rules:
      - id: complex
        priority: 100
        keywords: [重构, 架构, debug, implement]
        route: deep
      - id: research
        priority: 10
        keywords: [搜索, 总结, search, summarize]
        route: fast
    roles:
      researcher: fast
      implementer: deep
    historyLimit: 100
```

`roles` 的键是 **精确成员名**，不是模糊角色识别。`defaultRoute` 可选；省略时未命中的成员保留原生创建时的完整路由（包括原 reasoning effort）。某条 route 若省略 `reasoningEffort`，切换到它时使用目标适配器默认，不继承上一个模型的 effort。

最多 64 条 routes、64 条 rules、每条 32 个关键词；`priority` 为 -1000..1000 整数，`historyLimit` 为 1..1000（默认 100）。未知字段、错误引用、重复规则 ID 会报错。

选择的 provider 必须已注册，model 必须在它的模型目录里，显式 effort 必须通过宿主能力验证。**目录为空或缺少模型时拒绝路由，不静默降级。** 请先在 provider 配置中补全模型目录。这是部署校验，不是可用额度、价格、API 授权或实时健康保证。

## 使用

正常使用原生 Teams，例如要求 Lead 创建 `researcher`、`implementer`、`reviewer` 并分配工作。插件会自动根据实际成员和任务记录选择模型。

额外提供三个**成员作用域工具**：

| 工具 | 谁可用 | 含义 |
|---|---|---|
| `team_route_status` | Lead、teammate | 查询当前团队的 lastUsed / nextSelection、规则来源、覆盖与有限历史 |
| `team_route_set` | 仅 Lead | `{"member":"researcher","route":"deep"}` |
| `team_route_reset` | 仅 Lead | `{"member":"researcher"}`，移除手动覆盖并恢复规则路由 |

可直接说：“查询团队路由情况”“把 researcher 固定到 deep 路由”“取消 researcher 的手动路由”。这些工具不会唤醒、启动或中断成员。

`lastUsed` 来自原生最近 request/header；`nextSelection` 来自 Agent.model，两者可能不同，不能把待生效选择当成已发出的模型请求。原生成员列表可能仍显示创建 options 的模型；以本插件状态与请求头为准，不擅自修改原生 UI 投影。

## 路由什么时候生效

1. 成员创建：在原生串行 `agent/created` 阶段建立路由，排队输入尚未释放。
2. 新 turn 的首次 inbox claim：同步读取这次实际输入，在宿主捕获模型选择前刷新。
3. 任务边界：监听 Lead Session 提交的 `team/task`，按当前成员负责的 in_progress 任务路由；没有进行中任务时才考虑其已就绪的 pending 任务。多个任务合并匹配，按规则优先级决定。
4. 同一任务集合内的编辑／revision 变动不单独重选；下一次新 turn 可重评。
5. 执行中的手动覆盖排队到下一次新 turn 或任务集合变化；idle 成员可立即更新下一步选择。**已通过 pre-step 接纳的 step 固定使用其捕获模型**，即使此后路由变化，也不改写这个 step 的请求。
6. `agent/pre-step` 只做验证／拒绝，**不在那里切换已经捕获的模型**。守卫会在自身检查范围内（工具／提示词组装之后、路由元数据验证和下游 pre-step 钩子前后）核对选择；发现规则／状态错误或过期选择时拒绝这次请求。被拒绝的输入已经从 inbox claim，**不会自动重放**；应检查状态／错误后明确重发，防止重复副作用。
7. 守卫通过后，宿主仍可能异步执行 `agent/request`／`llm.prepareCall()`；这段时间发生的任务变更只影响**后续 step**，当前已接纳的请求仍使用旧的固定选择。这是遵循原生 step 语义，不声称拦截宿主所有异步准备竞争，也不使用已弃用的 request 钩子重写路由。

成员首个输入尚未 claim 时先使用其 description／角色；claim 后会按实际初始 prompt 再决定。消息内容和任务描述只参与关键词计算，不获得修改路由白名单的权限。

## 状态、恢复与卸载

默认状态目录：`$DSH_HOME/storages/team-router`（DSH_HOME 未设时为用户主目录的 `.dsh/storages/team-router`）。可用 `stateDir` 指定插件独立绝对路径。

- 文件名是原生 TeamId（根 SessionId）的 SHA-256；内容仍保存并核对原始 TeamId。
- 覆盖和基线路由按原生 **member SessionId** 存储，不按可重复的成员名字串存储。
- 临时文件原子替换，文件权限 0600；保存基线、任务边界、覆盖和有界决策记录。**不保存完整提示词、任务正文或凭证。**
- 实际模型选择仍通过原生 `agent.model.select()` 写入 Session，恢复沿用 DSH 自己的持久化。
- 损坏／身份不匹配的状态文件报错并保留，不自动删除或伪造新状态。应备份后排查，不要在成员运行中手改文件。
- 同一状态目录／同一团队只允许一个 Host 写入；不提供跨进程锁或分布式一致性。独立 profile 如果会手动复用相同 SessionId，应分别设置 `stateDir`，不要共用状态目录。

卸载时，插件会对**仍在内存中且选择仍由本插件持有**的成员恢复原基线，不覆盖其他操作者后续的模型选择。

**重要：卸载无法重写未加载成员的历史 Session，也不提供 AgentModel 的 unset（宿主没有该 API）。** 对冷成员，先加载它们并恢复路由后再禁用；或者保留插件状态直至团队完成。不要把“移除包”误认为已经撤销所有历史持久化选择。状态目录不会随卸载自动删除。

```sh
dsh plugin --profile PROFILE_NAME remove dsh-team-router
```

重启对应 Host，并刷新 Web 页面。变更整个 Host profile 时先停止／收尾正在执行的任务。

## 兼容性与非目标

- 仅宣称验证 `0.2.2-rc.1`；原生 Teams 仍是实验接口，升级 DSH 后应重新运行集成测试。
- 不与 `dsh-team-models` 等另一套同成员模型覆盖插件同时启用；多个写入者的路由优先级没有统一契约。
- 不把社区另一套 Agent Teams 当作原生 Teams；本插件只认原生 `agentTeams.tryMembership()`。
- 不提供价格感知、余额检测、自动故障重试、嵌入分类器、语义 LLM 分类或 Web 看板。
- 模型切换可能改变能力、上下文窗口与缓存命中；没有承诺节费比例。复杂任务规则应优先匹配，先用隔离 profile 对你的真实任务验证。

## 许可证

MIT。
