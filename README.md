# dsh-team-router

为 **DSH 原生 Agent Teams** 提供模型路由和 **Web 可视化配置编辑**，不替换团队、消息、任务板或调度器。

**v0.2.0 精确适配 DSH `0.2.2-rc.3`，Node.js 24+。** v0.1.0 对应旧 `0.2.2-rc.1`，不能混装；本版没有使用版本豁免绕过接口差异。

## 在哪里编辑

安装并启用插件后，刷新 DSH Web，打开 **设置 → 团队模型路由**。

页面提供真实表单，不需要手写 YAML：

- **模型路由**：增加／删除命名路由，从当前 Host 的模型目录选择供应商、模型和推理强度。
- **任务规则**：编辑规则 ID、关键词、目标路由、优先级，添加／删除及上下调整顺序。
- **队友角色**：把精确队友名称映射到路由。
- **默认策略与历史记录**：选择默认路由或继承队友模型，设置历史记录上限。
- **保存策略／取消修改／恢复继承的策略**：支持加载、只读、保存失败、模型目录异常和多页面编辑冲突提示。

同一优先级的规则按行顺序匹配；数值越高的规则越先匹配。名称、模型 ID 和推理强度不由插件猜测。目录暂时不可用时保留已保存值和草稿，不偷偷换成其他模型。

## 安装

项目已包含构建产物；开发者修改后先运行 `npm run build`。

在目标 DSH 的 **插件 → 添加插件** 中选择本地项目目录或安装包，或通过支持的 `plugin_manager install_bundle` 安装。插件必须安装到你正在访问的 Host/profile，而不是另一套 CLI 或 Desktop 环境。

安装结果若显示需要重启，请重启同一个 Host；客户端更新后刷新原 Web 页面。不要启动替代服务器来冒充当前 GUI。安装不等于已完成页面视觉验证，仍应检查设置入口和保存反馈。

本包只插入唯一的 `team-router` 行，不替换 DSH 自带行。默认 `routes: {}`，不会擅自选择你的付费模型。先在会话中开启原生 **Agent Teams**；关闭 Team 模式的树不参与路由。界面编辑策略本身不会开启团队、启动成员或发送模型请求。

## 保存与生效

设置通过 DSH 的原生 **ConfigForms → Settings → ConfigEditor** 保存到当前 profile。插件不自行定位或重写用户的 profile 文件。

- 五个策略字段使用原生 volatile 配置引用，整份表单一次原子保存；`stateDir` 不在界面可写字段中。
- 草稿保留开始编辑时的 revision。过期写入会拒绝，不能用刚刷新的 revision 强行覆盖未看见的修改。
- 保存拒绝或网络失败保留草稿；必须明确取消／重新加载才会丢弃它。只读部署不会显示可用的保存操作。
- Host 在落盘前验证完整策略，包括重复名称、错误路由引用、关键词和数值上限。失败时不改变磁盘配置或正在运行的引用。
- 保存后，新的策略在成员的下一次新 turn、任务集合边界或新成员激活时读取。配置更新本身不打断任务或重写已接纳的请求。
- 默认路由选择“继承队友的模型”表示**没有默认路由**；保存时显式覆盖组合层默认。它不同于“恢复继承的策略”，后者清除五个用户覆盖并恢复组合层配置。

恢复继承不会删除任务、成员或状态目录。移除被规则／角色引用的路由前需先调整引用；移除仍被某个成员手动覆盖引用的路由后，该成员下一次路由边界会明确报错，需要 Lead 重置其覆盖，不会静默换模型。

## 路由策略

优先级：**Lead 手动覆盖 > 任务关键词规则 > 精确成员名映射 > 默认路由 > 原生继承**。

规则匹配任一关键词即命中。ASCII 单词使用词边界，中文和混合关键词按子串匹配；关键词不是正则。`roles` 是精确原生名称（含嵌套成员路径），不是模糊岗位识别。

`defaultRoute` 省略时沿用配置层继承值；有效策略没有默认路由时，成员回到原生创建时的完整模型选择。某条 route 省略 `reasoningEffort` 则使用目标适配器默认，不保留上一个模型的 effort。

最多 64 条 routes、64 条 rules、每条 32 个不超过 100 字符的关键词；优先级为 -1000..1000 整数，历史上限为 1..1000（默认 100）。所选模型必须已注册并在 provider 的模型目录中，显式 effort 必须通过宿主能力验证。元数据校验不是额度、价格、认证或实时健康保证。

