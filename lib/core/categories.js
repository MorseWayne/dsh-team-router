export const BUILTIN_GROUPS = Object.freeze({
    implementation: Object.freeze({ id: 'implementation', zh: '产品与工程实现', en: 'Product & engineering' }),
    quality: Object.freeze({ id: 'quality', zh: '质量与交付', en: 'Quality & delivery' }),
    analysis: Object.freeze({ id: 'analysis', zh: '分析与表达', en: 'Analysis & expression' }),
    general: Object.freeze({ id: 'general', zh: '通用与兜底', en: 'General & fallback' }),
});
export const BUILTIN_IDS = Object.freeze([
    'visual-engineering', 'frontend-engineering', 'backend-data', 'deep',
    'debugging', 'code-review', 'verification-automation',
    'ultrabrain', 'artistry', 'writing', 'quick', 'unspecified',
]);
function localized([name, purpose, shortPurpose, avoid, example, deliverableCheck]) {
    return Object.freeze({ name, purpose, shortPurpose, avoid, example, deliverableCheck });
}
function category(id, group, proactive, classic7, zh, en) {
    return Object.freeze({ id, group, proactive, classic7, zh: localized(zh), en: localized(en) });
}
export const BUILTINS = Object.freeze({
    'visual-engineering': category('visual-engineering', 'implementation', true, true, ['视觉与交互', '实现页面布局、视觉样式、动画与交互体验。', '可验证的视觉与交互', '若交付重点是前端状态或组件架构，选前端工程。', '重做登录页并验证交互与视觉效果。', '提供截图或交互验证，说明环境和未验证状态。'], ['Visual & interaction', 'Implement page layout, visual styling, animation, and interaction.', 'Visual and interaction results', 'Choose frontend-engineering when state or component architecture is primary.', 'Rebuild the login page and verify its appearance and interactions.', 'Show screenshots or interaction checks, environment, and unverified states.']),
    'frontend-engineering': category('frontend-engineering', 'implementation', true, false, ['前端工程', '实现客户端组件、状态、数据流与应用集成。', '客户端组件与数据流', '若重点是外观或交互体验，选视觉与交互。', '将搜索筛选状态同步到路由并处理失败恢复。', '列出变更与受影响状态，验证客户端正常和失败路径。'], ['Frontend engineering', 'Implement client-side components, state, data flow, and app integration.', 'Client components and data flow', 'Use visual-engineering for appearance or interaction as the primary deliverable.', 'Synchronize search filters with the URL and handle failure recovery.', 'Show changed client states and success/failure path checks.']),
    'backend-data': category('backend-data', 'implementation', true, false, ['后端与数据', '实现服务、API、持久化、查询或数据管道。', '服务、API 与数据', '若交付重点是验收自动化而非服务或数据能力，选验证与交付自动化。', '为导入服务实现幂等写入。', '说明接口或数据不变量，验证正常、错误及兼容路径。'], ['Backend & data', 'Implement services, APIs, persistence, queries, and data pipelines.', 'Services, APIs, and data', 'Use verification-automation for delivery checks rather than service or data capabilities.', 'Implement idempotent writes in an import service.', 'Show interface or data invariants, success/failure and compatibility checks.']),
    deep: category('deep', 'implementation', true, true, ['综合工程实施', '探索、实现并验证目标明确的跨模块工程需求。', '跨模块实施与验证', '只需给出分析时选架构与困难推理；局部明确改动选定向小任务。', '完成约定的跨模块迁移及回归检查。', '列出完成范围与端到端验证，并交代未完成项和副作用。'], ['Integrated engineering', 'Explore, implement, and verify a defined goal across engineering boundaries.', 'Cross-module implementation', 'Use ultrabrain for analysis only or quick for a known small change.', 'Implement the agreed cross-module migration with regression checks.', 'Show completed scope, end-to-end checks, gaps, and side effects.']),
    debugging: category('debugging', 'quality', true, false, ['故障诊断', '复现故障、确认根因，并在请求允许时修复。', '复现与根因定位', '若目标是评估改动风险而非定位故障，选代码审查。', '定位偶发的重复写入并验证修复。', '给出复现与根因证据，以及最小修复或未验证项。'], ['Fault diagnosis', 'Reproduce a failure, establish its root cause, and fix it if requested.', 'Failure reproduction and cause', 'Use code-review if evaluating a change rather than diagnosing a failure.', 'Trace an intermittent duplicate write and verify the fix.', 'Show reproduction, root-cause evidence, and minimal fix or unverified areas.']),
    'code-review': category('code-review', 'quality', true, false, ['代码审查', '审查代码改动，优先报告行为、风险及回归问题。', '变更风险与回归审查', '不要未经请求实施修复；实现任务选相应工程类别。', '审查缓存变更是否可能造成跨用户数据错误。', '为每条发现提供文件位置、影响级别和证据；说明覆盖缺口。'], ['Code review', 'Review a code change for correctness, risk, and regressions.', 'Change risk and regressions', 'Do not implement unsolicited fixes; use an engineering category for changes.', 'Review a cache change for potential cross-user data mixups.', 'Give file locations, severity, evidence, and review gaps.']),
    'verification-automation': category('verification-automation', 'quality', true, false, ['验证与交付自动化', '构建测试、CI、构建、发布和可重复的验收流程。', '测试、CI 与发布流程', '定位某个已知故障时优先选故障诊断。', '为发布流程增加制品验证和冒烟测试。', '提供可重跑的检查命令、通过与失败证据及剩余缺口。'], ['Verification & delivery automation', 'Build tests, CI, build/release automation, and repeatable acceptance checks.', 'Tests, CI, and release', 'Use debugging when a specific failure is the primary problem.', 'Add artifact verification and smoke tests to the release workflow.', 'Show repeatable commands, pass/fail evidence, and coverage gaps.']),
    ultrabrain: category('ultrabrain', 'analysis', true, true, ['架构与困难推理', '分析困难的架构、逻辑或算法问题并论证决策。', '困难分析与决策依据', '大量代码修改不等于困难推理；以实施为主时选综合工程实施。', '比较数据库迁移策略并论证推荐方案。', '给出结论、替代方案、取舍以及支撑证据和不确定项。'], ['Architecture & reasoning', 'Analyze difficult architecture, logic, or algorithm questions and justify decisions.', 'Difficult analysis and decisions', 'Large code changes are not inherently analysis; use deep for implementation.', 'Compare database migration strategies and justify a recommendation.', 'Show conclusions, alternatives, tradeoffs, evidence, and uncertainty.']),
    artistry: category('artistry', 'analysis', true, true, ['创意探索', '探索多种新思路、非常规方案和创意方向。', '有差异的创意方向', '不是常规界面实现的默认类别。', '为新产品提出明显不同的交互概念。', '展示差异明显的方案、设计理由和验证方向。'], ['Creative exploration', 'Explore novel ideas, unconventional solutions, and creative directions.', 'Distinct creative directions', 'Do not use by default for routine interface implementation.', 'Propose distinct interaction concepts for a new product.', 'Show distinct options, rationale, and ways to validate them.']),
    writing: category('writing', 'analysis', true, true, ['技术写作', '撰写技术文档、说明、文章和结构化文字。', '文档与结构化文字', '当主要交付是技术决策而非成文时，选架构与困难推理。', '将命令说明整理为运维手册。', '交付面向读者的文稿，核对关键技术事实并注明未核实项。'], ['Technical writing', 'Produce technical documentation, explanations, articles, and organized prose.', 'Documentation and prose', 'Use ultrabrain when the primary result is a technical decision.', 'Organize command explanations into an operations manual.', 'Deliver audience-ready text; verify technical claims and flag unknowns.']),
    quick: category('quick', 'general', false, true, ['定向小任务', '完成做法明确、边界小、验收简单的改动或提取。', '明确且可快速验收', '描述短不代表任务简单，须明确范围和验收标准。', '更新指定配置值并检查生效。', '说明改动或提取结果及一项直接验收检查。'], ['Bounded quick task', 'Make a small change or extraction with a known approach and simple check.', 'Small, well-defined change', 'A short prompt is not necessarily a small task; require clear bounds.', 'Set the specified config value and confirm it takes effect.', 'Show the requested result and one direct check.']),
    unspecified: category('unspecified', 'general', false, true, ['通用兜底', '作为确实不适合其他类别的最后选择。', '其他类别均不适用', '不要因尚未判断范围或想换模型就选兜底。', '回答不属于其他类别的一般问题。', '说明结果、依据和已知限制。'], ['General fallback', 'Handle requests that genuinely do not fit any other category.', 'Last resort only', 'Do not use when scope is unknown or to bypass a matching category.', 'Answer a general question that fits no other category.', 'Show the result, supporting basis, and known limits.']),
});
export const BUILTIN_LIST = Object.freeze(BUILTIN_IDS.map(id => BUILTINS[id]));
export const CLASSIC7_IDS = Object.freeze(BUILTIN_IDS.filter(id => BUILTINS[id].classic7));
function template(templateId, zh, en) {
    const text = ([name, purpose, avoid, example, nearBuiltin]) => Object.freeze({ name, purpose, avoid, example, nearBuiltin });
    return Object.freeze({ templateId, suggestedId: `custom-${templateId}`, zh: text(zh), en: text(en) });
}
export const CUSTOM_CATEGORY_TEMPLATES = Object.freeze([
    template('evidence-check', ['证据核验', '核验指定版本 API 或文档，提供出处并注明不确定项。', '不用于只需整理手册的任务。', '核对指定版本事件参数的文档和源码定义。', '只整理手册时选 writing。'], ['Evidence verification', 'Verify specific-version APIs or docs with sources and remaining uncertainties.', 'Not for simply organizing a manual.', 'Check the documented event payload against the source for a given release.', 'Use writing to organize a manual.']),
    template('security-audit', ['防御性安全审计', '提供风险位置、受影响边界、证据和缓解建议。', '不用于常规代码修改。', '审查权限边界并给出防御性缓解建议。', '常规修改时选相应工程类。'], ['Defensive security audit', 'Report risk locations, affected boundaries, evidence, and mitigations.', 'Not for routine code changes.', 'Review a permission boundary and recommend defensive mitigations.', 'Use the relevant engineering category for routine changes.']),
    template('data-eval', ['数据与模型评测', '交付实验分析结论、置信边界或评测指标设计。', '不用于建库或实现流水线。', '设计评测指标并说明样本量与置信边界。', '建库或写流水线时选 backend-data 或 verification-automation。'], ['Data & model evaluation', 'Provide experiment conclusions, confidence bounds, or evaluation metrics design.', 'Not for building databases or implementing pipelines.', 'Design evaluation metrics with sample and confidence requirements.', 'Use backend-data or verification-automation for databases or pipelines.']),
    template('safe-migration', ['行为保持的重构迁移', '跨模块迁移，验收行为不变量、兼容窗口和回滚方案。', '不用于只审查 PR 的任务。', '迁移缓存实现，验证行为与渐进回滚方案。', '只审 PR 时选 code-review。'], ['Behavior-preserving migration', 'Migrate across modules with behavior invariants, a compatibility window, and rollback.', 'Not for reviewing a PR only.', 'Migrate a cache with behavior checks and a staged rollback plan.', 'Use code-review to review a PR only.']),
]);
export const MAX_CUSTOM_CATEGORIES = 8;
export const CUSTOM_ID_PATTERN = /^custom-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
export function isBuiltinId(value) {
    return typeof value === 'string' && Object.hasOwn(BUILTINS, value);
}
export function getBuiltinCategory(value) {
    if (!isBuiltinId(value))
        throw new TypeError(`category: expected one of ${BUILTIN_IDS.join(', ')}`);
    return BUILTINS[value];
}
export function generateCustomCategoryId(name, existingIds) {
    const taken = new Set(existingIds);
    const slug = name.replace(/[A-Z]/g, letter => letter.toLowerCase())
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const stem = /^[a-z]/.test(slug) ? slug : slug ? `cat-${slug}` : 'cat';
    for (let index = slug ? 0 : 1;; index++) {
        const suffix = index === 0 ? '' : `-${index}`;
        const prefix = stem.slice(0, 33 - suffix.length).replace(/-+$/, '');
        const id = `custom-${prefix}${suffix}`;
        if (!taken.has(id))
            return id;
    }
}
//# sourceMappingURL=categories.js.map