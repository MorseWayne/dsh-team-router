# dsh-team-router

为 **DSH 原生 Agent Teams** 提供七种内置任务分类、可视化配置，以及**创建子代理前**固定模型的受控委派。不替换团队、消息、任务板或调度器。

**v0.3.0 精确适配 DSH `0.2.2-rc.3`，Node.js 24+。** 本版完成七分类与原生委派；Codex / agy / Cursor 外部执行的安全接入仍在验证，当前明确禁用，不把已安装 CLI 或可选 LLM 适配器冒充已就绪的 Agent 执行器。

## 工作流程：团队分工和分类路由有什么区别？

**谁来做，由主助手（Lead）决定；新队友用哪个模型，取决于 Lead 采用哪种委派方式。** 停用本插件不等于关闭 DSH 团队协作。以「帮我写一份发布说明」为例，在主会话已开启团队协作的前提下：

```text
用户提出需求 → Lead 判断是否分工
                ├─ 自己完成 → 直接回复
                └─ 委派给队友
                    ├─ 原生委派（插件开或关都可用）
                    │   → 按 DSH 原生规则继承或选择已授权的模型
                    └─ 分类委派（仅插件启用时可用）
                        → Lead 选择 writing → 插件读取该类目标并校验授权
                        → 用选定模型创建原生队友

两种委派都由 DSH 管理：队友执行 → 返回结果 → Lead 验收并回复。
需要多人配合时，成员可用消息沟通，用共享任务板跟踪负责人、依赖和进度。
```

**保存策略后，会自动分派吗？** v0.3.0 自动做的是**按类别选模型**，不是自动拆任务或拦截所有委派。比如已保存 `writing → 模型 A`：只有 Lead 调用 `team_route_delegate` 并选择 `writing` 时，新队友才按该配置使用模型 A。Lead 自己写或选择普通委派时，这条配置不会生效。日常直接说需求即可，不必手写工具参数；想验证时，可以说：「请按 `writing` 类别委派这份发布说明，完成后用 `team_route_status` 查一下本次配置目标。」

**只想用原生协作？** 在插件管理中停用 `dsh-team-router`，保留主会话的团队协作开关即可。反过来，如果只想在某个主会话关闭团队协作，在该会话的「模型与推理等级」菜单关闭「启用智能体团队协作」；该会话也就不再提供分类委派工具，不影响其他主会话。两种操作都不是取消已启动任务的方式。

## 七个内置类别

| 类别 | 主要用途 |
|---|---|
| `visual-engineering` | 前端界面、视觉交互、布局与样式实现 |
| `ultrabrain` | 高难推理、复杂约束、算法与架构决策 |
| `deep` | 需要持续探索、实现和验证的自主任务 |
| `artistry` | 创意方向、发散设计、非惯常解法 |
| `quick` | 边界清楚的小改动、局部修复与查询 |
| `unspecified` | 不属于专门交付物类别的通用兜底 |
| `writing` | 文档、说明、报告及文字交付物 |

选择顺序是**主交付物优先 → 执行方式其次 → 通用兜底**。这七类是本项目对 OmO 分类的合并优化，不宣称是 OmO 原生七分类。没有关键词分类器、角色名映射、额外分类模型或复杂度档位矩阵。

初始策略全部使用**原生继承**，不自动更换付费模型。用户不必先添加分类或创建命名路由。

## 设置页

安装并启用后，刷新当前 DSH Web，打开 **设置 → 团队任务路由**：

- 七张内置分类卡片，每类可使用统一默认目标，或自选原生供应商／模型／推理强度。
- 模型来自当前 Host 的实时目录；切换模型会清除不兼容的旧 effort。
- **推荐预览**依据版本化的精确型号候选清单与实时目录匹配。默认不覆盖自选目标，无候选时保持当前／默认值。先确认差异到草稿，再明确保存；不宣称模型是基准最优或已获得会话授权。
- 支持中英文、原生主题、只读模式、CAS 冲突、目录故障和失败时保留草稿。
- 外部执行器可见但不可选；既有外部配置保留展示并提示未就绪，不静默降级成原生执行。

设置修改通过 **ConfigForms → Settings → ConfigEditor** 保存。V2 策略位于单一 volatile 字段 `policyV2`，使用完整候选校验和 revision CAS；不自行重写 profile 文件。配置只影响**之后提交的新类别委派**，不改变正在运行或保留用于续聊的成员。

## 运行工具

先在原生会话开启 Agent Teams。

| 工具 | 调用者 | 行为 |
|---|---|---|
| `team_route_delegate` | 仅 Lead | 按类别配置启动新的原生子代理 |
| `team_route_status` | Lead、原生队友 | 查询配置、迁移要求、请求目标与执行记录 |
| `team_route_cancel` | 仅 Lead | 请求取消本团队的活动类别委派；不回滚已发生的副作用 |
| `team_route_set` / `team_route_reset` | 仅 Lead | 已退休的兼容入口，始终拒绝；不会再改写成员模型 |

以下是 Lead 调用 `team_route_delegate` 时的参数示例，不是用户提需求时必须填写的模板：

```json
{
  "category": "deep",
  "description": "Implement validated settings persistence",
  "prompt": "Implement the requested settings change in the current repository. Preserve existing CAS behavior, add regression tests, run the relevant checks, and report changed files and any blockers.",
  "name": "settings-worker"
}
```