高级用户仍可使用兼容的平铺配置，完整模板见 [配置示例](<examples/router.patch.yml>)：

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
    roles: { researcher: fast, implementer: deep }
    # null 显式禁用下层默认；省略字段则继承配置层值。
    defaultRoute: null
    historyLimit: 100
```

## 聊天工具

全局模型白名单的编辑是用户操作；Agent 不能通过本插件扩大它。原生 Team 成员另有以下作用域工具：

| 工具 | 调用者 | 含义 |
|---|---|---|
| `team_route_status` | Lead、队友 | 查询当前团队最近请求、下一步选择、决策来源、覆盖与有限历史 |
| `team_route_set` | 仅 Lead | `{"member":"researcher","route":"deep"}`，只能选择已配置路由 |
| `team_route_reset` | 仅 Lead | `{"member":"researcher"}`，移除该成员的手动覆盖 |

这些操作不会启动或唤醒成员。成员运行中设置的覆盖在下一次新 turn 或任务集合边界生效；idle 成员可更新下一步选择。`lastUsed` 来自原生最近 request/header，`nextSelection` 是待使用选择，不能把两者混为已发生的 API 请求。

## 原生运行语义

rc.3 使用原生子代理树而不是历史独立 teammate roster。本插件按根 SessionId 和成员 SessionId 隔离状态，支持 fresh/fork 和嵌套 continuable 成员，不通过名称共享覆盖。

初始子代理在 `subagent/start` 建立运行时归属后、排队输入前选择路由；首次 inbox claim 可按实际 prompt 再选择。任务使用 canonical `ownerId`，已完成任务保留的 owner 不会使其继续命中。相同任务集合的文本编辑不单独重选，下一新 turn 可以重评。

`agent/pre-step` 只验证／拒绝，不改写已捕获选择。工具／提示词组装、路由元数据和下游守卫期间发现过期选择时会阻止该次请求；已 claim 的输入**不会自动重放**，需检查错误后明确重发，避免重复副作用。守卫通过后宿主仍可能异步准备请求；此时模型选择已固定，之后的修改只影响后续 step。

## 状态和卸载

默认状态目录为 `$DSH_HOME/storages/team-router`；DSH_HOME 未设置时使用用户主目录下的 `.dsh/storages/team-router`。可通过静态 `stateDir` 指定独立目录，修改该字段需要按原生生命周期重载。

状态文件名使用 TeamId 的 SHA-256，内部核对原始 TeamId；成员覆盖以真实 SessionId 为键。文件 0600、临时文件原子替换，保存原模型基线、边界和有限决策，不保存提示词正文、任务正文或凭证。损坏／身份不匹配的状态报错并保留，不自动删除。一个团队的状态目录只允许一个 Host 写入；手动复用相同 SessionId 的独立 profile 必须配置不同 `stateDir`。

关闭 Team 模式或卸载插件时，只对**仍驻留且模型选择仍由本插件持有**的成员恢复基线，不覆盖其他操作者后续的选择。冷成员的历史 Session 无法因卸载自动改写；应先加载并恢复，或让团队完成后再移除插件。删除安装包不等于撤销所有历史持久化选择，状态目录也不会自动删除。

## 开发和验证

```sh
npm ci --ignore-scripts --cache .npm-cache
npm run check
npm pack --ignore-scripts --cache .npm-cache
```

构建使用 TypeScript 与 esbuild，客户端通过 DSH 模块加载器复用 Host React，不运行时导入 DSH Client 组件包，不启动第二个应用。控件使用原生主题 token，并提供中英文文案。

测试覆盖策略／存储、冻结配置引用和完整语义校验、编辑器草稿／CAS、真实临时 profile 的原子写入／冲突／重启恢复，以及真实 Cordis、AgentLoop、TeamService、JSONL 和 spawn/fork 后端。模型传输使用离线适配器，不消耗真实模型额度。

没有连接到已认证页面的浏览器控制时，验证仅包含代码、契约、构建和宿主测试，**不声称完成了真实 GUI 渲染、浅／深主题、浏览器控制台或截图验收**。不以 mock 页面或另起浏览器替代。首次启用后请检查设置页并实际保存一次你选择的策略。

不与另一套同成员模型覆盖插件同时启用；不提供价格／余额探测、自动降级重试、额外 LLM 分类或新团队运行时。模型切换可能改变能力、上下文容量和缓存命中；没有节费比例承诺。

MIT。
