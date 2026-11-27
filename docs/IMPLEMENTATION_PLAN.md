# 1.0.0 实施方案（增强版路径 B）

- 项目：`dsh-team-router`
- 目标版本：`1.0.0`（破坏性重构，不兼容旧版 V1/V2 配置）
- 适配宿主：DSH `0.2.2-rc.3` / `0.2.2-rc.4` / `0.2.2-rc.5`，Node.js 24+
- 核心目标：解决旧 7 类体系中前后端混杂与 `deep` 过载问题，在保持分类低门槛与高准确率的前提下，提供**12 个可单独启停的内置类别 + 最多 8 个用户自定义类别（含 4 张常用场景模板卡）**。

## 1. 核心决策与不变量

1. **单一原子配置 `routing`（`version: 3`）**：将委派行为（`guidance`、`delegationMode`、`strict`）、默认兜底目标（`defaultTarget`）、内置类覆盖（`builtins`）、自定义类别（`custom`）和历史上限（`historyLimit`）收归同一份 CAS 边界。完全移除 V1 关键词/角色路由、迁移确认流程、`policyV2`、已退役工具 `team_route_set`/`team_route_reset` 以及外部执行器占位字段。
2. **12 内置类默认全启，但默认不委派**：初始全局目标为 `{ mode: 'inherit' }`、模式为 `passive`、严格校验关闭。开箱即可区分前后端与质量环节，却不额外申请模型授权，也不会擅自触发子代理。
3. **停用即真实运行时退出**：停用任意内置或自定义类别后，它立即退出系统提示、首步提醒、严格校验允许集、模型授权并集、推荐范围与团队委派；同时保留其休眠绑定，便于随时再启用。
4. **自定义类别安全边界**：最多 8 个（含停用项），ID 限定在 `custom-` 命名空间（8–40 位小写 ASCII，首次保存后锁定，显示名随时可改）；新建默认 `enabled: true, proactive: false, binding: { mode: 'default' }`。自定义文本严格限制单行与码点长度、拒绝控制与双向字符，并以确定性 JSON 字符串呈现给模型，声明仅作交付物说明，绝不越权或覆盖系统指令。
5. **借鉴而不照搬外部模板库**：参考 `awesome-codex-subagents` 对“何时使用”和“交付证据”的清晰表达，在“新增自定义类别”中提供 4 张本地场景模板卡（证据核验、防御性安全审计、数据与模型评测、行为保持的重构迁移），并在委派初始提示中附带一行简洁的验收证据要求；绝不引入上百个按语言/框架拆分的岗位清单、单家静态模型预设或沙箱/MCP 权限字段。
6. **混合任务默认一单**：分模型不等于机械拆单；小范围前后端改动交给最核心验收方端到端完成，只有接口明确且可独立验收时才拆单。

## 2. 类别与分组设计

### 内置 12 类（4 组）
- **产品与工程实现（`implementation`）**：`visual-engineering`（视觉与交互，精简7）、`frontend-engineering`（前端工程）、`backend-data`（后端与数据）、`deep`（综合工程实施，精简7）。
- **质量与交付（`quality`）**：`debugging`（故障诊断）、`code-review`（代码审查）、`verification-automation`（验证与交付自动化）。
- **分析与表达（`analysis`）**：`ultrabrain`（架构与困难推理，精简7）、`artistry`（创意探索，精简7）、`writing`（技术写作，精简7）。
- **通用与兜底（`general`，非主动候选）**：`quick`（定向小任务，精简7）、`unspecified`（通用兜底，精简7）。

设置页的「全部 12 类 / 精简 7 类」快捷按钮仅批量改写内置 `enabled` 开关，不清空已选绑定、不动自定义类别、不自动保存。

### 4 张自定义场景模板卡
- `custom-evidence-check`（证据核验）：核验指定版本 API/文档出处与不确定项。
- `custom-security-audit`（防御性安全审计）：输出风险位置、受影响边界、证据与缓解建议。
- `custom-data-eval`（数据与模型评测）：输出实验分析结论、置信边界或评测指标设计。
- `custom-safe-migration`（行为保持的重构迁移）：跨模块迁移，验收不变量、兼容窗口与回滚方案。

## 3. 模块划分与关键机制

| 模块 | 职责 |
|---|---|
| [categories.ts](<../src/core/categories.ts>) | 12 内置类、4 分组、精简 7 集合、4 张自定义模板卡、slug 生成器与校验常量 |
| [routing-policy.ts](<../src/core/routing-policy.ts>) | V3 `RoutingConfig` 严格解析、规范化（剔除无效果内置 override）与稳定指纹 |
| [active-registry.ts](<../src/core/active-registry.ts>) | 浏览器安全的单一活跃类别解析器、`requiredGrantPairs` 并集计算与精确查找 |
| [native-subagent.ts](<../src/core/native-subagent.ts>) | 会话授权投影、按完整 `(provider, model, effort?)` 三元组合并渲染系统提示与首步提醒、严格校验四行真值表 |
| [recommendations.ts](<../src/core/recommendations.ts>) | 12 内置类精确目录候选、按“全量/分组”预览、跳过停用项、绝不猜测自定义类别 |
| [delegation.ts](<../src/core/delegation.ts>) | 团队委派入参校验与带一行验收证据要求的子代理初始消息构造 |
| [execution-store.ts](<../src/core/execution-store.ts>) | 独立格式 `executions/<team-hash>.json`（`format: 1`），解耦静态类别枚举，删类后历史仍可读 |
| [config.ts](<../src/adapter/dsh/config.ts>) / [runtime.ts](<../src/adapter/dsh/runtime.ts>) | 单字段 `routing` 配置接线、动态 `team_route_delegate` 与 TOCTOU 复核、`team_route_status` 实时目录 |
| [client.tsx](<../src/ui/client.tsx>) / [routing-editor.ts](<../src/ui/routing-editor.ts>) / [CategoryGroup.tsx](<../src/ui/CategoryGroup.tsx>) / [CustomCategoryEditor.tsx](<../src/ui/CustomCategoryEditor.tsx>) | 4 组折叠视图、快捷启停切换、自定义类别 CRUD 与模板选择、按活跃并集同步模型授权 |

## 4. 验收门禁

1. **分层与静态检查**：`npm run typecheck` 通过，[layering.test.ts](<../test/layering.test.ts>) 无越层依赖，客户端 bundle 构建成功。
2. **全量自动化测试**：覆盖 V3 解析与安全边界、活跃注册表与授权并集、严格校验四行真值表、提示词同模合并与自定义文本防注入、历史删类可读、动态团队委派与 TOCTOU、UI 编辑器 CRUD 与 CAS 并发、真实 Cordis/AgentLoop 宿主集成测试。
3. **打包与多宿主兼容**：同一个 `npm pack --ignore-scripts` 产物通过 `scripts/test-host-compat.mjs` 对 `0.2.2-rc.3`、`0.2.2-rc.4`、`0.2.2-rc.5` 的安装、客户端插槽冒烟与全套测试验证。
