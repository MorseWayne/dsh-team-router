# 1.0.0 实现与验证状态

- 更新日期：2026-11-27
- 目标版本：**1.0.0**（增强版路径 B，破坏性升级，不兼容旧版 V1/V2 配置）
- 声明兼容宿主：DSH **`0.2.2-rc.3`、`0.2.2-rc.4`、`0.2.2-rc.5`**（Node.js 24+）

## 已落地改造范围

- **清理历史包袱**：已移除旧 V1 策略与迁移模块（`policy.ts`、`migration.ts`、`store.ts`、`editor.ts` 及旧专属测试）、已退役的 `team_route_set`/`team_route_reset` 工具、以及设置页中的迁移横幅与外部执行器占位。
- **核心层（`src/core/`）**：
  - [categories.ts](<../src/core/categories.ts>)：12 个内置类别、4 个工作分组、精简 7 类集合、4 张本地自定义场景模板卡及 slug 生成器。
  - [routing-policy.ts](<../src/core/routing-policy.ts>)：单一原子 V3 `RoutingConfig` 严格解析、单行与控制字符过滤、规范化与稳定指纹。
  - [active-registry.ts](<../src/core/active-registry.ts>)：浏览器安全的单一活跃类别解析器与活跃授权并集 `requiredGrantPairs`。
  - [native-subagent.ts](<../src/core/native-subagent.ts>)：按完整三元组合并的系统提示与首步近场提醒、自定义元数据 JSON 安全隔离、严格校验四行真值表。
  - [recommendations.ts](<../src/core/recommendations.ts>)：12 内置类精确目录候选、全量/按组预览、跳过停用类与自定义类。
  - [delegation.ts](<../src/core/delegation.ts>) & [execution-store.ts](<../src/core/execution-store.ts>)：带一行交付证据要求的委派提示、与当前注册表解耦的 `executions/<team-hash>.json`（`format: 1`）历史存储。
- **宿主适配层（`src/adapter/dsh/`）**：
  - [config.ts](<../src/adapter/dsh/config.ts>) & [runtime.ts](<../src/adapter/dsh/runtime.ts>)：单字段 `routing` 配置校验、动态 `team_route_delegate` 活跃类别校验与预检后复核、`team_route_status` 实时活跃类别视图。
- **设置页 UI（`src/ui/`）**：
  - [client.tsx](<../src/ui/client.tsx>)、[CategoryGroup.tsx](<../src/ui/CategoryGroup.tsx>)、[CustomCategoryEditor.tsx](<../src/ui/CustomCategoryEditor.tsx>)、[RouteRow.tsx](<../src/ui/RouteRow.tsx>)、[routing-editor.ts](<../src/ui/routing-editor.ts>)、[model-grants.ts](<../src/ui/model-grants.ts>)：4 分组默认折叠、全部 12 / 精简 7 快捷开关、逐类停用与休眠绑定提示、自定义类别 CRUD 与 4 张模板卡、按活跃并集自动同步授权。

## 已通过验证

```text
npm run check
  TypeScript (tsc --noEmit): PASS
  tests: 105 PASS / 0 FAIL / 0 SKIP（含 3 项源码分层校验）
  build (tsc + esbuild client): PASS

test-host-compat.mjs（同一份 1.0.0 tarball，离线仅替代 LLM 传输）
  DSH 0.2.2-rc.3: 102 PASS / 0 FAIL
  DSH 0.2.2-rc.4: 102 PASS / 0 FAIL
  DSH 0.2.2-rc.5: 102 PASS / 0 FAIL

git diff --check: PASS
```

- 浏览器实际渲染与交互验收：需在目标 DSH Web 实例安装新包并刷新页面后人工核对（打包脚本仅验证客户端模块加载与双插槽注册，不替代真实浏览器视觉与交互验收）。
