# dsh-team-router

给 DSH 原生队友按任务类别选模型。`dsh-team-router@0.3.3` 的同一个安装包支持 DSH **`0.2.2-rc.3`、`0.2.2-rc.4`、`0.2.2-rc.5`**，需要 Node.js 24+。更新的宿主版本通过兼容测试后再加入，不需要开启版本豁免。当前仅支持原生队友，Codex、agy、Cursor 外部 Agent 执行尚未开放。

## 安装

**DSH Web（推荐）：** 打开 **插件 → 添加插件**，输入 `dsh-team-router@0.3.3`，安装并启用。刷新页面；如果提示需要重启，请先重启 DSH。

**命令行：** 在运行 DSH 的机器上执行（以下以 `web` profile 为例；使用其他 profile 时请替换 `web`）：

```bash
dsh plugin --profile web add dsh-team-router@0.3.3
```

**验证安装：** 打开同一 profile 的 **插件 → 团队任务路由**，确认插件已启用。说明下方出现包含七个任务类别的配置表，即安装成功。

## 原生分工与分类路由

**是否分工，由主助手（Lead）决定；插件只负责分类委派时的模型选择。** 以「帮我写一份发布说明」为例：

```text
Lead 判断是否分工
├─ 自己写   → 直接回复
├─ 原生委派 → 按 DSH 原生规则选模型             ┐
└─ 分类委派 → 选择 writing → 按配置和授权选模型 ┴→ 队友执行 → Lead 验收
```

日常直接说需求即可，不必手写工具参数。保存策略**不会自动拆任务或接管普通委派**；只有 Lead 使用 `team_route_delegate` 时才会套用类别配置。停用插件仍可使用原生团队；关闭主会话的团队协作开关，则该会话也不再提供分类委派。两者都不会取消已启动的任务。

## 快速开始

1. 打开 **插件 → 团队任务路由** 或 **设置 → 团队任务路由**。表格首行是默认目标，其余七行可分别指定模型和推理强度，未指定则继承默认目标。手动修改或应用推荐配置后，点 **保存策略**。两处共用已保存的策略，不共享草稿。
2. 在主会话的 **模型与推理等级** 菜单开启 **启用智能体团队协作**。想验证配置时，可以说：「请按 `writing` 类别委派一份发布说明，再用 `team_route_status` 查看本次配置目标。」

保存只影响**之后新建的分类委派**。目录中可见的模型不一定获当前会话授权；未记录子代理模型白名单时，只能显式选择当前父模型。

## 七个内置类别

下表是**手动选模建议**，不是插件「预览推荐配置」的实际顺序。每行按任务适配度列出三家模型厂商的候选；同一个接入渠道也可以提供不同厂商的模型。

| 类别 | 适合的任务 | ① 首选 | ② 次选 | ③ 第三选择 |
|---|---|---|---|---|
| `visual-engineering` | 前端界面、交互和布局 | `gemini-4-argon` | `claude-opus-5-5` | `gpt-6.2-sol` |
| `ultrabrain` | 高难推理、算法和架构决策 | `gpt-6.2-astra` | `claude-opus-5-5` | `deepseek-reasoner` |
| `deep` | 需要持续探索、实现和验证的任务 | `claude-sonnet-5-5` | `gpt-6.2-sol` | `gemini-2.5-pro` |
| `artistry` | 创意构思和发散设计 | `claude-opus-5-5` | `gemini-4-argon` | `gpt-6.2-sol` |
| `quick` | 范围明确的小改动和查询 | `gpt-5.4-mini` | `gemini-3.8-flash` | `deepseek-chat` |
| `unspecified` | 不适合其他类别的通用任务 | `claude-sonnet-5-5` | `gpt-6.2-sol` | `deepseek-chat` |
| `writing` | 文档、说明和报告 | `claude-sonnet-5-5` | `gpt-6.2-sol` | `deepseek-chat` |

**GPT 怎么选：** 参考 [OpenAI 对 GPT‑6.2 Astra 和 Sol 的定位](https://openai.com/index/introducing-gpt-6-2-astra-sol/)，高难推理优先 Astra，日常多步执行和写作优先 Sol。`quick` 保留 `gpt-5.4-mini`：短任务更看重响应延迟，目前没有同条件对比证明 6.2 在这项上更快。

**如何应用：** 如果你的 DSH 模型目录列出了 6.2，可在对应类别手动选择并保存；没有则保留原模型。已发布的 `0.3.3` 仍按[该版本的内置候选列表](https://github.com/MorseWayne/dsh-team-router/blob/v0.3.3/src/recommendations.ts#L24-L50)生成预览，不会自动选用 6.2，也不会在任务失败时自动换模型。

## 从旧版升级

如果已有旧路由，请在设置页确认迁移并保存后再委派。插件会先备份旧策略，只映射旧默认路由；关键词规则、角色映射和成员手动覆盖不再参与选模。

## 开发与参考

运行 `npm ci --ignore-scripts` 安装依赖，`npm run check` 执行类型检查、测试和构建，`npm pack --ignore-scripts` 生成安装包。

[V2 配置示例](<examples/router.patch.yml>) · [实施方案](<docs/IMPLEMENTATION_PLAN.md>) · [验证记录与外部执行器限制](<docs/IMPLEMENTATION_STATUS.md>) · [MIT 许可证](<LICENSE>)

## 维护者发布

[GitHub Actions](<.github/workflows/publish.yml>) 在面向 `main` 的 PR 和 `main` 推送上检查，不发布。CI 只构建一次，在 `engines.dsh` 列出的每个宿主版本上独立安装并验证同一个包；任一项失败即不发布。推送与包清单、锁文件一致的 `vX.Y.Z` 稳定版标签，且提交已在 `main` 时，CI 才把验证过的安装包发布到 npm `latest`。

首次需由包维护者在 [npm 包设置](https://www.npmjs.com/package/dsh-team-router/access) 添加 GitHub Actions Trusted Publisher：仓库 `MorseWayne/dsh-team-router`、工作流 `publish.yml`、Environment 留空，允许 **Publish**。不需要 `NPM_TOKEN`。之后在干净、已同步的 `main` 上运行 `npm version patch`（或 `minor` / `major`），再运行 `git push --atomic origin main "$(git describe --tags --exact-match HEAD)"`，即可触发发布。