可选 `cwd` 仍由原生子代理生命周期验证。模型／执行器不是工具入参，不能由模型绕过类别绑定。普通 `subagent`、spawn、fork 不自动套用类别，也不会被插件偷偷重选；Lead 本身不变。

### 授权与提交边界

1. 读取独立的类别配置快照。
2. 显式原生模型必须满足当前 Session 记录的子代理模型白名单；无记录时只允许当前父模型。**目录可见不是授权**。
3. 检查供应商目录和 effort 能力；元数据检查不会发送推理请求，也不保证账号额度或运行健康。
4. 异步检查后再次核对配置、父模型、团队身份、授权和 provider 实例。
5. 同步写入准备记录并调用原生 `startActivation`，模型从子代理首请求开始生效，不在创建后调用 model.select 修补。

委派复用原生容量、深度限制、消息投递、取消和完成通知。子代理输出仍是需要 Lead 验收的材料；执行完成不代表任务已被用户验收。不会自动升级模型、重试或重放。

## 从旧版迁移

旧版非空 routes/rules/roles/defaultRoute 不会继续参与运行，委派将明确返回 `migration-required`。设置页提供迁移确认：

- 仅把旧**默认路由**精确映射为新的默认原生目标。
- 不根据旧路由名称猜测分类，不迁移旧成员手动覆盖。
- 保存前在状态目录创建旧有效策略的 0600 备份；备份失败拒绝保存。
- 原旧配置值及 V1 状态文件保留供回滚；V2 运行逻辑完全不读取规则／角色来选模。
- 备份可能因候选校验生成但最终 CAS 未提交；存在备份本身不代表迁移已生效，应以已保存的 `policyV2` 为准。

回滚需通过支持的插件管理及配置入口恢复旧版本和旧策略，不手工删状态或把 V2 执行记录解释成 V1 成员覆盖。不能用“恢复默认”按钮隐式恢复已下线规则。

## 外部执行器现状

| 执行器 | 已确认的接入能力 | 当前门禁 |
|---|---|---|
| Codex | 已安装订阅插件的 `codex-subscription-subagent` 支持按请求 model/effort，模型命名空间为 `openai-codex`；裸官方 `codex` 不是同一契约 | 专用 CLI 未准备，权限根与外部递归限制尚未验证，禁用 |
| agy | 本机 CLI 支持 model/effort、sandbox；现有桥接是 LLM adapter/工具而非已验证的 subagent provider | 桥接默认权限跳过、自动重放、非原生托管生命周期，禁用 |
| Cursor | 本机 CLI 支持 model、sandbox、plan/ask | 缺已验证的 DSH Agent 接入、取消与递归约束，禁用 |

外部 A2A 目标指 agent-to-agent 委派，不承诺标准 Agent2Agent 协议兼容。没有自动安装、自动登录、危险权限开关或切换全局 backend。完整三执行器实测尚未完成，不能把本版称为外部 A2A 全部交付。

## 状态与卸载

默认状态目录：`$DSH_HOME/storages/team-router`；未设置 DSH_HOME 时使用用户目录下的 `.dsh/storages/team-router`。静态 `stateDir` 可隔离不同 profile，不能由设置页改写。

V2 使用单独的状态子目录和 TeamId 哈希文件；0600 文件、原子替换、单文件 4 MiB 上限。历史数量限制为 1–1000，活动任务不为腾出历史空间而删除。记录类别、请求目标、配置摘要及原生生命周期，不记录任务正文、提示词或凭证。可获取的实际模型仅来自原生请求头；拿不到就显示未知，不把请求值伪装成实际值。

重载后缺少活动句柄的历史显示 `unknown`，不会冒充成功或自动续跑。旧实例迟到的完成回调与新实例的任务记录按最新磁盘快照合并。一个状态目录只允许同一 Host 写入；多 Host 必须隔离。

停用或卸载本插件会撤下分类路由工具，不会替你关闭原生 Team 模式。单独关闭某个主会话的 Team 模式，则会从该会话及其队友撤下团队协作和分类路由工具。已被原生管理器接纳的成员仍按创建时的模型执行，不被插件重新选模或强行回滚。

## 安装、构建与验证

安装目标必须是正在访问的同一 Host/profile，通过 DSH 插件管理器安装本地目录或安装包。不要另起服务器冒充更新当前 GUI。需要重启时按插件管理器提示重启同一个 Host，客户端更新后刷新原页面。

```sh
npm ci --ignore-scripts --cache .npm-cache
npm run check
npm pack --ignore-scripts --cache .npm-cache
```

测试覆盖严格策略、真实 Session 授权事件、首请求选模、普通 spawn/fork 不改写、快照更新、取消、迁移备份、原生 ConfigEditor/CAS/重启持久化、UI 编辑器和推荐预览。集成测试只替换 LLM 传输，其余使用真实 Cordis / AgentLoop / TeamService / Session / SubagentRuntime，不消耗真实模型额度。

客户端复用 Host React 和原生设置槽位，没有第二套 Web 应用。没有已认证浏览器控制时，不声称完成 GUI 渲染、主题或截图验收。具体设计和剩余验收见 [实施方案](<docs/IMPLEMENTATION_PLAN.md>)。

高级配置示例见 [V2 配置模板](<examples/router.patch.yml>)。旧纯解析 API 仅供兼容与迁移；新 API 通过 `dsh-team-router/routing-policy` 和 `dsh-team-router/categories` 导出。

MIT。
