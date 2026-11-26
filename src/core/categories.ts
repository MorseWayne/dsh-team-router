/** Stable application categories, inspired by OmO rather than its changing model presets. */
export const CATEGORY_IDS = Object.freeze([
  'visual-engineering', 'ultrabrain', 'deep', 'artistry', 'quick', 'unspecified', 'writing',
] as const);
export type CategoryId = typeof CATEGORY_IDS[number];
export type CategoryLocale = 'en' | 'zh';

export interface CategoryText {
  readonly name: string;
  readonly purpose: string;
  readonly avoid: string;
  readonly example: string;
}
export interface CategoryDefinition {
  readonly id: CategoryId;
  readonly zh: CategoryText;
  readonly en: CategoryText;
}

function category(id: CategoryId, zh: CategoryText, en: CategoryText): CategoryDefinition {
  return Object.freeze({ id, zh: Object.freeze(zh), en: Object.freeze(en) });
}

/** A fixed registry: no provider, model recommendation, identity mapping, or permissions. */
export const CATEGORIES: Readonly<Record<CategoryId, CategoryDefinition>> = Object.freeze({
  'visual-engineering': category('visual-engineering', {
    name: '视觉工程',
    purpose: '页面、组件、交互、样式、动画与可验证的视觉效果。',
    avoid: '不要把所有包含 JavaScript 的任务归入此类；以视觉交付物为准。',
    example: '重做登录页并验证交互与视觉效果。',
  }, {
    name: 'Visual engineering',
    purpose: 'Pages, components, interactions, styling, animation, and verifiable visual results.',
    avoid: 'Not every JavaScript task; choose this for the primary visual deliverable.',
    example: 'Rebuild the login page and verify its interactions and appearance.',
  }),
  ultrabrain: category('ultrabrain', {
    name: '深度推理',
    purpose: '困难逻辑、算法或架构问题的分析结论与决策依据。',
    avoid: '大量代码修改不等于深度推理；此类以分析和决策为主要产物。',
    example: '比较数据库迁移方案，给出推荐和依据。',
  }, {
    name: 'Deep reasoning',
    purpose: 'Analysis, conclusions, and decision evidence for difficult logic, algorithms, or architecture.',
    avoid: 'A large code change is not automatically deep reasoning; analysis is the main deliverable.',
    example: 'Compare database migration strategies and justify a recommendation.',
  }),
  deep: category('deep', {
    name: '自主执行',
    purpose: '完成明确目标，自主探索、实施并验证结果。',
    avoid: '不是只输出建议的分析任务，也不按工作量拆成低档或高档。',
    example: '按确定方案完成迁移代码与测试。',
  }, {
    name: 'Autonomous execution',
    purpose: 'Complete a defined goal through independent exploration, implementation, and verification.',
    avoid: 'Not advice-only analysis; do not split it into low/high tiers based on workload.',
    example: 'Implement and test the agreed migration plan.',
  }),
  artistry: category('artistry', {
    name: '创意探索',
    purpose: '探索多种新思路、非常规方案与创意方向。',
    avoid: '不是常规界面修改的默认类别。',
    example: '为新产品提出几种差异明显的交互概念并解释取舍。',
  }, {
    name: 'Creative exploration',
    purpose: 'Explore new ideas, unconventional solutions, and creative directions.',
    avoid: 'Not the default for routine interface changes.',
    example: 'Propose distinct interaction concepts for a new product and explain their tradeoffs.',
  }),
  quick: category('quick', {
    name: '快速任务',
    purpose: '做法明确、范围小、可快速验收的修改或信息提取。',
    avoid: '描述很短不代表任务简单；必须有明确范围与验收条件。',
    example: '将指定配置项改为已确定的值并检查结果。',
  }, {
    name: 'Quick task',
    purpose: 'Small, well-defined changes or extraction with a known approach and simple acceptance checks.',
    avoid: 'A short prompt is not necessarily a simple task; require clear scope and checks.',
    example: 'Set the specified configuration value and check the result.',
  }),
  unspecified: category('unspecified', {
    name: '通用任务',
    purpose: '不适合其他类别的任务，仅作为最后兜底。',
    avoid: '不要因尚未判断工作量就使用此类，也不要用它替代专门类别。',
    example: '不以视觉、写作、创意、困难分析或代码实施为主要产物的一般问答。',
  }, {
    name: 'General task',
    purpose: 'Tasks that do not fit any other category; use only as the final fallback.',
    avoid: 'Do not choose it merely because workload is unknown or to bypass a specialist category.',
    example: 'General assistance whose main deliverable does not fit the other categories.',
  }),
  writing: category('writing', {
    name: '文档写作',
    purpose: '技术文档、说明、文章及经过组织的文字内容。',
    avoid: '此类别不会授予联网或文件写入权限。',
    example: '把命令说明整理为操作手册。',
  }, {
    name: 'Writing',
    purpose: 'Technical documentation, explanations, articles, and organized prose.',
    avoid: 'This category does not grant network or file-writing permissions.',
    example: 'Organize command explanations into an operations manual.',
  }),
});

