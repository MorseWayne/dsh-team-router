# 七分类路由实施进度

日期：2026-11-19。目标版本：**0.3.0**，适配 DSH **0.2.2-rc.3**。这是阶段性交付记录；完整外部 A2A 接入尚未完成，不能标记总目标完成。

## 已实现

- 七分类注册表、双语用途和边界、交付物优先的 Lead 指引。
- 严格 V2 策略结构、不可变的执行快照、默认原生继承；旧类别不做隐式别名。
- 设置页七卡片、实时模型／effort 选择、推荐差异预览、CAS 与失败草稿保留。
- 单字段 `policyV2` 原子保存；旧非空配置要求明确迁移，保存前创建旧有效策略备份。组合层不注入 V2 默认对象，避免掩盖旧用户配置。
- Lead 专用类别委派，在创建时传递模型，首请求即使用选定模型。普通 spawn/fork 与现有成员不被重写。
- 按真实 Session 授权事件检查模型白名单，无授权记录时只允许父模型；目录可见不代表授权。
- 原生元数据预检、配置变化／provider 变化复查、原生深度／容量／生命周期、取消与完成通知。
- V2 独立审计、原子写、4 MiB 上限、终态数量裁剪、热重载迟到回调合并、冷重启孤儿转 unknown。
- 旧成员覆盖工具只保留拒绝入口；关键词和角色映射不再参与运行。

主要实现：
[分类](<../src/categories.ts>)、[V2 策略](<../src/routing-policy.ts>)、[原生运行](<../src/index.ts>)、[授权](<../src/authorization.ts>)、[状态](<../src/execution-store.ts>)、[设置页](<../src/client.tsx>)。

## 已验证

```text
npm run check
  TypeScript: PASS
  tests: 177 PASS / 0 FAIL / 0 SKIP
  build: PASS

git diff --check: PASS
```

其中 **31 项原生集成测试**使用真实 Cordis、AgentLoop、Session、Teams、spawn/fork 与托管生命周期，仅 LLM 传输离线替代。

额外故障回归证明：

- 同模型显式选择省略 effort，不继承父模型的 high。
- 元数据检查期间修改策略，旧请求不得提交。
- 审计磁盘写失败不阻止用户取消。
- 启动返回失败可能发生在原生接纳之后，记录为 unknown，不能说“未启动／没有副作用”。
- 插件卸载／重挂载后，旧任务结果仍通过原生通知到达，不覆盖新执行记录。
- 原生 ConfigEditor 对 V2 保存、备份、CAS 冲突、组合层旧配置及重启恢复有效。

覆盖文件：[集成测试](<../test/integration.test.ts>)、[配置持久化](<../test/settings.test.ts>)、[运行核心](<../test/routing-runtime.test.ts>)。

## 外部 P0：证据与未关闭门禁

本机发现的命令不在当前 PATH，但存在于用户本地 bin 目录。已受控执行三家的 `--help`，没有启动推理、登录、修改账号或安装外部运行时。

| 目标 | 已核对事实 | 仍缺失 |
|---|---|---|
| Codex | 系统 standalone 0.170.0；官方 provider 的包依赖 0.153.4；订阅插件 3.2.25 的 provider 支持 model/effort，但要求专用 0.167.0 alias。三者不能混同。 | 专用 CLI 准备、细粒度权限根与网络策略、递归关闭、整树取消及真实模型回执实测。 |
| agy | CLI help 明确提供 `--model`、`--effort`、`--sandbox`、`--mode`、ACP。现有 agy-link 0.6.38 是 LLM adapter/工具，不是本插件已验证的 Agent 后端。 | 默认 skip 权限、自动重放、非 DSH subprocess 生命周期不能直接复用；需要新的安全接入验证。 |
| Cursor | CLI help 提供 `--model`、`--sandbox enabled`、`--mode plan/ask`。 | 无已验证的 DSH 托管 provider；取消、权限及递归限制未测。 |

当前代码对三个外部 executor **一律拒绝，设置页不可选择**。结构解析支持它们不代表已经实现调用。没有为达成演示使用 `--force`、自动批准 MCP、危险跳过权限或切换全局 backend。

原生目标中的 `openai-codex` / `antigravity` 是既有 **LLM adapter 命名空间**，与外部 `codex` / `agy` 执行器不同。推荐清单使用已核对的精确 ID，再与 Host 目录匹配；目录可能由 adapter 缓存或 fallback 提供，仍不能据此保证认证、额度或权限。

## 部署与 GUI

本地构建已完成。当前 Host 插件清单已读取；本次新版本的安装与页面刷新后验证尚未完成。没有启动替代 Web 服务器。没有已认证浏览器控制，尚不能声称真实页面渲染、主题和截图验收通过。

## 后续验收

1. 通过原生插件管理器把构建包安装到现有 Host，按返回结果处理是否需要重启。
2. 刷新原 GUI，验证七卡片、迁移提示、推荐差异与实际保存。
3. 为外部后端补足受控 provider、专用 runtime 与权限／递归／取消测试后，逐个解除门禁。
4. 做三执行器真实 end-to-end 验证，再决定是否满足[完整实施方案](<IMPLEMENTATION_PLAN.md>)。
