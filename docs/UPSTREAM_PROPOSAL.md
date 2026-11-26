# 上游提案：为「按任务类别选模型」提供正式扩展点

状态：草案，准备提交给 DSH（`@deepseek-ai/dsh-subagent` / `dsh-tool-subagent` / Cordis 配置层）维护者。
参考实现：`dsh-team-router`（本仓库），支持 DSH `0.2.2-rc.3`～`rc.5`。

## 背景

`dsh-team-router` 让 Team Lead 委派时按任务类别（`writing`、`ultrabrain`、`quick` 等七类）选择子智能体的模型。它完全复用原生 spawn、生命周期、深度限制与模型授权，没有自建编排。

但当前宿主没有给这类插件留正式接口，插件只能：

1. **复制宿主内部语义**：自行折叠 `subagent/model-selection-policy` 会话事件，判断某个模型是否已对本 Session 授权，逻辑必须与 `dsh-tool-subagent` 的 `model-selection-state.ts` 保持一致。
2. **注册一个专用委派工具**（`team_route_delegate`）：普通 spawn 无法感知类别，路由只有在 Lead 主动调用这个工具时才生效。
3. **挂 Cordis 内部钩子 `internal/config`**：用于保存前校验策略、备份旧配置。
4. **对启动失败做保守处理**：rc.3 的 `startActivation` 可能在已接纳之后才 reject，插件无法区分「未启动」和「已启动但发布失败」。

结果是插件只能把 `engines.dsh` 锁死在具体的 rc 版本上，每个宿主版本都要重新验证。下面四项改动按收益从大到小排列，每项都很小，且对不使用它们的插件没有影响。

## §1 导出只读的模型授权查询（解决 T6）

**现状**：授权状态只存在于 `dsh-tool-subagent` 内部；插件需复制同样的事件折叠逻辑。

**提议**：在 `SubagentRuntime`（或 `dsh-tool-subagent` 导出的服务）上提供：

```ts
interface SubagentModelAuthorization {
  /** null = 本 Session 无授权记录（仅允许父模型）。返回值为不可变快照。 */
  allowedRoutes(session: Session): readonly { provider: string; model: string }[] | null;
  /** 与原生 spawn 工具完全相同的判定。 */
  isAuthorized(session: Session, parent: AgentOptions, route: { provider: string; model: string }): boolean;
}
```

**收益**：插件删除 `authorization.ts`；授权语义只有宿主一份，演进时不会悄悄分叉。客户端设置页也可以只读查询，不必写入宿主的授权表单。

## §2 子智能体创建时的模型解析钩子（解决 T2、T9，收益最大）

**现状**：`SubagentProvider.agentRouteDefaults` 只支持 provider 级别的静态路由；无法按单次请求决定模型。

**提议**：增加一个按请求解析的瀑布式钩子，在原生工具合并 overrides 之后、预检和授权检查**之前**执行：

```ts
interface SubagentRouteHint { category?: string }   // 由原生 spawn 工具的可选参数透传

interface Events {
  'subagent/resolve-route'(input: {
    parent: Agent;
    provider: string;                 // 'spawn' | 'fork' | ...
    hint: SubagentRouteHint;
    current: Pick<AgentOptions, 'provider' | 'model' | 'reasoningEffort'>;
  }): Pick<AgentOptions, 'provider' | 'model' | 'reasoningEffort'> | undefined;
}
```

约束：

- 钩子的输出**仍需经过宿主的授权检查和预检**，插件不能借此绕过授权。
- 原生 spawn 工具增加可选参数 `category`，可选值由已注册的插件提供；没有插件时不显示该参数。
- 钩子只作用于**新建**的子智能体，不改写已存在的成员。

**收益**：

- 插件不再需要专用委派工具，普通委派也能按类别路由，「Lead 不调用专用工具就不生效」的问题消失。
- 插件不再自己调用 `startActivation`，T3 的启动失败语义也就不再是插件的问题。

## §3 公开的插件配置保存前校验（解决 T8）

**现状**：插件监听 `internal/config` 并读取 `fiber.effectiveConfig`，以便在保存前完整校验，并在迁移前备份旧配置。

**提议**：在 ConfigEditor/Cordis 层提供公开钩子，例如：

```ts
'config/before-commit'(input: { plugin: string; previous: unknown; next: unknown }): void | Promise<void>; // 抛错即拒绝保存
```

## §4 启动结果可区分（解决 T3）

**现状**：`startActivation` 失败时，调用方无法区分「未接纳、无副作用」和「已接纳但发布或清理失败」。

**提议**：在 reject 的错误上附带 `admitted: boolean`（或 `childId?`），供调用方判断是否需要检查已存在的子智能体。

## §5 插件 API 的版本承诺

如果以上接口能作为公开 API 维护，并遵循 semver，插件就可以把 `engines.dsh` 从「逐个 rc 枚举」放宽为 `>=0.3.0 <0.4.0` 这类范围，宿主小版本升级不再让插件失效。

## 采纳后插件侧的改动

| 上游落地 | 插件改动 |
|---|---|
| §1 | 删除 `src/adapter/dsh/authorization.ts`，改为调用授权查询 |
| §2 | 删除 `team_route_delegate`/`team_route_cancel`，改为注册 `subagent/resolve-route`；运行时代码预计减少一半以上 |
| §3 | `config.ts` 改用公开钩子 |
| §4 | 去掉 `unknown` 兜底分支中的保守猜测 |
| §5 | 放宽 `engines.dsh` 与 peerDependencies |

各触点的位置与当前稳定度见 [ARCHITECTURE.md](<ARCHITECTURE.md>)。

## 提交方式建议

先就 §1 和 §2 开一个 issue，附上本仓库作为实际用例；如果维护者认可方向，再提交一个只包含 §1 的小 PR（改动最小、零行为变化），以便建立信任后推进 §2。