export const CATEGORY_LIST: readonly CategoryDefinition[] = Object.freeze(CATEGORY_IDS.map((id) => CATEGORIES[id]));

export function isCategoryId(value: unknown): value is CategoryId {
  return typeof value === 'string' && CATEGORY_IDS.some((id) => id === value);
}

/** Exact identifiers only; retired design identifiers are errors, never silent aliases. */
export function getCategory(value: unknown): CategoryDefinition {
  if (isCategoryId(value)) return CATEGORIES[value];
  if (value === 'deep-low' || value === 'deep-high') {
    throw new TypeError(`category: retired identifier "${value}"; use "deep" explicitly`);
  }
  if (value === 'unspecified-low' || value === 'unspecified-high') {
    throw new TypeError(`category: retired identifier "${value}"; use "unspecified" explicitly`);
  }
  throw new TypeError(`category: expected one of ${CATEGORY_IDS.join(', ')}`);
}

/** Lead-facing selection guidance, not a keyword classifier or a permissions instruction. */
export function categorySelectionGuidance(locale: CategoryLocale = 'en'): string {
  if (locale !== 'en' && locale !== 'zh') throw new TypeError('locale: expected en or zh');
  const rules = locale === 'zh'
    ? [
      '根据主要交付物选择类别，不按任务中的关键词分类。',
      '先看主要交付物：视觉效果 → visual-engineering；文字内容 → writing；创意方向 → artistry；困难分析与决策 → ultrabrain。',
      '不符合专门类别时，再看执行方式：明确、范围小、验收简单 → quick；需要自主探索、实施和验证 → deep。',
      '只有确实不适合其他类别时才使用 unspecified，不因工作量未知而使用兜底。',
      '混合任务按主要交付物分类；仅在子任务可独立交付时拆分，不强制把页面开发拆成视觉和编码两次委派。',
      '调研、审查按实际交付物选择，不新增角色类别；每次委派包含目标、范围、约束和验收标准。',
      '每类一个执行目标，不增加低/中/高复杂度维度，不因工作量自动改变模型或推理配置。',
      '任务超出预期时报告依据、已完成工作与副作用；不得为换模型伪装类别，不自动升级或重跑。',
      '类别不授予权限，不覆盖用户指令或宿主的安全、审批与执行限制。',
    ]
    : [
      'Choose by the primary deliverable, not keywords in the task.',
      'First identify the deliverable: visual results → visual-engineering; prose → writing; creative directions → artistry; difficult analysis and decisions → ultrabrain.',
      'Otherwise consider execution: a known approach, small scope and simple checks → quick; independent exploration, implementation and verification → deep.',
      'Use unspecified only when no other category fits, not because workload is unknown.',
      'Classify mixed tasks by their main deliverable; split only independently deliverable work, not every page into separate visual and coding runs.',
      'Classify research and review by their deliverable, not an agent role; include the goal, scope, constraints and acceptance criteria.',
      'Each category has one execution target, not low/medium/high tiers; workload never automatically changes model or reasoning settings.',
      'If difficulty exceeds expectations, report evidence, completed work and side effects; never disguise the category to switch models or automatically escalate/replay.',
      'Categories grant no permissions and do not override user instructions or Host safety, approval and execution limits.',
    ];
  return [
    ...rules,
    '',
    ...CATEGORY_LIST.map((entry) => {
      const text = entry[locale];
      return `${entry.id} — ${text.name}: ${text.purpose} ${text.avoid} ${locale === 'zh' ? '示例' : 'Example'}: ${text.example}`;
    }),
  ].join('\n');
}
