window.__ModuleLoader__.load({id:"dsh-team-router",factory(require){var module={exports:{}};var exports=module.exports;
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target2, all) => {
  for (var name in all)
    __defProp(target2, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target2) => (target2 = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target2, "default", { value: mod, enumerable: true }) : target2,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/ui/client.tsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);
var React5 = __toESM(require("react"), 1);

// src/core/categories.ts
var CATEGORY_IDS = Object.freeze([
  "visual-engineering",
  "ultrabrain",
  "deep",
  "artistry",
  "quick",
  "unspecified",
  "writing"
]);
function category(id, zh3, en3) {
  return Object.freeze({ id, zh: Object.freeze(zh3), en: Object.freeze(en3) });
}
var CATEGORIES = Object.freeze({
  "visual-engineering": category("visual-engineering", {
    name: "\u89C6\u89C9\u5DE5\u7A0B",
    purpose: "\u9875\u9762\u3001\u7EC4\u4EF6\u3001\u4EA4\u4E92\u3001\u6837\u5F0F\u3001\u52A8\u753B\u4E0E\u53EF\u9A8C\u8BC1\u7684\u89C6\u89C9\u6548\u679C\u3002",
    avoid: "\u4E0D\u8981\u628A\u6240\u6709\u5305\u542B JavaScript \u7684\u4EFB\u52A1\u5F52\u5165\u6B64\u7C7B\uFF1B\u4EE5\u89C6\u89C9\u4EA4\u4ED8\u7269\u4E3A\u51C6\u3002",
    example: "\u91CD\u505A\u767B\u5F55\u9875\u5E76\u9A8C\u8BC1\u4EA4\u4E92\u4E0E\u89C6\u89C9\u6548\u679C\u3002"
  }, {
    name: "Visual engineering",
    purpose: "Pages, components, interactions, styling, animation, and verifiable visual results.",
    avoid: "Not every JavaScript task; choose this for the primary visual deliverable.",
    example: "Rebuild the login page and verify its interactions and appearance."
  }),
  ultrabrain: category("ultrabrain", {
    name: "\u6DF1\u5EA6\u63A8\u7406",
    purpose: "\u56F0\u96BE\u903B\u8F91\u3001\u7B97\u6CD5\u6216\u67B6\u6784\u95EE\u9898\u7684\u5206\u6790\u7ED3\u8BBA\u4E0E\u51B3\u7B56\u4F9D\u636E\u3002",
    avoid: "\u5927\u91CF\u4EE3\u7801\u4FEE\u6539\u4E0D\u7B49\u4E8E\u6DF1\u5EA6\u63A8\u7406\uFF1B\u6B64\u7C7B\u4EE5\u5206\u6790\u548C\u51B3\u7B56\u4E3A\u4E3B\u8981\u4EA7\u7269\u3002",
    example: "\u6BD4\u8F83\u6570\u636E\u5E93\u8FC1\u79FB\u65B9\u6848\uFF0C\u7ED9\u51FA\u63A8\u8350\u548C\u4F9D\u636E\u3002"
  }, {
    name: "Deep reasoning",
    purpose: "Analysis, conclusions, and decision evidence for difficult logic, algorithms, or architecture.",
    avoid: "A large code change is not automatically deep reasoning; analysis is the main deliverable.",
    example: "Compare database migration strategies and justify a recommendation."
  }),
  deep: category("deep", {
    name: "\u81EA\u4E3B\u6267\u884C",
    purpose: "\u5B8C\u6210\u660E\u786E\u76EE\u6807\uFF0C\u81EA\u4E3B\u63A2\u7D22\u3001\u5B9E\u65BD\u5E76\u9A8C\u8BC1\u7ED3\u679C\u3002",
    avoid: "\u4E0D\u662F\u53EA\u8F93\u51FA\u5EFA\u8BAE\u7684\u5206\u6790\u4EFB\u52A1\uFF0C\u4E5F\u4E0D\u6309\u5DE5\u4F5C\u91CF\u62C6\u6210\u4F4E\u6863\u6216\u9AD8\u6863\u3002",
    example: "\u6309\u786E\u5B9A\u65B9\u6848\u5B8C\u6210\u8FC1\u79FB\u4EE3\u7801\u4E0E\u6D4B\u8BD5\u3002"
  }, {
    name: "Autonomous execution",
    purpose: "Complete a defined goal through independent exploration, implementation, and verification.",
    avoid: "Not advice-only analysis; do not split it into low/high tiers based on workload.",
    example: "Implement and test the agreed migration plan."
  }),
  artistry: category("artistry", {
    name: "\u521B\u610F\u63A2\u7D22",
    purpose: "\u63A2\u7D22\u591A\u79CD\u65B0\u601D\u8DEF\u3001\u975E\u5E38\u89C4\u65B9\u6848\u4E0E\u521B\u610F\u65B9\u5411\u3002",
    avoid: "\u4E0D\u662F\u5E38\u89C4\u754C\u9762\u4FEE\u6539\u7684\u9ED8\u8BA4\u7C7B\u522B\u3002",
    example: "\u4E3A\u65B0\u4EA7\u54C1\u63D0\u51FA\u51E0\u79CD\u5DEE\u5F02\u660E\u663E\u7684\u4EA4\u4E92\u6982\u5FF5\u5E76\u89E3\u91CA\u53D6\u820D\u3002"
  }, {
    name: "Creative exploration",
    purpose: "Explore new ideas, unconventional solutions, and creative directions.",
    avoid: "Not the default for routine interface changes.",
    example: "Propose distinct interaction concepts for a new product and explain their tradeoffs."
  }),
  quick: category("quick", {
    name: "\u5FEB\u901F\u4EFB\u52A1",
    purpose: "\u505A\u6CD5\u660E\u786E\u3001\u8303\u56F4\u5C0F\u3001\u53EF\u5FEB\u901F\u9A8C\u6536\u7684\u4FEE\u6539\u6216\u4FE1\u606F\u63D0\u53D6\u3002",
    avoid: "\u63CF\u8FF0\u5F88\u77ED\u4E0D\u4EE3\u8868\u4EFB\u52A1\u7B80\u5355\uFF1B\u5FC5\u987B\u6709\u660E\u786E\u8303\u56F4\u4E0E\u9A8C\u6536\u6761\u4EF6\u3002",
    example: "\u5C06\u6307\u5B9A\u914D\u7F6E\u9879\u6539\u4E3A\u5DF2\u786E\u5B9A\u7684\u503C\u5E76\u68C0\u67E5\u7ED3\u679C\u3002"
  }, {
    name: "Quick task",
    purpose: "Small, well-defined changes or extraction with a known approach and simple acceptance checks.",
    avoid: "A short prompt is not necessarily a simple task; require clear scope and checks.",
    example: "Set the specified configuration value and check the result."
  }),
  unspecified: category("unspecified", {
    name: "\u901A\u7528\u4EFB\u52A1",
    purpose: "\u4E0D\u9002\u5408\u5176\u4ED6\u7C7B\u522B\u7684\u4EFB\u52A1\uFF0C\u4EC5\u4F5C\u4E3A\u6700\u540E\u515C\u5E95\u3002",
    avoid: "\u4E0D\u8981\u56E0\u5C1A\u672A\u5224\u65AD\u5DE5\u4F5C\u91CF\u5C31\u4F7F\u7528\u6B64\u7C7B\uFF0C\u4E5F\u4E0D\u8981\u7528\u5B83\u66FF\u4EE3\u4E13\u95E8\u7C7B\u522B\u3002",
    example: "\u4E0D\u4EE5\u89C6\u89C9\u3001\u5199\u4F5C\u3001\u521B\u610F\u3001\u56F0\u96BE\u5206\u6790\u6216\u4EE3\u7801\u5B9E\u65BD\u4E3A\u4E3B\u8981\u4EA7\u7269\u7684\u4E00\u822C\u95EE\u7B54\u3002"
  }, {
    name: "General task",
    purpose: "Tasks that do not fit any other category; use only as the final fallback.",
    avoid: "Do not choose it merely because workload is unknown or to bypass a specialist category.",
    example: "General assistance whose main deliverable does not fit the other categories."
  }),
  writing: category("writing", {
    name: "\u6587\u6863\u5199\u4F5C",
    purpose: "\u6280\u672F\u6587\u6863\u3001\u8BF4\u660E\u3001\u6587\u7AE0\u53CA\u7ECF\u8FC7\u7EC4\u7EC7\u7684\u6587\u5B57\u5185\u5BB9\u3002",
    avoid: "\u6B64\u7C7B\u522B\u4E0D\u4F1A\u6388\u4E88\u8054\u7F51\u6216\u6587\u4EF6\u5199\u5165\u6743\u9650\u3002",
    example: "\u628A\u547D\u4EE4\u8BF4\u660E\u6574\u7406\u4E3A\u64CD\u4F5C\u624B\u518C\u3002"
  }, {
    name: "Writing",
    purpose: "Technical documentation, explanations, articles, and organized prose.",
    avoid: "This category does not grant network or file-writing permissions.",
    example: "Organize command explanations into an operations manual."
  })
});
var CATEGORY_LIST = Object.freeze(CATEGORY_IDS.map((id) => CATEGORIES[id]));
function isCategoryId(value) {
  return typeof value === "string" && CATEGORY_IDS.some((id) => id === value);
}
function getCategory(value) {
  if (isCategoryId(value)) return CATEGORIES[value];
  if (value === "deep-low" || value === "deep-high") {
    throw new TypeError(`category: retired identifier "${value}"; use "deep" explicitly`);
  }
  if (value === "unspecified-low" || value === "unspecified-high") {
    throw new TypeError(`category: retired identifier "${value}"; use "unspecified" explicitly`);
  }
  throw new TypeError(`category: expected one of ${CATEGORY_IDS.join(", ")}`);
}

// src/core/routing-policy.ts
var POLICY_FIELDS = ["version", "defaultTarget", "categories", "historyLimit"];
var UNSAFE_KEYS = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]);
function fail(path, message) {
  throw new TypeError(`${path}: ${message}`);
}
function record(value, path) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(path, "must be a plain object");
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype) fail(path, "must be a plain object");
  const result = /* @__PURE__ */ Object.create(null);
  for (const key2 of Reflect.ownKeys(value)) {
    if (typeof key2 !== "string") fail(path, "symbol fields are not allowed");
    if (UNSAFE_KEYS.has(key2)) fail(path, `unsafe key ${JSON.stringify(key2)}`);
    const descriptor = Object.getOwnPropertyDescriptor(value, key2);
    if (descriptor === void 0 || !Object.hasOwn(descriptor, "value")) {
      fail(`${path}.${key2}`, "must be a data property");
    }
    result[key2] = descriptor.value;
  }
  return result;
}
function exactFields(value, allowed, path) {
  for (const key2 of Object.keys(value)) {
    if (!allowed.includes(key2)) fail(`${path}.${key2}`, "unknown field");
  }
}
function text(value, path) {
  if (typeof value !== "string") fail(path, "must be a string");
  const result = value.trim();
  if (result.length === 0) fail(path, "must not be empty");
  return result;
}
function integer(value, minimum, maximum, path) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < minimum || value > maximum) {
    fail(path, `must be a safe integer from ${minimum} to ${maximum}`);
  }
  return value;
}
function target(input, path) {
  const entry = record(input, path);
  exactFields(entry, ["executor", "model"], path);
  const executor = entry.executor;
  if (executor !== "native" && executor !== "codex" && executor !== "agy" && executor !== "cursor") {
    fail(`${path}.executor`, "expected native, codex, agy, or cursor");
  }
  const modelPath = `${path}.model`;
  const model = record(entry.model, modelPath);
  if (executor === "native" && model.mode === "inherit") {
    exactFields(model, ["mode"], modelPath);
    return { executor, model: { mode: "inherit" } };
  }
  if (executor !== "native" && model.mode === "executor-default") {
    exactFields(model, ["mode"], modelPath);
    return { executor, model: { mode: "executor-default" } };
  }
  if (model.mode !== "explicit") {
    fail(`${modelPath}.mode`, executor === "native" ? "expected inherit or explicit for native" : "expected executor-default or explicit for an external executor");
  }
  exactFields(model, executor === "native" ? ["mode", "provider", "id", "reasoningEffort"] : ["mode", "id", "reasoningEffort"], modelPath);
  const id = text(model.id, `${modelPath}.id`);
  const effort = model.reasoningEffort === void 0 ? {} : {
    reasoningEffort: text(model.reasoningEffort, `${modelPath}.reasoningEffort`)
  };
  if (executor === "native") {
    return { executor, model: {
      mode: "explicit",
      provider: text(model.provider, `${modelPath}.provider`),
      id,
      ...effort
    } };
  }
  return { executor, model: { mode: "explicit", id, ...effort } };
}
function binding(input, path) {
  const entry = record(input, path);
  if (entry.mode === "default") {
    exactFields(entry, ["mode"], path);
    return { mode: "default" };
  }
  if (entry.mode === "target") {
    exactFields(entry, ["mode", "target"], path);
    return { mode: "target", target: target(entry.target, `${path}.target`) };
  }
  fail(`${path}.mode`, "expected default or target");
}
function createDefaultRoutingPolicy() {
  return {
    version: 2,
    defaultTarget: { executor: "native", model: { mode: "inherit" } },
    categories: /* @__PURE__ */ Object.create(null),
    historyLimit: 100
  };
}
function parseRoutingPolicy(input) {
  const source = record(input, "policy");
  exactFields(source, POLICY_FIELDS, "policy");
  if (source.version !== 2) fail("policy.version", "must be 2");
  const result = createDefaultRoutingPolicy();
  if (Object.hasOwn(source, "defaultTarget")) result.defaultTarget = target(source.defaultTarget, "policy.defaultTarget");
  if (Object.hasOwn(source, "historyLimit")) {
    result.historyLimit = integer(source.historyLimit, 1, 1e3, "policy.historyLimit");
  }
  if (Object.hasOwn(source, "categories")) {
    const entries = record(source.categories, "policy.categories");
    for (const key2 of Object.keys(entries)) {
      const path = `policy.categories[${JSON.stringify(key2)}]`;
      let id;
      try {
        id = getCategory(key2).id;
      } catch (error) {
        fail(path, error instanceof Error ? error.message : "invalid category");
      }
      result.categories[id] = binding(entries[key2], path);
    }
  }
  return result;
}

// src/core/native-subagent.ts
var DELEGATION_MODES = Object.freeze(["passive", "specialist-first", "orchestrator"]);
function isDelegationMode(value) {
  return DELEGATION_MODES.some((mode) => mode === value);
}
var PROACTIVE_SPECIALIST_CATEGORIES = /* @__PURE__ */ new Set([
  "visual-engineering",
  "ultrabrain",
  "deep",
  "artistry",
  "writing"
]);

// src/core/recommendations.ts
var RECOMMENDATION_VERSION = "2026-11-24.1";
var candidate = (provider, model) => Object.freeze({ provider, model });
var sonnet = candidate("anthropic", "claude-sonnet-4-5");
var opus = candidate("anthropic", "claude-opus-4-1");
var geminiPro = candidate("google", "gemini-2.5-pro");
var geminiFlash = candidate("google", "gemini-2.5-flash");
var codex = candidate("openai", "gpt-5-codex");
var mini = candidate("openai", "gpt-5-mini");
var chat = candidate("deepseek", "deepseek-chat");
var reasoner = candidate("deepseek", "deepseek-reasoner");
var astra = candidate("openai-codex", "gpt-6-astra");
var subscriptionMini = candidate("openai-codex", "gpt-5.4-mini");
var argon = candidate("antigravity", "gemini-4-argon");
var agyOpus = candidate("antigravity", "claude-opus-5-5");
var agySonnet = candidate("antigravity", "claude-sonnet-5-5");
var agyFlash = candidate("antigravity", "gemini-3.8-flash");
var RECOMMENDATION_CANDIDATES = Object.freeze({
  "visual-engineering": Object.freeze([argon, agyOpus, astra, geminiPro, sonnet, codex]),
  ultrabrain: Object.freeze([astra, agyOpus, reasoner, opus, geminiPro]),
  deep: Object.freeze([agySonnet, astra, geminiPro, agyOpus, codex, sonnet, chat]),
  artistry: Object.freeze([agyOpus, argon, astra, opus, geminiPro, sonnet]),
  quick: Object.freeze([subscriptionMini, agyFlash, chat, mini, geminiFlash]),
  unspecified: Object.freeze([agySonnet, subscriptionMini, chat, sonnet, geminiFlash]),
  writing: Object.freeze([agySonnet, astra, chat, sonnet, argon, geminiPro])
});
function routingPolicyFingerprint(input) {
  const policy = parseRoutingPolicy(input);
  return JSON.stringify({
    version: 2,
    defaultTarget: policy.defaultTarget,
    historyLimit: policy.historyLimit,
    categories: CATEGORY_IDS.map((id) => [id, policy.categories[id] ?? { mode: "default" }])
  });
}
function previewRecommendations(input, catalog, options = {}) {
  const policy = parseRoutingPolicy(input);
  const baselineFingerprint = routingPolicyFingerprint(policy);
  const changes = [];
  const preserved = [];
  const unavailable = [];
  const overwrite = options.overwrite === true;
  for (const id of CATEGORY_IDS) {
    const before = policy.categories[id] ?? { mode: "default" };
    if (before.mode === "target" && !overwrite) {
      preserved.push(id);
      continue;
    }
    const match = RECOMMENDATION_CANDIDATES[id].find((entry) => !catalog.failures.some((failure) => failure.id === entry.provider) && catalog.groups.some((group) => group.id === entry.provider && group.models.some((model) => model.id === entry.model)));
    if (!match) {
      unavailable.push(id);
      continue;
    }
    const after = {
      mode: "target",
      target: {
        executor: "native",
        model: { mode: "explicit", provider: match.provider, id: match.model }
      }
    };
    if (JSON.stringify(before) === JSON.stringify(after)) continue;
    changes.push({ category: id, before: structuredClone(before), after: structuredClone(after) });
    policy.categories[id] = after;
  }
  return { manifestVersion: RECOMMENDATION_VERSION, baselineFingerprint, policy, changes, preserved, unavailable, overwrite };
}

// src/ui/catalog-index.ts
function indexCatalog(catalog) {
  const failed = new Set(catalog?.failures.map((failure) => failure.id));
  const providers = /* @__PURE__ */ new Map();
  for (const group of catalog?.groups ?? []) {
    if (providers.has(group.id)) continue;
    const models = /* @__PURE__ */ new Map();
    const names = /* @__PURE__ */ new Set();
    const duplicateNames = /* @__PURE__ */ new Set();
    for (const model of group.models) {
      if (models.has(model.id)) continue;
      models.set(model.id, { model, searchText: `${model.name}
${model.id}`.toLowerCase() });
      if (names.has(model.name)) duplicateNames.add(model.name);
      else names.add(model.name);
    }
    providers.set(group.id, { id: group.id, name: group.name, failed: failed.has(group.id), searchText: `${group.name}
${group.id}`.toLowerCase(), duplicateNames, models });
  }
  return providers;
}
function searchCatalog(index, normalizedQuery, limit) {
  const groups = [];
  let count = 0;
  for (const provider of index.values()) {
    const matchesProvider = provider.searchText.includes(normalizedQuery);
    let matches;
    for (const { model, searchText } of provider.models.values()) {
      if (!matchesProvider && !searchText.includes(normalizedQuery)) continue;
      if (count === limit) return { groups, hasMore: true };
      if (matches === void 0) groups.push({ provider, models: matches = [] });
      matches.push(model);
      count++;
    }
  }
  return { groups, hasMore: false };
}

// src/ui/GrantDiagnostics.tsx
var React = __toESM(require("react"), 1);

// src/ui/model-grants.ts
var MODEL_AUTHORIZATION_ENTRY = "subagent-model-selection-settings";
var key = (route) => JSON.stringify([route.provider, route.model]);
function requiredModelRoutes(policy) {
  const routes = /* @__PURE__ */ new Map();
  const add = (target2) => {
    if (target2.executor !== "native" || target2.model.mode !== "explicit") return;
    const route = { provider: target2.model.provider, model: target2.model.id };
    routes.set(key(route), route);
  };
  add(policy.defaultTarget);
  for (const binding2 of Object.values(policy.categories)) if (binding2?.mode === "target") add(binding2.target);
  return [...routes.values()];
}
function isAllowedModelArray(value) {
  if (!Array.isArray(value)) return false;
  for (const row of value) {
    if (typeof row?.provider !== "string" || !row.provider.length || typeof row.model !== "string" || !row.model.length) return false;
  }
  return true;
}
function planModelGrant(required, snapshot) {
  if (!required.length) return { kind: "complete" };
  const { value, revision } = snapshot;
  if (snapshot.status !== "ready") return { kind: "unavailable", reason: snapshot.status === "loading" ? "loading" : "unserved" };
  if (!Number.isSafeInteger(revision) || revision === void 0 || typeof value?.enabled !== "boolean" || !isAllowedModelArray(value.allowedModels)) {
    return { kind: "unavailable", reason: "invalid" };
  }
  const existing = new Set(value.allowedModels.map(key));
  const missing = required.filter((route) => !existing.has(key(route)));
  if (value.enabled && !missing.length) return { kind: "complete" };
  if (!snapshot.writable) return { kind: "readOnly" };
  return { kind: "write", revision, routes: [...value.allowedModels, ...missing] };
}

// src/ui/grant-diagnostics.ts
var owner = "@deepseek-ai/dsh-tool-subagent";
var CODEX_SUBAGENT = "@deepseek-ai/dsh-subagent-codex";
var version = (v) => typeof v === "string" && /^\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.+-]+)?$/.test(v) && v.length <= 64;
async function readGrantEvidence(reader) {
  if (!reader) return { component: "unknown" };
  const read = async (fn) => {
    try {
      const res = await fn();
      return res.ok && Array.isArray(res.value) ? res.value : void 0;
    } catch {
      return void 0;
    }
  };
  const [plugins, bundles] = await Promise.all([read(() => reader.listPlugins()), read(() => reader.listBundles())]);
  const row = plugins?.find((p) => p.entryId === `include:${MODEL_AUTHORIZATION_ENTRY}` && p.moduleName === `${owner}/model-selection-settings`);
  const component = !row ? plugins ? "missing" : "unknown" : !row.enabled ? "disabled" : row.fiberPhase === "active" ? "active" : row.fiberPhase === "failed" ? "failed" : "starting";
  const result = { component };
  if (component !== "disabled" && component !== "failed") return result;
  const bundle = bundles?.find((b) => b.name === CODEX_SUBAGENT && b.installed && b.error?.code === "incompatible-version");
  const bad = bundle?.error?.incompatible?.find((i) => i.name === bundle.name && i.version === bundle.version);
  if (bundle && bad && version(bad.version) && version(bad.runtimeVersion)) {
    const offered = bundle.installTarget?.version;
    result.conflict = {
      name: bundle.name,
      installed: bad.version,
      runtime: bad.runtimeVersion,
      ...version(offered) && offered !== bad.version ? { offered } : {}
    };
  }
  return result;
}

// src/ui/GrantDiagnostics.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var zh = {
  loading: "\u6B63\u5728\u8BFB\u53D6\u5B50\u667A\u80FD\u4F53\u6A21\u578B\u6388\u6743\u8BBE\u7F6E\u2026",
  checking: "\u6B63\u5728\u68C0\u67E5\u6388\u6743\u7EC4\u4EF6\u2026",
  unserved: "\u6682\u65F6\u4E0D\u80FD\u4FDD\u5B58\uFF1ADSH \u6CA1\u6709\u63D0\u4F9B\u6A21\u578B\u6388\u6743\u8BBE\u7F6E\u3002",
  invalid: "\u6682\u65F6\u4E0D\u80FD\u4FDD\u5B58\uFF1ADSH \u8FD4\u56DE\u7684\u6A21\u578B\u6388\u6743\u8BBE\u7F6E\u4E0D\u5B8C\u6574\u3002\u8BF7\u91CD\u65B0\u68C0\u6D4B\uFF1B\u5982\u679C\u4ECD\u7136\u5931\u8D25\uFF0C\u8BF7\u590D\u5236\u8BCA\u65AD\u4FE1\u606F\u3002",
  readOnly: "\u6682\u65F6\u4E0D\u80FD\u4FDD\u5B58\uFF1A\u6A21\u578B\u6388\u6743\u8BBE\u7F6E\u4E3A\u53EA\u8BFB\u3002\u8BF7\u8BA9\u7BA1\u7406\u6B64 DSH \u5B9E\u4F8B\u7684\u4EBA\u4FDD\u5B58\u6388\u6743\u540E\u518D\u8BD5\u3002",
  unknown: "\u672A\u80FD\u786E\u8BA4\u7EC4\u4EF6\u72B6\u6001\u3002\u8BF7\u91CD\u65B0\u68C0\u6D4B\uFF1B\u5982\u679C\u4ECD\u7136\u5931\u8D25\uFF0C\u53EF\u590D\u5236\u8BCA\u65AD\u4FE1\u606F\u7ED9\u7EF4\u62A4\u8005\u3002",
  missing: "\u63D2\u4EF6\u6E05\u5355\u4E2D\u6CA1\u6709\u627E\u5230\u6A21\u578B\u6388\u6743\u7EC4\u4EF6\u3002\u8BF7\u8BA9\u7EF4\u62A4\u8005\u68C0\u67E5 DSH Web \u662F\u5426\u5B89\u88C5\u4E86\u5339\u914D\u7248\u672C\u7684\u5B50\u667A\u80FD\u4F53\u7EC4\u4EF6\u3002",
  disabled: "\u5B50\u667A\u80FD\u4F53\u6A21\u578B\u6388\u6743\u7EC4\u4EF6\u672A\u542F\u7528\u3002\u8BF7\u8BA9\u7EF4\u62A4\u8005\u542F\u7528\u4E0B\u65B9\u8BCA\u65AD\u4FE1\u606F\u4E2D\u7684\u7EC4\u4EF6\uFF0C\u518D\u91CD\u65B0\u68C0\u6D4B\u3002",
  failed: "\u6A21\u578B\u6388\u6743\u7EC4\u4EF6\u542F\u52A8\u5931\u8D25\u3002\u8BF7\u628A\u8BCA\u65AD\u4FE1\u606F\u53D1\u7ED9\u7EF4\u62A4\u8005\uFF0C\u4FEE\u590D\u540E\u91CD\u65B0\u68C0\u6D4B\u3002",
  starting: "\u6A21\u578B\u6388\u6743\u7EC4\u4EF6\u5DF2\u542F\u7528\uFF0C\u4F46\u8FD8\u672A\u8FD0\u884C\u3002\u8BF7\u7A0D\u540E\u91CD\u65B0\u68C0\u6D4B\u3002",
  active: "\u7EC4\u4EF6\u5DF2\u8FD0\u884C\uFF0C\u4F46\u8BBE\u7F6E\u4ECD\u4E0D\u53EF\u7528\u3002\u8BF7\u7A0D\u540E\u91CD\u65B0\u68C0\u6D4B\uFF1B\u5982\u679C\u6301\u7EED\u5931\u8D25\uFF0C\u8BF7\u590D\u5236\u8BCA\u65AD\u4FE1\u606F\u3002",
  conflict: (v, runtime) => `\u68C0\u6D4B\u5230 Codex \u5B50\u667A\u80FD\u4F53 ${v} \u4E0E DSH ${runtime} \u4E0D\u517C\u5BB9\u3002`,
  update: (v) => `\u8BF7\u5728\u63D2\u4EF6\u9875\u66F4\u65B0\u5230 ${v}\uFF0C\u7136\u540E\u8FD4\u56DE\u91CD\u8BD5\u3002Codex \u5B50\u667A\u80FD\u4F53\u672C\u8EAB\u4E0D\u9700\u8981\u5F00\u542F\u3002`,
  noTarget: "\u8BF7\u5728\u63D2\u4EF6\u9875\u68C0\u67E5\u662F\u5426\u6709\u517C\u5BB9\u66F4\u65B0\u3002",
  retry: "\u91CD\u65B0\u68C0\u6D4B",
  open: "\u67E5\u770B\u63D2\u4EF6",
  copy: "\u590D\u5236\u8BCA\u65AD\u4FE1\u606F",
  copied: "\u5DF2\u590D\u5236",
  manual: "\u8BF7\u624B\u52A8\u590D\u5236\u4E0B\u65B9\u6587\u5B57\u3002",
  details: "\u8BCA\u65AD\u4FE1\u606F",
  leave: "\u79BB\u5F00\u9875\u9762\u4F1A\u4E22\u5F03\u672A\u4FDD\u5B58\u7684\u7F16\u8F91\u3002"
};
var en = {
  loading: "Reading subagent model authorization settings\u2026",
  checking: "Checking the authorization component\u2026",
  unserved: "Cannot save yet: DSH is not serving model authorization settings.",
  invalid: "Cannot save yet: DSH returned incomplete authorization settings. Check again; if this persists, copy the diagnostics.",
  readOnly: "Cannot save yet: authorization settings are read-only. Ask your DSH administrator to save the authorization, then retry.",
  unknown: "Component status is unknown. Check again or copy the diagnostics for support.",
  missing: "The model authorization component was not found in the plugin inventory. Ask your administrator to check that the matching DSH Web subagent component is installed.",
  disabled: "Subagent model authorization is disabled. Ask your administrator to enable the component named in the diagnostics, then check again.",
  failed: "The authorization component failed to start. Share the diagnostics with your administrator, then check again after repair.",
  starting: "The authorization component is enabled but not running. Check again shortly.",
  active: "The component is running but its settings are unavailable. Check again shortly or copy the diagnostics if this persists.",
  conflict: (v, runtime) => `Codex subagent ${v} is incompatible with DSH ${runtime}.`,
  update: (v) => `Update it to ${v} in Plugins, then return and retry. The Codex subagent itself may remain disabled.`,
  noTarget: "Check Plugins for a compatible update.",
  retry: "Check again",
  open: "View plugin",
  copy: "Copy diagnostics",
  copied: "Copied",
  manual: "Copy the text below manually.",
  details: "Diagnostics",
  leave: "Leaving this page discards unsaved edits."
};
var GrantDiagnostics = React.memo(function GrantDiagnostics2({ id, problem, locale, inventory, recheck, openBundle, dirty }) {
  const t = locale === "zh" ? zh : en;
  const [attempt, retry] = React.useReducer((v) => v + 1, 0);
  const [evidence, setEvidence] = React.useState();
  const [probe, setProbe] = React.useState();
  const [copy, setCopy] = React.useState();
  React.useEffect(() => {
    let live = true;
    setEvidence(void 0);
    setCopy(void 0);
    setProbe(void 0);
    if (attempt) void recheck().then((outcome) => {
      if (live) setProbe(outcome);
    }, () => {
      if (live) setProbe("unknown");
    });
    if (problem === "unserved") void readGrantEvidence(inventory()).then((value) => {
      if (live) setEvidence(value);
    });
    return () => {
      live = false;
    };
  }, [attempt, problem, inventory, recheck]);
  const conflict = evidence?.conflict;
  const report = JSON.stringify({ component: MODEL_AUTHORIZATION_ENTRY, settings: problem, ...evidence && { status: evidence.component }, ...conflict && { conflict } }, null, 2);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { id, tabIndex: -1, className: "dtr-card dtr-note dtr-diagnostics", "aria-labelledby": `${id}-summary`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { id: `${id}-summary`, role: "status", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t[problem] }) }),
    problem === "unserved" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: !evidence ? t.checking : conflict && evidence.component === "disabled" ? locale === "zh" ? "\u5B50\u667A\u80FD\u4F53\u6A21\u578B\u6388\u6743\u7EC4\u4EF6\u672A\u542F\u7528\u3002" : "Subagent model authorization is disabled." : t[evidence.component] }),
    conflict && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
      t.conflict(conflict.installed, conflict.runtime),
      " ",
      conflict.offered ? t.update(conflict.offered) : t.noTarget
    ] }),
    probe && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "status", children: locale === "zh" ? { available: "DSH \u5DF2\u80FD\u63D0\u4F9B\u6388\u6743\u8BBE\u7F6E\u3002\u82E5\u4FDD\u5B58\u4ECD\u4E0D\u53EF\u7528\uFF0C\u8BF7\u8BB0\u4E0B\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u518D\u5237\u65B0\u9875\u9762\u3002", unchanged: "\u5DF2\u91CD\u65B0\u68C0\u6D4B\uFF0C\u6388\u6743\u8BBE\u7F6E\u4ECD\u672A\u5C31\u7EEA\u6216\u4E0D\u53EF\u5199\u3002", unknown: "\u65E0\u6CD5\u4ECE DSH \u83B7\u53D6\u6700\u65B0\u72B6\u6001\u3002\u8BF7\u786E\u8BA4\u8FDE\u63A5\u540E\u91CD\u8BD5\u3002" }[probe] : { available: "DSH now serves authorization settings. If Save remains unavailable, note your unsaved edits before refreshing the page.", unchanged: "Checked again: the settings are still unavailable or read-only.", unknown: "Could not reach DSH for a fresh status. Check the connection and retry." }[probe] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-inline", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: retry, children: t.retry }),
      conflict && openBundle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => openBundle(conflict.name), children: t.open }),
      problem !== "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: async () => {
        try {
          await navigator.clipboard.writeText(report);
          setCopy("copied");
        } catch {
          setCopy("manual");
        }
      }, children: t.copy })
    ] }),
    dirty && conflict && openBundle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-muted", children: t.leave }),
    copy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "status", children: t[copy] }),
    problem !== "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { open: copy === "manual" || void 0, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: t.details }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { children: report })
    ] }, copy === "manual" ? "manual" : "details")
  ] });
});

// src/ui/ModelPicker.tsx
var React2 = __toESM(require("react"), 1);
var import_jsx_runtime2 = require("react/jsx-runtime");
var ICON_PATHS = {
  chevron: "m6 9 6 6 6-6",
  check: "m5 12 4 4L19 6",
  reset: "M4 11a8 8 0 1 1 2 6m-2-6V5m0 6h6",
  passive: "M6 5v14M11 8l5 4-5 4",
  "specialist-first": "M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z",
  orchestrator: "M9 4h6v5H9zM4 16h6v4H4zM14 16h6v4h-6zM12 9v4m-5 3v-3h10v3",
  info: "M12 11v5m0-8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  arrow: "M4 12h15m-6-6 6 6-6 6"
};
function Icon({ name }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { "aria-hidden": "true", focusable: "false", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: ICON_PATHS[name] }) });
}
var PAGE_SIZE = 60;
var CatalogOptions = React2.memo(function CatalogOptions2({ matches, provider, model, choose }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_jsx_runtime2.Fragment, { children: matches.groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { role: "group", "aria-label": group.provider.name, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { "aria-hidden": "true", className: "dtr-option-group-label", children: group.provider.name }),
    group.models.map((entry) => {
      const active = provider === group.provider.id && model === entry.id;
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        "button",
        {
          type: "button",
          className: "dtr-option",
          tabIndex: -1,
          "data-catalog-option": "",
          "aria-pressed": active,
          disabled: group.provider.failed,
          onClick: () => choose({ mode: "explicit", provider: group.provider.id, id: entry.id }),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
              entry.name,
              group.provider.duplicateNames.has(entry.name) && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dtr-option-detail", children: entry.id })
            ] }),
            active && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "check" })
          ]
        },
        entry.id
      );
    })
  ] }, group.provider.id)) });
});
var ModelPicker = React2.memo(function ModelPicker2({ t, catalog, status, mode, provider, model, label, detail, defaultSummary, id, titleId, invalid, issueId, disabled, register, onSelect }) {
  const [open, setOpen] = React2.useState(false);
  const [query, setQuery] = React2.useState("");
  const [page, setPage] = React2.useState({ filter: "", limit: PAGE_SIZE });
  const filter = React2.useDeferredValue(query).trim().toLowerCase();
  const limit = page.filter === filter ? page.limit : PAGE_SIZE;
  const root = React2.useRef(null);
  const trigger = React2.useRef(null);
  const popup = React2.useRef(null);
  const input = React2.useRef(null);
  const focusMore = React2.useRef();
  const triggerRef = React2.useCallback((node) => {
    trigger.current = node;
    register(node);
  }, [register]);
  const visible = open && !disabled;
  const close = React2.useCallback(() => {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }, []);
  const choose = React2.useCallback((choice) => {
    close();
    if (choice.mode !== mode || choice.mode === "explicit" && (choice.provider !== provider || choice.id !== model)) onSelect(choice);
  }, [close, mode, provider, model, onSelect]);
  React2.useLayoutEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  React2.useLayoutEffect(() => {
    if (!visible) return;
    const panel = popup.current;
    const anchor = trigger.current;
    if (!panel || !anchor) return;
    const topLayer = typeof panel.showPopover === "function";
    const rtl = getComputedStyle(anchor).direction === "rtl";
    const visualViewport = window.visualViewport;
    const place = () => {
      const rect = anchor.getBoundingClientRect();
      const width = visualViewport?.width ?? document.documentElement.clientWidth;
      const height = visualViewport?.height ?? window.innerHeight;
      const viewportLeft = visualViewport?.offsetLeft ?? 0;
      const viewportTop = visualViewport?.offsetTop ?? 0;
      const gap = 4;
      const margin = 8;
      const below = viewportTop + height - rect.bottom - gap - margin;
      const above = rect.top - viewportTop - gap - margin;
      const up = below < Math.min(400, height * 0.57) && below < above;
      panel.dataset.up = String(up);
      panel.style.setProperty("--dtr-menu-available", `${Math.min(448, Math.max(0, up ? above : below))}px`);
      if (topLayer) {
        const menuWidth = Math.min(Math.max(0, width - 2 * margin), Math.max(rect.width, 280));
        const left = Math.max(viewportLeft + margin, Math.min(rtl ? rect.left : rect.right - menuWidth, viewportLeft + width - margin - menuWidth));
        panel.style.setProperty("--dtr-menu-width", `${menuWidth}px`);
        panel.style.setProperty("--dtr-menu-left", `${left}px`);
        panel.style.setProperty("--dtr-menu-edge", `${up ? window.innerHeight - rect.top + gap : rect.bottom + gap}px`);
      }
    };
    place();
    if (topLayer) {
      panel.popover = "manual";
      panel.showPopover();
    }
    input.current?.focus({ preventScroll: true });
    let frame = 0;
    const schedulePlace = (event) => {
      if (frame || event?.target instanceof Node && panel.contains(event.target)) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        place();
      });
    };
    const onOutside = (event) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const observer = typeof IntersectionObserver === "function" ? new IntersectionObserver((entries) => {
      if (entries.some((entry) => !entry.isIntersecting)) setOpen(false);
    }) : void 0;
    observer?.observe(anchor);
    const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(() => schedulePlace()) : void 0;
    resizeObserver?.observe(anchor);
    const editor = anchor.closest(".dtr-editor");
    if (editor) resizeObserver?.observe(editor);
    visualViewport?.addEventListener("resize", schedulePlace);
    visualViewport?.addEventListener("scroll", schedulePlace, { passive: true });
    window.addEventListener("resize", schedulePlace);
    window.addEventListener("scroll", schedulePlace, { capture: true, passive: true });
    document.addEventListener("pointerdown", onOutside, true);
    document.addEventListener("focusin", onOutside);
    return () => {
      observer?.disconnect();
      resizeObserver?.disconnect();
      cancelAnimationFrame(frame);
      visualViewport?.removeEventListener("resize", schedulePlace);
      visualViewport?.removeEventListener("scroll", schedulePlace);
      window.removeEventListener("resize", schedulePlace);
      window.removeEventListener("scroll", schedulePlace, true);
      document.removeEventListener("pointerdown", onOutside, true);
      document.removeEventListener("focusin", onOutside);
      if (topLayer && panel.matches(":popover-open")) panel.hidePopover();
    };
  }, [visible]);
  const matches = React2.useMemo(() => visible && !status ? searchCatalog(catalog, filter, limit) : void 0, [visible, status, catalog, filter, limit]);
  React2.useLayoutEffect(() => {
    if (focusMore.current === void 0) return;
    const options = popup.current?.querySelectorAll("[data-catalog-option]:not(:disabled)");
    const next = options && (options[focusMore.current] ?? options[options.length - 1]);
    focusMore.current = void 0;
    (next ?? input.current)?.focus();
  }, [limit]);
  const start = () => {
    setQuery("");
    setPage({ filter: "", limit: PAGE_SIZE });
    setOpen(true);
  };
  const specialOption = (choice, text3, description) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("button", { type: "button", className: "dtr-option", tabIndex: choice.mode === "default" || defaultSummary === void 0 ? 0 : -1, "aria-pressed": mode === choice.mode, onClick: () => choose(choice), children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
      text3,
      description && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dtr-option-detail", children: description })
    ] }),
    mode === choice.mode && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "check" })
  ] });
  const selectionText = detail ? `${label} \xB7 ${detail}` : label;
  const popupId = `${id}-popup`;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dtr-field dtr-picker", ref: root, onKeyDown: (event) => {
    if (disabled || event.nativeEvent.isComposing) return;
    if (!visible) {
      if (event.target === trigger.current && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        event.preventDefault();
        start();
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    if (event.target === input.current && (event.key === "Home" || event.key === "End")) return;
    const options = Array.from(popup.current?.querySelectorAll(".dtr-option:not(:disabled)") ?? []);
    if (!options.length) return;
    const previous = options.indexOf(event.target);
    if (previous < 0 && event.target !== input.current) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : event.key === "ArrowDown" ? Math.min(previous + 1, options.length - 1) : previous < 0 ? options.length - 1 : previous - 1;
    if (next < 0) input.current?.focus();
    else options[next]?.focus();
  }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { id: `${id}-label`, children: t("model") }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "button",
      {
        ref: triggerRef,
        id,
        type: "button",
        className: "dtr-trigger",
        title: selectionText,
        "aria-labelledby": `${titleId} ${id}-label ${id}-selection`,
        "aria-expanded": visible,
        "aria-invalid": invalid || void 0,
        "aria-describedby": invalid ? issueId : void 0,
        "aria-controls": visible ? popupId : void 0,
        "data-follows": mode === "default",
        disabled,
        onClick: visible ? close : start,
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "dtr-trigger-copy", id: `${id}-selection`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dtr-trigger-name", children: label }),
            detail && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dtr-trigger-detail", children: mode === "default" ? `\xB7 ${detail}` : detail })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "chevron" })
        ]
      }
    ),
    visible && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dtr-menu", id: popupId, ref: popup, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dtr-sr-only", id: `${id}-keys`, children: t("searchKeys") }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "input",
        {
          ref: input,
          type: "search",
          "aria-label": t("searchModels"),
          "aria-describedby": `${id}-keys`,
          placeholder: t("searchModels"),
          value: query,
          onChange: (event) => setQuery(event.target.value)
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dtr-options", children: [
        defaultSummary !== void 0 && specialOption({ mode: "default" }, t("useDefault"), defaultSummary),
        specialOption({ mode: "inherit" }, t("inherit")),
        status ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "dtr-muted", role: "status", children: status }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
          matches && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(CatalogOptions, { matches, provider, model, choose }),
          !matches?.groups.length && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "dtr-muted", role: "status", children: t("noModels") }),
          matches?.hasMore && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "dtr-option dtr-more", tabIndex: -1, onClick: () => {
            focusMore.current = popup.current?.querySelectorAll("[data-catalog-option]:not(:disabled)").length;
            setPage({ filter, limit: limit + PAGE_SIZE });
          }, children: t("moreModels") })
        ] })
      ] })
    ] })
  ] });
});

// src/ui/RouteRow.tsx
var React3 = __toESM(require("react"), 1);
var import_jsx_runtime3 = require("react/jsx-runtime");
var fieldKey = (section, field) => `${section}:${field}`;
var EXECUTOR_LABELS = { codex: "Codex", agy: "Antigravity (agy)", cursor: "Cursor" };
var NO_EFFORTS = [];
function nativeDisplay(t, catalog, catalogReady, provider, id) {
  if (id === void 0) return { label: t("inherit") };
  if (!id) return { label: t("chooseModel") };
  const group = provider ? catalog.get(provider) : void 0;
  const model = group?.models.get(id)?.model;
  if (model && group && !group.failed) return { label: model.name, detail: group.duplicateNames.has(model.name) ? `${group.name} \xB7 ${model.id}` : group.name };
  return { label: catalogReady ? t("unavailableOption", { name: id }) : id, ...provider ? { detail: group?.name ?? provider } : {} };
}
function externalModelSummary(target2, t) {
  if (target2.model.mode === "executor-default") return t("executorDefault");
  return target2.model.reasoningEffort ? `${target2.model.id} \xB7 ${target2.model.reasoningEffort}` : target2.model.id;
}
function defaultTargetSummary(t, target2, catalog, catalogReady) {
  if (target2.executor !== "native") return `${EXECUTOR_LABELS[target2.executor]} \xB7 ${externalModelSummary(target2, t)}`;
  const explicit = target2.model.mode === "explicit" ? target2.model : void 0;
  const display = nativeDisplay(t, catalog, catalogReady, explicit?.provider, explicit?.id);
  return display.detail ? `${display.label} \xB7 ${display.detail}` : display.label;
}
var RouteRow = React3.memo(function RouteRow2({
  t,
  section,
  name,
  purpose,
  instance,
  catalog,
  catalogReady,
  catalogStatus,
  executor,
  legacyModel,
  provider,
  model,
  effort,
  followsDefault,
  defaultSummary,
  disabled,
  issueField,
  registerField,
  onModel,
  onEffort
}) {
  const baseId = `dtr-${instance}-${section}`;
  const titleId = `${baseId}-title`;
  const issueId = `dtr-${instance}-issue`;
  const customized = section !== "default" && !followsDefault;
  const showExecutor = !followsDefault && executor !== "native";
  const mode = followsDefault ? "default" : model === void 0 ? "inherit" : "explicit";
  const display = followsDefault ? { label: t("useDefault"), detail: defaultSummary } : nativeDisplay(t, catalog, catalogReady, provider, model);
  const group = provider ? catalog.get(provider) : void 0;
  const catalogModel = model ? group?.models.get(model)?.model : void 0;
  const efforts = catalogModel?.reasoning?.efforts ?? NO_EFFORTS;
  const showEffort = !followsDefault && executor === "native" && provider !== void 0 && model !== void 0 && (efforts.length > 0 || effort !== void 0);
  const focusAfterReset = React3.useRef(false);
  const pickerButton = React3.useRef(null);
  const registerModel = React3.useCallback((node) => {
    pickerButton.current = node;
    registerField(section, "model", node);
    registerField(section, "provider", node);
  }, [registerField, section]);
  const registerEffort = React3.useCallback((node) => registerField(section, "effort", node), [registerField, section]);
  const registerExecutor = React3.useCallback((node) => registerField(section, "executor", node), [registerField, section]);
  const chooseModel = React3.useCallback((choice) => onModel(section, choice), [onModel, section]);
  React3.useLayoutEffect(() => {
    if (!focusAfterReset.current || !followsDefault && showExecutor) return;
    focusAfterReset.current = false;
    pickerButton.current?.focus({ preventScroll: true });
  }, [followsDefault, showExecutor]);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: `dtr-card dtr-route${section === "default" ? " dtr-route-default" : ""}`, role: "group", "aria-labelledby": titleId, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dtr-stack", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dtr-inline dtr-route-title", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h4", { id: titleId, children: name }),
        section !== "default" && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("code", { className: "dtr-route-id", children: section }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: `dtr-pill${customized ? " dtr-pill-brand" : ""}`, children: t(customized ? "customized" : "useDefault") })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "dtr-route-purpose", children: purpose })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dtr-controls", children: [
      showExecutor ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { className: "dtr-field dtr-executor", children: [
          t("executor"),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "select",
            {
              ref: registerExecutor,
              id: `${baseId}-executor`,
              "aria-invalid": issueField === "executor" || void 0,
              "aria-describedby": issueField === "executor" ? issueId : void 0,
              value: executor,
              onChange: () => {
                focusAfterReset.current = true;
                chooseModel({ mode: "inherit" });
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "native", children: t("native") }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: executor, disabled: true, children: EXECUTOR_LABELS[executor] })
              ]
            }
          )
        ] }),
        legacyModel && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dtr-field dtr-legacy-model", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: t("model") }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("strong", { children: legacyModel })
        ] })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        ModelPicker,
        {
          t,
          catalog,
          status: catalogStatus,
          mode,
          provider,
          model,
          label: display.label,
          detail: display.detail,
          defaultSummary,
          id: `${baseId}-model`,
          titleId,
          invalid: issueField === "model" || issueField === "provider" || issueField === "executor",
          issueId,
          disabled,
          register: registerModel,
          onSelect: chooseModel
        }
      ),
      showEffort && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("label", { className: "dtr-field dtr-effort", children: [
        t("effort"),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "select",
          {
            ref: registerEffort,
            id: `${baseId}-effort`,
            "aria-invalid": issueField === "effort" || void 0,
            "aria-describedby": issueField === "effort" ? issueId : void 0,
            value: effort ?? "",
            disabled: !catalogReady || !catalogModel || group?.failed,
            onChange: (event) => onEffort(section, provider, model, event.currentTarget.value),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: "", children: t("modelDefault") }),
              effort && !efforts.some((item) => item.id === effort) && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: effort, children: t("unavailableOption", { name: effort }) }),
              efforts.map((item) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("option", { value: item.id, children: item.name }, item.id))
            ]
          }
        )
      ] }),
      customized && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { type: "button", className: "dtr-icon-button", title: t("reset"), "aria-label": t("reset"), onClick: () => {
        focusAfterReset.current = true;
        chooseModel({ mode: "default" });
      }, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Icon, { name: "reset" }) })
    ] }),
    showExecutor && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "dtr-muted dtr-warning", children: t("externalBlocked") })
  ] });
});

// src/core/policy.ts
var CONFIG_FIELDS = /* @__PURE__ */ new Set([
  "routes",
  "rules",
  "roles",
  "defaultRoute",
  "historyLimit"
]);
var ROUTE_FIELDS = /* @__PURE__ */ new Set(["provider", "model", "reasoningEffort"]);
var RULE_FIELDS = /* @__PURE__ */ new Set(["id", "keywords", "route", "priority"]);
var UNSAFE_KEYS2 = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]);
function fail2(path, message) {
  throw new TypeError(`${path}: ${message}`);
}
function record2(value, path) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail2(path, "must be an object");
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype) {
    fail2(path, "must be a plain object");
  }
  for (const key2 of Reflect.ownKeys(value)) {
    if (typeof key2 !== "string") fail2(path, "symbol fields are not allowed");
    if (UNSAFE_KEYS2.has(key2)) fail2(path, `unsafe key ${JSON.stringify(key2)}`);
    const descriptor = Object.getOwnPropertyDescriptor(value, key2);
    if (!Object.hasOwn(descriptor, "value")) {
      fail2(`${path}.${key2}`, "must be a data property");
    }
  }
  return value;
}
function exactFields2(value, allowed, path) {
  for (const key2 of Object.getOwnPropertyNames(value)) {
    if (!allowed.has(key2)) fail2(`${path}.${key2}`, "unknown field");
  }
}
function own(value, key2) {
  return Object.hasOwn(value, key2) ? value[key2] : void 0;
}
function text2(value, path) {
  if (typeof value !== "string") fail2(path, "must be a string");
  const normalized = value.trim();
  if (normalized.length === 0) fail2(path, "must not be empty");
  return normalized;
}
function routeName(value, path) {
  const name = text2(value, path);
  if (UNSAFE_KEYS2.has(name)) fail2(path, `unsafe route name ${JSON.stringify(name)}`);
  return name;
}
function integer2(value, minimum, maximum, path) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < minimum || value > maximum) {
    fail2(path, `must be a finite integer from ${minimum} to ${maximum}`);
  }
  return value;
}
function array(value, maximum, path) {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
    fail2(path, "must be an array");
  }
  if (value.length > maximum) fail2(path, `must contain at most ${maximum} items`);
  for (const key2 of Reflect.ownKeys(value)) {
    if (key2 === "length") continue;
    if (typeof key2 !== "string" || !Number.isInteger(Number(key2)) || Number(key2) < 0 || Number(key2) >= value.length || String(Number(key2)) !== key2) {
      fail2(path, "unknown array field");
    }
    if (!Object.hasOwn(Object.getOwnPropertyDescriptor(value, key2), "value")) {
      fail2(`${path}[${key2}]`, "must be a data property");
    }
  }
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.hasOwn(value, index)) fail2(`${path}[${index}]`, "must not be missing");
  }
  return value;
}
function requireRoute(routes, name, path) {
  if (!Object.hasOwn(routes, name)) fail2(path, `unknown route ${JSON.stringify(name)}`);
}
function parseConfig(input) {
  const source = record2(input, "config");
  exactFields2(source, CONFIG_FIELDS, "config");
  const routeSource = record2(own(source, "routes"), "config.routes");
  const routeKeys = Object.getOwnPropertyNames(routeSource);
  if (routeKeys.length > 64) fail2("config.routes", "must contain at most 64 routes");
  const routes = /* @__PURE__ */ Object.create(null);
  for (const key2 of routeKeys) {
    const path = `config.routes[${JSON.stringify(key2)}]`;
    const name = routeName(key2, path);
    if (Object.hasOwn(routes, name)) fail2(path, "duplicate normalized route name");
    const entry = record2(routeSource[key2], path);
    exactFields2(entry, ROUTE_FIELDS, path);
    const route = {
      provider: text2(own(entry, "provider"), `${path}.provider`),
      model: text2(own(entry, "model"), `${path}.model`)
    };
    const effort = own(entry, "reasoningEffort");
    if (effort !== void 0) route.reasoningEffort = text2(effort, `${path}.reasoningEffort`);
    routes[name] = route;
  }
  const rules = [];
  const ruleIds = /* @__PURE__ */ new Set();
  const rawRules = own(source, "rules");
  if (rawRules !== void 0) {
    const entries = array(rawRules, 64, "config.rules");
    for (let index = 0; index < entries.length; index += 1) {
      const path = `config.rules[${index}]`;
      const entry = record2(entries[index], path);
      exactFields2(entry, RULE_FIELDS, path);
      const id = text2(own(entry, "id"), `${path}.id`);
      if (ruleIds.has(id)) fail2(`${path}.id`, "duplicate rule id");
      ruleIds.add(id);
      const keywords = array(own(entry, "keywords"), 32, `${path}.keywords`).map(
        (keyword, keywordIndex) => {
          const keywordPath = `${path}.keywords[${keywordIndex}]`;
          const normalized = text2(keyword, keywordPath);
          if (normalized.length > 100) fail2(keywordPath, "must contain at most 100 characters");
          return normalized;
        }
      );
      const name = routeName(own(entry, "route"), `${path}.route`);
      requireRoute(routes, name, `${path}.route`);
      const priority = own(entry, "priority");
      rules.push({
        id,
        keywords,
        route: name,
        priority: priority === void 0 ? 0 : integer2(priority, -1e3, 1e3, `${path}.priority`)
      });
    }
  }
  const roles = /* @__PURE__ */ Object.create(null);
  const rawRoles = own(source, "roles");
  if (rawRoles !== void 0) {
    const entries = record2(rawRoles, "config.roles");
    for (const memberName of Object.getOwnPropertyNames(entries)) {
      const path = `config.roles[${JSON.stringify(memberName)}]`;
      if (memberName.trim().length === 0) fail2(path, "member name must not be empty");
      const name = routeName(entries[memberName], path);
      requireRoute(routes, name, path);
      roles[memberName] = name;
    }
  }
  const rawLimit = own(source, "historyLimit");
  const config = {
    routes,
    rules,
    roles,
    historyLimit: rawLimit === void 0 ? 100 : integer2(rawLimit, 1, 1e3, "config.historyLimit")
  };
  const rawDefault = own(source, "defaultRoute");
  if (rawDefault !== void 0) {
    const name = routeName(rawDefault, "config.defaultRoute");
    requireRoute(routes, name, "config.defaultRoute");
    config.defaultRoute = name;
  }
  return config;
}

// src/core/migration.ts
function previewMigration(input) {
  const legacy = parseConfig(input);
  const policy = createDefaultRoutingPolicy();
  policy.historyLimit = legacy.historyLimit;
  const route = legacy.defaultRoute === void 0 ? void 0 : legacy.routes[legacy.defaultRoute];
  if (route !== void 0) policy.defaultTarget = {
    executor: "native",
    model: {
      mode: "explicit",
      provider: route.provider,
      id: route.model,
      ...route.reasoningEffort === void 0 ? {} : { reasoningEffort: route.reasoningEffort }
    }
  };
  const retired = { routes: Object.keys(legacy.routes), ruleCount: legacy.rules.length, roleCount: Object.keys(legacy.roles).length };
  return {
    required: retired.routes.length > 0 || retired.ruleCount > 0 || retired.roleCount > 0 || legacy.defaultRoute !== void 0,
    policy: parseRoutingPolicy(policy),
    legacy,
    retired
  };
}

// src/ui/routing-editor.ts
var DEFAULT_BEHAVIOR = {
  delegationMode: "passive",
  enforceNativeSubagentRouting: false
};
function readBehaviorSettings(value) {
  return {
    delegationMode: isDelegationMode(value?.delegationMode) ? value.delegationMode : "passive",
    enforceNativeSubagentRouting: value?.enforceNativeSubagentRouting === true
  };
}
function routingPolicyToDraft(input) {
  const policy = parseRoutingPolicy(input);
  const categories = /* @__PURE__ */ Object.create(null);
  for (const id of CATEGORY_IDS) categories[id] = policy.categories[id] ?? { mode: "default" };
  return { defaultTarget: policy.defaultTarget, categories, historyLimit: String(policy.historyLimit) };
}
function routingDraftToPolicy(draft) {
  return parseRoutingPolicy({
    version: 2,
    defaultTarget: draft.defaultTarget,
    categories: draft.categories,
    historyLimit: draft.historyLimit.trim() === "" ? NaN : Number(draft.historyLimit)
  });
}
function routingFormPreview(value) {
  if (value.policyV2 !== void 0) {
    return { policy: parseRoutingPolicy(value.policyV2), required: false, retired: void 0 };
  }
  const preview = previewMigration({
    routes: value.routes ?? {},
    ...value.rules === void 0 ? {} : { rules: value.rules },
    ...value.roles === void 0 ? {} : { roles: value.roles },
    ...value.defaultRoute == null ? {} : { defaultRoute: value.defaultRoute },
    ...value.historyLimit === void 0 ? {} : { historyLimit: value.historyLimit }
  });
  return { policy: preview.policy, required: preview.required, retired: preview.retired };
}
function routingPolicyMutations(input) {
  return [{ op: "set", path: ["policyV2"], value: parseRoutingPolicy(input) }];
}
function historyLimitIssue(draft) {
  const history = Number(draft.historyLimit);
  if (draft.historyLimit.trim() === "" || !Number.isInteger(history) || history < 1 || history > 1e3) {
    return { section: "default", field: "historyLimit", reason: "history" };
  }
  return void 0;
}
function routingDraftIssue(draft, catalog, catalogReady = catalog !== void 0) {
  const historyIssue = historyLimitIssue(draft);
  if (historyIssue) return historyIssue;
  const targets = [{ section: "default", target: draft.defaultTarget }];
  for (const id of CATEGORY_IDS) {
    const entry = draft.categories[id];
    if (entry?.mode === "target") targets.push({ section: id, target: entry.target });
  }
  for (const { section, target: target2 } of targets) {
    if (target2.executor !== "native") return { section, field: "executor", reason: "externalUnavailable" };
    const selected = target2.model;
    if (selected.mode === "inherit") continue;
    if (!selected.provider.trim()) return { section, field: "provider", reason: "required" };
    if (!selected.id.trim()) return { section, field: "model", reason: "required" };
    if (!catalogReady || !catalog) return { section, field: "model", reason: "catalogRequired" };
    const group = catalog.groups.find((entry) => entry.id === selected.provider.trim());
    if (!group || catalog.failures.some((failure) => failure.id === group.id)) {
      return { section, field: "provider", reason: "catalog" };
    }
    const model = group.models.find((entry) => entry.id === selected.id.trim());
    if (!model) return { section, field: "model", reason: "catalog" };
    if (selected.reasoningEffort !== void 0 && !model.reasoning?.efforts.some((effort) => effort.id === selected.reasoningEffort?.trim())) {
      return { section, field: "effort", reason: "catalog" };
    }
  }
  try {
    routingDraftToPolicy(draft);
  } catch (error) {
    return { section: "default", field: "executor", reason: "structure", detail: error instanceof Error ? error.message : String(error) };
  }
  return void 0;
}
var RoutingEditor = class {
  state = {
    draft: void 0,
    behavior: { ...DEFAULT_BEHAVIOR },
    revision: void 0,
    dirty: false,
    saving: false,
    stale: false,
    migrationRequired: false,
    migrationConfirmed: false,
    retired: void 0,
    issue: void 0,
    error: void 0,
    notice: void 0
  };
  listeners = /* @__PURE__ */ new Set();
  customTargets = /* @__PURE__ */ new Map();
  nativeModels = /* @__PURE__ */ new Map();
  policyDirty = false;
  savedBehavior = { ...DEFAULT_BEHAVIOR };
  stop;
  disposed = false;
  form;
  grants;
  constructor(form, grants) {
    this.grants = grants;
    this.form = form;
    this.accept();
    this.stop = form.subscribe(() => {
      if (this.state.saving) return;
      if (!this.state.dirty) this.accept();
      else {
        const stale = form.getSnapshot().revision !== this.state.revision;
        this.publish({ ...this.state, stale, migrationConfirmed: stale ? false : this.state.migrationConfirmed });
      }
    });
  }
  getSnapshot = () => this.state;
  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  dispose() {
    this.disposed = true;
    this.stop();
    this.listeners.clear();
  }
  publish(state) {
    if (this.disposed) return;
    this.state = state;
    for (const listener of this.listeners) listener();
  }
  remember(draft, reset = false) {
    if (reset) {
      this.customTargets.clear();
      this.nativeModels.clear();
    }
    const targets = [["default", draft.defaultTarget]];
    for (const id of CATEGORY_IDS) {
      const binding2 = draft.categories[id];
      if (binding2.mode === "target") {
        this.customTargets.set(id, structuredClone(binding2.target));
        targets.push([id, binding2.target]);
      }
    }
    for (const [section, target2] of targets) {
      if (target2.executor === "native" && target2.model.mode === "explicit") this.nativeModels.set(section, structuredClone(target2));
    }
  }
  accept(notice) {
    const host = this.form.getSnapshot();
    const behavior = readBehaviorSettings(host.value);
    this.policyDirty = false;
    this.savedBehavior = behavior;
    try {
      const value = host.value === void 0 ? void 0 : routingFormPreview(host.value);
      const draft = value === void 0 ? void 0 : routingPolicyToDraft(value.policy);
      this.customTargets.clear();
      this.nativeModels.clear();
      if (draft) this.remember(draft, true);
      this.publish({
        draft,
        behavior: { ...behavior },
        revision: host.revision,
        dirty: false,
        saving: false,
        stale: false,
        migrationRequired: value?.required ?? false,
        migrationConfirmed: false,
        retired: value?.retired,
        issue: void 0,
        error: void 0,
        notice
      });
    } catch (error) {
      this.publish({
        ...this.state,
        draft: void 0,
        behavior: { ...behavior },
        revision: host.revision,
        dirty: false,
        saving: false,
        stale: false,
        migrationRequired: false,
        migrationConfirmed: false,
        retired: void 0,
        issue: void 0,
        error: { kind: "validation", detail: error instanceof Error ? error.message : String(error) },
        notice: void 0
      });
    }
  }
  edit(draft, revision = this.state.revision) {
    const host = this.form.getSnapshot();
    if (this.disposed || this.state.saving || host.status !== "ready" || !host.writable) return;
    const stale = host.revision !== revision;
    this.policyDirty = true;
    this.remember(draft);
    this.publish({
      ...this.state,
      draft: structuredClone(draft),
      revision,
      dirty: true,
      stale,
      migrationConfirmed: stale ? false : this.state.migrationConfirmed,
      issue: void 0,
      error: void 0,
      notice: void 0
    });
  }
  editBehavior(patch, revision = this.state.revision) {
    const host = this.form.getSnapshot();
    if (this.disposed || this.state.saving || host.status !== "ready" || !host.writable) return;
    const stale = host.revision !== revision;
    const behavior = {
      delegationMode: patch.delegationMode ?? this.state.behavior.delegationMode,
      enforceNativeSubagentRouting: patch.enforceNativeSubagentRouting ?? this.state.behavior.enforceNativeSubagentRouting
    };
    const behaviorDirty = behavior.delegationMode !== this.savedBehavior.delegationMode || behavior.enforceNativeSubagentRouting !== this.savedBehavior.enforceNativeSubagentRouting;
    this.publish({
      ...this.state,
      behavior,
      revision,
      dirty: this.policyDirty || behaviorDirty,
      stale,
      migrationConfirmed: stale ? false : this.state.migrationConfirmed,
      issue: void 0,
      error: void 0,
      notice: void 0
    });
  }
  /** Preserve dormant custom choices within this edit session, but never persist them in default bindings. */
  setCategoryMode(category2, mode, revision = this.state.revision) {
    const draft = this.state.draft;
    if (!draft || !CATEGORY_IDS.some((id) => id === category2)) return;
    const target2 = this.customTargets.get(category2) ?? { executor: "native", model: { mode: "inherit" } };
    this.edit({ ...draft, categories: { ...draft.categories, [category2]: mode === "default" ? { mode } : { mode, target: target2 } } }, revision);
  }
  /** Returning from inheritance restores the last explicit native choice until save/reload. */
  setNativeModelMode(section, mode, revision = this.state.revision, choice) {
    const draft = this.state.draft;
    if (!draft) return;
    const previous = this.nativeModels.get(section);
    const matches = previous?.executor === "native" && previous.model.mode === "explicit" && previous.model.provider === choice?.provider && previous.model.id === choice?.id;
    const target2 = mode === "inherit" ? { executor: "native", model: { mode: "inherit" } } : choice && !matches ? { executor: "native", model: { mode: "explicit", ...choice } } : previous ?? { executor: "native", model: { mode: "explicit", provider: "", id: "" } };
    this.edit(section === "default" ? { ...draft, defaultTarget: target2 } : { ...draft, categories: { ...draft.categories, [section]: { mode: "target", target: target2 } } }, revision);
  }
  discard() {
    if (!this.disposed && !this.state.saving) this.accept();
  }
  confirmMigration(revision = this.state.revision) {
    const host = this.form.getSnapshot();
    if (this.disposed || this.state.saving || !this.state.migrationRequired || host.status !== "ready" || !host.writable || revision === void 0 || revision !== this.state.revision || revision !== host.revision) return false;
    this.policyDirty = true;
    this.publish({ ...this.state, migrationConfirmed: true, dirty: true, error: void 0, notice: void 0 });
    return true;
  }
  applyRecommendations(preview, revision = this.state.revision) {
    const host = this.form.getSnapshot();
    if (this.disposed || this.state.saving || !this.state.draft || host.status !== "ready" || !host.writable) return false;
    try {
      if (revision === void 0 || revision !== host.revision || revision !== this.state.revision || preview.baselineFingerprint !== routingPolicyFingerprint(routingDraftToPolicy(this.state.draft))) {
        this.publish({ ...this.state, error: { kind: "previewChanged", detail: "" } });
        return false;
      }
      this.edit(routingPolicyToDraft(preview.policy), revision);
      return true;
    } catch (error) {
      this.publish({ ...this.state, error: { kind: "validation", detail: error instanceof Error ? error.message : String(error) } });
      return false;
    }
  }
  async save(options = {}) {
    const state = this.state;
    const host = this.form.getSnapshot();
    if (this.disposed || state.saving || !state.draft || state.revision === void 0 || host.status !== "ready" || !host.writable) return false;
    if (state.stale || host.revision !== state.revision) {
      this.publish({ ...state, stale: true, migrationConfirmed: false, error: { kind: "refused", detail: "" } });
      return false;
    }
    if (state.migrationRequired && !state.migrationConfirmed) {
      this.publish({ ...state, error: { kind: "migration", detail: "" } });
      return false;
    }
    const behaviorOps = [];
    if (state.behavior.delegationMode !== this.savedBehavior.delegationMode) {
      behaviorOps.push({ op: "set", path: ["delegationMode"], value: state.behavior.delegationMode });
    }
    if (state.behavior.enforceNativeSubagentRouting !== this.savedBehavior.enforceNativeSubagentRouting) {
      behaviorOps.push({ op: "set", path: ["enforceNativeSubagentRouting"], value: state.behavior.enforceNativeSubagentRouting });
    }
    const historyIssue = historyLimitIssue(state.draft);
    if (historyIssue) {
      this.publish({ ...state, issue: historyIssue, error: void 0, notice: void 0 });
      return false;
    }
    let parsedPolicy;
    try {
      parsedPolicy = routingDraftToPolicy(state.draft);
    } catch (error) {
      this.publish({ ...state, error: { kind: "validation", detail: error instanceof Error ? error.message : String(error) } });
      return false;
    }
    const required = requiredModelRoutes(parsedPolicy);
    const grant = planModelGrant(required, this.grants.getSnapshot());
    const behaviorOnly = !this.policyDirty && behaviorOps.length > 0 && grant.kind === "complete";
    if (!behaviorOnly) {
      const issue = routingDraftIssue(state.draft, options.catalog, options.catalogReady ?? options.catalog !== void 0);
      if (issue) {
        this.publish({ ...state, issue, error: void 0, notice: void 0 });
        return false;
      }
    }
    const mutations = [
      ...this.policyDirty ? routingPolicyMutations(parsedPolicy) : [],
      ...behaviorOps
    ];
    if (mutations.length === 0 && grant.kind === "complete") return false;
    if (grant.kind === "unavailable" || grant.kind === "readOnly") {
      this.publish({ ...state, error: { kind: grant.kind === "readOnly" ? "grantReadOnly" : "grantUnavailable", detail: "" }, notice: void 0 });
      return false;
    }
    this.publish({ ...state, saving: true, issue: void 0, error: void 0, notice: void 0 });
    try {
      if (mutations.length > 0 && !await this.form.mutate(mutations, state.revision)) {
        this.publish({
          ...state,
          saving: false,
          stale: this.form.getSnapshot().revision !== state.revision,
          error: { kind: "refused", detail: "" },
          notice: void 0
        });
        return false;
      }
    } catch (error) {
      this.publish({
        ...state,
        saving: false,
        stale: this.form.getSnapshot().revision !== state.revision,
        error: { kind: "transport", detail: error instanceof Error ? error.message : String(error) },
        notice: void 0
      });
      return false;
    }
    try {
      if (grant.kind === "write") {
        const accepted = await this.grants.mutate([
          { op: "set", path: ["enabled"], value: true },
          { op: "set", path: ["allowedModels"], value: grant.routes }
        ], grant.revision);
        if (!accepted) throw new Error("Authorization write refused");
      }
      if (planModelGrant(required, this.grants.getSnapshot()).kind !== "complete") throw new Error("Authorization not confirmed");
    } catch {
      this.accept();
      this.publish({ ...this.state, error: { kind: "grantFailed", detail: "" }, notice: void 0 });
      return false;
    }
    this.accept("saved");
    return true;
  }
};

// src/ui/settings-copy.ts
var NS = "teamRouter";
var en2 = {
  language: "en",
  title: "Team task routing",
  description: "Choose how the assistant delegates tasks and which models new teammates use.",
  behaviorTitle: "Delegation and validation",
  delegationMode: "Delegation mode",
  delegationPassive: "Passive",
  delegationPassiveNote: "Apply routing only when the assistant chooses to delegate.",
  delegationSpecialistFirst: "Specialist-first",
  delegationSpecialistNote: "Proactively delegate specialist work; handle small tasks directly.",
  delegationOrchestrator: "Orchestrator",
  delegationOrchestratorNote: "Specialists execute matching tasks; the lead plans and verifies.",
  delegationScope: "Root session only. Specialist routes must be authorized and differ in provider, model, or reasoning effort. Use the Host subagent (including via a bridge). Explicit requests to work directly take priority.",
  enforceRouting: "Strict native subagent validation",
  enforceHint: "Block calls that don\u2019t match this policy and ask the assistant to retry.",
  routingTitle: "Model routing",
  defaults: "Default fallback target",
  defaultPurpose: "Used by categories that follow the default.",
  specialist: "Specialist tasks",
  general: "General tasks",
  proactive: "Eligible for proactive delegation",
  useDefault: "Follow default",
  customized: "Customized",
  reset: "Reset to default",
  inherit: "Inherit session model",
  executor: "Executor",
  native: "DSH native teammate",
  executorDefault: "External agent default",
  externalBlocked: "External execution is not yet supported. Saved selections are retained, but they do not indicate installation or authentication.",
  searchModels: "Search models",
  searchKeys: "Use the arrow keys to move from search to an option, and Enter to select it.",
  noModels: "No matching models",
  moreModels: "Show more models",
  provider: "Provider",
  model: "Model",
  effort: "Reasoning effort",
  modelDefault: "Model default",
  chooseModel: "Choose a model",
  unavailableOption: "{name} (unavailable)",
  loading: "Loading Host configuration\u2026",
  unavailable: "The team-router configuration is not served by this Host.",
  readOnly: "This Host configuration is read-only.",
  catalogLoading: "Loading model catalog\u2026",
  catalogError: "Could not load the catalog: {message}",
  catalogPartial: "Some providers failed: {message}",
  retry: "Retry catalog",
  recommendations: "Preview recommendations",
  recommendationHint: "Version {version}. Uses curated model IDs, not benchmark rankings. Unmatched categories keep their targets.",
  overwrite: "Overwrite customized",
  previewTitle: "Review recommended changes",
  before: "Current:",
  after: "Recommended:",
  previewHint: "These changes only update the draft. Save to apply them. The default target stays the same.",
  applyPreview: "Apply to draft",
  cancelPreview: "Keep current draft",
  noChanges: "No matching changes to apply.",
  preserved: "Customized targets kept: {count}",
  unmatched: "No matching candidate: {count}",
  previewChanged: "The draft, Host revision, or catalog changed since the preview opened. Generate a new preview.",
  migrationTitle: "Confirm legacy policy migration",
  migrationHint: "Saving V2 retires legacy named routes, keyword rules, exact-name roles, and old member overrides. The Host must back up the legacy policy before committing. Only the old default model is mapped automatically.",
  migrationCounts: "{routes} named routes, {rules} task rules, {roles} role mappings will stop participating in routing.",
  confirmMigration: "Confirm migration",
  migrationConfirmed: "Migration confirmed for this revision. Save to commit.",
  migrationRequired: "Confirm migration before saving. Your draft is preserved.",
  advanced: "Advanced settings",
  historyLimit: "History limit (1\u20131000)",
  save: "Save changes",
  saving: "Saving\u2026",
  cancel: "Undo edits",
  reload: "Discard draft and reload",
  saved: "Saved",
  dirty: "Unsaved changes",
  current: "Up to date",
  needsGrant: "Save will also update model authorization",
  draftStale: "Draft is out of date",
  migrationPending: "Migration confirmation required",
  saveProblem: "Configuration needs attention",
  authorizationUnavailable: "Save blocked: authorization unavailable",
  authorizationReadOnly: "Save blocked: authorization is read-only",
  reviewProblem: "Review problem",
  stale: "The Host changed while you were editing. Your draft is preserved; reload before saving.",
  refused: "The Host refused this save. Your draft is preserved; no automatic overwrite was attempted.",
  grantFailed: "Routing policy is saved, but model authorization could not be confirmed. Retry Save.",
  validationError: "Invalid policy: {message}",
  transportError: "Save failed: {message}. Your draft is preserved.",
  required: "This field is required.",
  history: "Enter an integer from 1 to 1000.",
  catalog: "This provider, model, or effort is not available in the live catalog.",
  catalogRequired: "A current model catalog is required for explicit native models. Inherited targets do not require it.",
  externalUnavailable: "External execution is not supported. Select a native target before saving.",
  structure: "The policy structure is invalid."
};
var zh2 = {
  language: "zh",
  title: "\u56E2\u961F\u4EFB\u52A1\u8DEF\u7531",
  description: "\u8BBE\u7F6E\u4E3B\u52A9\u624B\u7684\u59D4\u6D3E\u65B9\u5F0F\uFF0C\u4EE5\u53CA\u65B0\u961F\u53CB\u4F7F\u7528\u7684\u6A21\u578B\u3002",
  behaviorTitle: "\u59D4\u6D3E\u4E0E\u6821\u9A8C",
  delegationMode: "\u59D4\u6D3E\u6A21\u5F0F",
  delegationPassive: "\u88AB\u52A8\u8DEF\u7531",
  delegationPassiveNote: "\u4EC5\u5728\u4E3B\u52A9\u624B\u4E3B\u52A8\u8C03\u7528\u5B50\u667A\u80FD\u4F53\u65F6\u5E94\u7528\u8DEF\u7531\u3002",
  delegationSpecialistFirst: "\u4E13\u957F\u4F18\u5148",
  delegationSpecialistNote: "\u4E3B\u52A8\u59D4\u6D3E\u4E13\u957F\u4EFB\u52A1\uFF0C\u7B80\u5355\u4EFB\u52A1\u7531\u4E3B\u52A9\u624B\u5904\u7406\u3002",
  delegationOrchestrator: "\u7F16\u6392\u8005",
  delegationOrchestratorNote: "\u4E13\u957F\u6A21\u578B\u6267\u884C\u5339\u914D\u4EFB\u52A1\uFF0C\u4E3B\u52A9\u624B\u8D1F\u8D23\u62C6\u89E3\u548C\u9A8C\u6536\u3002",
  delegationScope: "\u4EC5\u5728\u4E3B\u4F1A\u8BDD\u751F\u6548\u3002\u4E13\u957F\u8DEF\u7531\u987B\u5DF2\u6388\u6743\uFF0C\u4E14\u4F9B\u5E94\u5546\u3001\u6A21\u578B\u6216\u63A8\u7406\u5F3A\u5EA6\u4E0E\u4E3B\u52A9\u624B\u4E0D\u540C\u3002\u8BF7\u4F7F\u7528\u5BBF\u4E3B\u5B50\u667A\u80FD\u4F53\uFF08\u5305\u62EC\u6865\u63A5\u5165\u53E3\uFF09\u3002\u7528\u6237\u660E\u786E\u8981\u6C42\u76F4\u63A5\u5904\u7406\u65F6\uFF0C\u4EE5\u8BE5\u8981\u6C42\u4E3A\u51C6\u3002",
  enforceRouting: "\u4E25\u683C\u6821\u9A8C\u539F\u751F\u5B50\u667A\u80FD\u4F53",
  enforceHint: "\u62E6\u622A\u4E0D\u5339\u914D\u8DEF\u7531\u7684\u8C03\u7528\uFF0C\u5E76\u63D0\u793A\u4E3B\u52A9\u624B\u6309\u914D\u7F6E\u91CD\u8BD5\u3002",
  routingTitle: "\u6A21\u578B\u8DEF\u7531",
  defaults: "\u9ED8\u8BA4\u515C\u5E95\u6A21\u578B",
  defaultPurpose: "\u8DDF\u968F\u9ED8\u8BA4\u7684\u4EFB\u52A1\u7C7B\u522B\u4F7F\u7528\u6B64\u6A21\u578B\u3002",
  specialist: "\u4E13\u957F\u4EFB\u52A1",
  general: "\u57FA\u7840\u4EFB\u52A1",
  proactive: "\u53EF\u53C2\u4E0E\u4E3B\u52A8\u59D4\u6D3E",
  useDefault: "\u8DDF\u968F\u9ED8\u8BA4",
  customized: "\u5DF2\u81EA\u5B9A\u4E49",
  reset: "\u6062\u590D\u8DDF\u968F\u9ED8\u8BA4",
  inherit: "\u7EE7\u627F\u4F1A\u8BDD\u6A21\u578B",
  executor: "\u6267\u884C\u5668",
  native: "DSH \u539F\u751F\u961F\u53CB",
  executorDefault: "\u5916\u90E8\u667A\u80FD\u4F53\u7684\u9ED8\u8BA4\u6A21\u578B",
  externalBlocked: "\u76EE\u524D\u4E0D\u652F\u6301\u5916\u90E8\u6267\u884C\u3002\u5DF2\u4FDD\u5B58\u7684\u9009\u9879\u4F1A\u4FDD\u7559\uFF0C\u4F46\u4E0D\u4EE3\u8868\u76F8\u5E94\u5DE5\u5177\u5DF2\u5B89\u88C5\u6216\u5DF2\u8BA4\u8BC1\u3002",
  searchModels: "\u641C\u7D22\u6A21\u578B",
  searchKeys: "\u4F7F\u7528\u65B9\u5411\u952E\u4ECE\u641C\u7D22\u6846\u79FB\u5230\u9009\u9879\uFF0C\u6309\u56DE\u8F66\u9009\u62E9\u3002",
  noModels: "\u6CA1\u6709\u5339\u914D\u7684\u6A21\u578B",
  moreModels: "\u663E\u793A\u66F4\u591A\u6A21\u578B",
  provider: "\u4F9B\u5E94\u5546",
  model: "\u6A21\u578B",
  effort: "\u63A8\u7406\u5F3A\u5EA6",
  modelDefault: "\u6A21\u578B\u9ED8\u8BA4",
  chooseModel: "\u9009\u62E9\u6A21\u578B",
  unavailableOption: "{name}\uFF08\u4E0D\u53EF\u7528\uFF09",
  loading: "\u6B63\u5728\u8BFB\u53D6 Host \u914D\u7F6E\u2026",
  unavailable: "\u5F53\u524D Host \u672A\u63D0\u4F9B team-router \u914D\u7F6E\u9879\u3002",
  readOnly: "\u5F53\u524D Host \u914D\u7F6E\u4E3A\u53EA\u8BFB\u3002",
  catalogLoading: "\u6B63\u5728\u8BFB\u53D6\u6A21\u578B\u76EE\u5F55\u2026",
  catalogError: "\u65E0\u6CD5\u8BFB\u53D6\u6A21\u578B\u76EE\u5F55\uFF1A{message}",
  catalogPartial: "\u90E8\u5206\u4F9B\u5E94\u5546\u8BFB\u53D6\u5931\u8D25\uFF1A{message}",
  retry: "\u91CD\u8BD5\u8BFB\u53D6\u76EE\u5F55",
  recommendations: "\u9884\u89C8\u63A8\u8350\u914D\u7F6E",
  recommendationHint: "\u63A8\u8350\u7248\u672C {version}\u3002\u4F7F\u7528\u4EBA\u5DE5\u7EF4\u62A4\u7684\u6A21\u578B\u6807\u8BC6\uFF0C\u4E0D\u4EE3\u8868\u57FA\u51C6\u6700\u4F18\uFF1B\u65E0\u5339\u914D\u9879\u65F6\u4FDD\u7559\u73B0\u6709\u76EE\u6807\u3002",
  overwrite: "\u8986\u76D6\u5DF2\u81EA\u5B9A\u4E49\u7684\u76EE\u6807",
  previewTitle: "\u786E\u8BA4\u63A8\u8350\u914D\u7F6E\u5DEE\u5F02",
  before: "\u5F53\u524D\u914D\u7F6E\uFF1A",
  after: "\u63A8\u8350\u914D\u7F6E\uFF1A",
  previewHint: "\u786E\u8BA4\u540E\u4EC5\u66F4\u65B0\u8349\u7A3F\uFF0C\u4FDD\u5B58\u540E\u624D\u4F1A\u751F\u6548\uFF1B\u4E0D\u4F1A\u4FEE\u6539\u9ED8\u8BA4\u515C\u5E95\u6A21\u578B\u3002",
  applyPreview: "\u5E94\u7528\u5230\u8349\u7A3F",
  cancelPreview: "\u4FDD\u7559\u5F53\u524D\u8349\u7A3F",
  noChanges: "\u5F53\u524D\u6CA1\u6709\u53EF\u5E94\u7528\u7684\u5339\u914D\u53D8\u66F4\u3002",
  preserved: "\u4FDD\u7559\u81EA\u5B9A\u4E49\u76EE\u6807\uFF1A{count}",
  unmatched: "\u65E0\u5339\u914D\u5019\u9009\uFF1A{count}",
  previewChanged: "\u9884\u89C8\u6253\u5F00\u540E\u8349\u7A3F\u3001Host \u7248\u672C\u6216\u6A21\u578B\u76EE\u5F55\u53D1\u751F\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u751F\u6210\u9884\u89C8\u3002",
  migrationTitle: "\u786E\u8BA4\u8FC1\u79FB\u65E7\u8DEF\u7531\u7B56\u7565",
  migrationHint: "\u4FDD\u5B58 V2 \u540E\uFF0C\u65E7\u547D\u540D\u8DEF\u7531\u3001\u5173\u952E\u8BCD\u89C4\u5219\u3001\u7CBE\u786E\u961F\u53CB\u89D2\u8272\u548C\u6210\u5458\u8986\u76D6\u4E0D\u518D\u53C2\u4E0E\u8DEF\u7531\u3002Host \u5FC5\u987B\u5148\u5907\u4EFD\u65E7\u914D\u7F6E\u518D\u63D0\u4EA4\uFF1B\u4EC5\u65E7\u9ED8\u8BA4\u6A21\u578B\u4F1A\u81EA\u52A8\u6620\u5C04\u3002",
  migrationCounts: "\u5C06\u505C\u7528 {routes} \u6761\u547D\u540D\u8DEF\u7531\u3001{rules} \u6761\u4EFB\u52A1\u89C4\u5219\u3001{roles} \u6761\u89D2\u8272\u6620\u5C04\u3002",
  confirmMigration: "\u786E\u8BA4\u8FC1\u79FB",
  migrationConfirmed: "\u5DF2\u786E\u8BA4\u6B64\u7248\u672C\u7684\u8FC1\u79FB\uFF0C\u70B9\u51FB\u4FDD\u5B58\u540E\u63D0\u4EA4\u3002",
  migrationRequired: "\u4FDD\u5B58\u524D\u8BF7\u660E\u786E\u786E\u8BA4\u8FC1\u79FB\uFF0C\u8349\u7A3F\u5DF2\u4FDD\u7559\u3002",
  advanced: "\u9AD8\u7EA7\u8BBE\u7F6E",
  historyLimit: "\u5386\u53F2\u8BB0\u5F55\u4E0A\u9650\uFF081\u20131000\uFF09",
  save: "\u4FDD\u5B58\u4FEE\u6539",
  saving: "\u4FDD\u5B58\u4E2D\u2026",
  cancel: "\u64A4\u9500\u4FEE\u6539",
  reload: "\u4E22\u5F03\u8349\u7A3F\u5E76\u91CD\u65B0\u8BFB\u53D6",
  saved: "\u5DF2\u4FDD\u5B58",
  dirty: "\u6709\u672A\u4FDD\u5B58\u4FEE\u6539",
  current: "\u5DF2\u540C\u6B65",
  needsGrant: "\u4FDD\u5B58\u65F6\u4F1A\u540C\u65F6\u8865\u9F50\u6A21\u578B\u6388\u6743",
  draftStale: "\u8349\u7A3F\u7248\u672C\u5DF2\u8FC7\u671F",
  migrationPending: "\u9700\u8981\u786E\u8BA4\u8FC1\u79FB",
  saveProblem: "\u914D\u7F6E\u9700\u8981\u5904\u7406",
  authorizationUnavailable: "\u65E0\u6CD5\u4FDD\u5B58\uFF1A\u6A21\u578B\u6388\u6743\u4E0D\u53EF\u7528",
  authorizationReadOnly: "\u65E0\u6CD5\u4FDD\u5B58\uFF1A\u6A21\u578B\u6388\u6743\u4E3A\u53EA\u8BFB",
  reviewProblem: "\u67E5\u770B\u95EE\u9898",
  stale: "\u7F16\u8F91\u671F\u95F4 Host \u914D\u7F6E\u5DF2\u66F4\u65B0\u3002\u8349\u7A3F\u5DF2\u4FDD\u7559\uFF0C\u8BF7\u91CD\u65B0\u8BFB\u53D6\u540E\u518D\u4FDD\u5B58\u3002",
  refused: "Host \u62D2\u7EDD\u4E86\u672C\u6B21\u4FDD\u5B58\uFF0C\u8349\u7A3F\u5DF2\u4FDD\u7559\uFF1B\u6CA1\u6709\u5C1D\u8BD5\u81EA\u52A8\u8986\u76D6\u5176\u4ED6\u4FEE\u6539\u3002",
  grantFailed: "\u8DEF\u7531\u5DF2\u4FDD\u5B58\uFF0C\u4F46\u672A\u80FD\u786E\u8BA4\u6A21\u578B\u6388\u6743\u3002\u8BF7\u518D\u6B21\u4FDD\u5B58\u91CD\u8BD5\u3002",
  validationError: "\u7B56\u7565\u4E0D\u5408\u6CD5\uFF1A{message}",
  transportError: "\u4FDD\u5B58\u5931\u8D25\uFF1A{message}\u3002\u8349\u7A3F\u5DF2\u4FDD\u7559\u3002",
  required: "\u6B64\u9879\u4E0D\u80FD\u4E3A\u7A7A\u3002",
  history: "\u8BF7\u8F93\u5165 1 \u81F3 1000 \u4E4B\u95F4\u7684\u6574\u6570\u3002",
  catalog: "\u4F9B\u5E94\u5546\u3001\u6A21\u578B\u6216\u63A8\u7406\u5F3A\u5EA6\u4E0D\u5728\u5F53\u524D\u5B9E\u65F6\u76EE\u5F55\u4E2D\u3002",
  catalogRequired: "\u6307\u5B9A\u539F\u751F\u6A21\u578B\u9700\u8981\u5F53\u524D\u6709\u6548\u76EE\u5F55\uFF1B\u7EE7\u627F\u6A21\u578B\u4E0D\u4F9D\u8D56\u76EE\u5F55\u8BFB\u53D6\u6210\u529F\u3002",
  externalUnavailable: "\u76EE\u524D\u4E0D\u652F\u6301\u5916\u90E8\u6267\u884C\uFF0C\u8BF7\u5207\u6362\u4E3A\u539F\u751F\u76EE\u6807\u540E\u4FDD\u5B58\u3002",
  structure: "\u7B56\u7565\u7ED3\u6784\u4E0D\u5408\u6CD5\u3002"
};

// src/ui/settings-styles.tsx
var React4 = require("react");
var import_jsx_runtime4 = require("react/jsx-runtime");
var CSS = `
.dtr-editor {
  --dtr-ink: var(--dsw-alias-label-primary);
  --dtr-muted: var(--dsw-alias-label-secondary);
  --dtr-base: var(--dsw-alias-bg-base);
  --dtr-surface: var(--dsw-alias-bg-layer-1);
  --dtr-raised: var(--dsw-alias-bg-layer-2, var(--dtr-surface));
  --dtr-subtle: var(--dsw-alias-bg-module-platform, var(--dsw-alias-interactive-bg-hover));
  --dtr-border: var(--dsw-alias-border-l3);
  --dtr-outline: var(--dsw-alias-border-selected, var(--dtr-border));
  --dtr-brand: var(--dsw-alias-brand-primary);
  --dtr-on-brand: var(--dsw-alias-label-primary-foreground, var(--dtr-base));
  --dtr-accent: var(--dsw-alias-state-business-primary, var(--dtr-brand));
  --dtr-tint: color-mix(in srgb, var(--dtr-accent) 9%, var(--dtr-surface));
  --dtr-shadow: color-mix(in srgb, var(--dtr-ink) 10%, transparent);
  --dtr-warn: var(--dsw-alias-state-warn-primary);
  --dtr-error: var(--dsw-alias-state-error-primary);
  --dtr-success: var(--dsw-alias-state-success-primary);
  container: dtr-editor / inline-size;
  color: var(--dtr-ink);
  font-size: 14px;
  line-height: 1.45;
  inline-size: 100%;
  max-inline-size: 69rem;
  min-inline-size: 0;
  margin-inline: auto;
  padding-block: 4px 0;
}
.dtr-editor * { box-sizing: border-box; }
.dtr-editor :is(h2, h3, h4, p, ul) { margin: 0; }
.dtr-editor h2 { font-size: 21px; line-height: 1.3; font-weight: 650; }
.dtr-editor h3 { font-size: 16px; line-height: 1.35; font-weight: 650; }
.dtr-editor h4 { font-size: 14px; font-weight: 650; }
.dtr-editor svg { display: block; flex: none; inline-size: 16px; block-size: 16px; }
.dtr-muted { color: var(--dtr-muted); font-size: 13px; }
.dtr-header, .dtr-stack { display: grid; gap: 6px; }
.dtr-section { display: grid; gap: 12px; margin-block-start: 24px; }
.dtr-card { border: 1px solid var(--dtr-border); border-radius: 12px; background: var(--dtr-surface); }
.dtr-note { display: grid; gap: 8px; padding: 12px 14px; overflow-wrap: anywhere; }
.dtr-inline { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.dtr-editor fieldset { border: 0; margin: 0; padding: 0; min-inline-size: 0; }
.dtr-editor :where(button, input, select, summary, [tabindex]) { scroll-margin-block: 12px 90px; }
.dtr-editor :where(button, input, select) {
  font: inherit;
  font-size: 13px;
  color: inherit;
  border: 1px solid var(--dtr-border);
  border-radius: 8px;
  background: var(--dtr-base);
  min-inline-size: 0;
}
.dtr-editor :where(button, summary) { cursor: pointer; }
.dtr-editor :where(button, select, input:not([type=checkbox])) { min-block-size: 34px; padding: 6px 10px; }
.dtr-editor :where(select, input:not([type=checkbox])) { inline-size: 100%; }
.dtr-editor :where(button, select, input, summary) { transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease; }
.dtr-editor :where(button, summary):hover:not(:disabled) { background-color: var(--dsw-alias-interactive-bg-hover); }
.dtr-editor :focus-visible { outline: 2px solid var(--dtr-accent); outline-offset: 2px; }
.dtr-editor :where(button, input, select):disabled { opacity: .55; cursor: not-allowed; }
.dtr-editor [aria-invalid=true] { border-color: var(--dtr-error); }
.dtr-editor button.dtr-primary { background-color: var(--dtr-brand); color: var(--dtr-on-brand); border-color: var(--dtr-brand); font-weight: 650; }
.dtr-editor button.dtr-primary:hover:not(:disabled) { background-color: color-mix(in srgb, var(--dtr-brand) 86%, var(--dtr-base)); }
.dtr-field { display: grid; gap: 4px; min-inline-size: 0; color: var(--dtr-muted); font-size: 12px; }
.dtr-editor .dtr-field :where(input, select, button) { color: var(--dtr-ink); }
.dtr-sr-only { position: absolute; inline-size: 1px; block-size: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.dtr-mode-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.dtr-editor .dtr-mode {
  contain: layout style;
  display: grid;
  grid-template-columns: 1fr auto;
  align-content: start;
  align-items: center;
  gap: 6px 8px;
  padding: 12px;
  border-radius: 12px;
  text-align: start;
  background: var(--dtr-surface);
}
.dtr-mode-icon { display: grid; place-items: center; inline-size: 29px; block-size: 29px; border-radius: 8px; background: var(--dtr-subtle); }
.dtr-mode-check { align-self: center; color: var(--dtr-accent); }
.dtr-mode-title { grid-column: 1 / -1; font-weight: 650; font-size: 14px; }
.dtr-mode-copy { grid-column: 1 / -1; color: var(--dtr-muted); font-size: 12px; }
.dtr-editor .dtr-mode[aria-checked=true], .dtr-editor .dtr-mode[aria-checked=true]:hover:not(:disabled) { border-color: var(--dtr-accent); background-color: var(--dtr-tint); }
.dtr-mode[aria-checked=true] .dtr-mode-icon { color: var(--dtr-accent); }
.dtr-scope { display: flex; gap: 8px; align-items: start; padding-inline: 2px; }
.dtr-scope svg { margin-block-start: 2px; }
.dtr-toggle-row { display: flex; gap: 12px; align-items: center; justify-content: space-between; padding: 11px 14px; }
.dtr-toggle-row strong { display: block; margin-block-end: 2px; font-weight: 650; }
.dtr-editor .dtr-switch { position: relative; flex: none; inline-size: 42px; block-size: 24px; min-block-size: 0; padding: 0; border-radius: 999px; border-color: var(--dtr-outline); background-color: var(--dtr-subtle); }
.dtr-editor .dtr-switch::after { content: ''; position: absolute; inset-block-start: 3px; inset-inline-start: 3px; inline-size: 16px; block-size: 16px; border-radius: 50%; background: var(--dtr-muted); transition: transform 140ms ease, background-color 140ms ease; }
.dtr-editor .dtr-switch[aria-checked=true], .dtr-editor .dtr-switch[aria-checked=true]:hover:not(:disabled) { border-color: var(--dtr-brand); background-color: var(--dtr-brand); }
.dtr-editor .dtr-switch[aria-checked=true]::after { transform: translateX(18px); background: var(--dtr-on-brand); }
.dtr-editor .dtr-switch[aria-checked=true]:dir(rtl)::after { transform: translateX(-18px); }

.dtr-toolbar { justify-content: space-between; align-items: center; gap: 8px 14px; }
.dtr-toolset { gap: 8px 12px; }
.dtr-check { cursor: pointer; gap: 6px; }
.dtr-check input { accent-color: var(--dtr-brand); margin: 0; }
.dtr-catalog-status { padding: 8px 10px; overflow-wrap: anywhere; }
.dtr-catalog-status p { flex: 1 1 10rem; }
.dtr-group { display: grid; gap: 6px; }
.dtr-group + .dtr-group { margin-block-start: 4px; }
.dtr-group-heading { gap: 6px 8px; padding: 0 2px; }
.dtr-pill { display: inline-block; font-size: 11px; line-height: 1.4; color: var(--dtr-muted); border-radius: 999px; background: var(--dtr-subtle); padding: 2px 7px; }
.dtr-pill-brand { color: var(--dtr-ink); background: var(--dtr-tint); }
.dtr-count { color: var(--dtr-muted); font-size: 12px; font-variant-numeric: tabular-nums; }
.dtr-route {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
  gap: 8px 14px;
  align-items: center;
  padding: 10px 12px;
  min-inline-size: 0;
}
.dtr-route-default { border-color: color-mix(in srgb, var(--dtr-accent) 30%, var(--dtr-border)); background: var(--dtr-raised); padding: 13px 12px; box-shadow: 0 1px 3px var(--dtr-shadow); }
.dtr-route-title { gap: 4px 6px; }
.dtr-route-id { color: var(--dtr-muted); font-size: 11px; padding-inline: 3px; overflow-wrap: anywhere; }
.dtr-route-purpose { color: var(--dtr-muted); font-size: 12px; overflow-wrap: anywhere; }
.dtr-controls { display: flex; flex-wrap: wrap; align-items: end; gap: 8px; min-inline-size: 0; }
.dtr-controls .dtr-picker { flex: 1 1 8rem; }
.dtr-effort { flex: 0 1 8rem; }
.dtr-executor, .dtr-legacy-model { flex: 1 1 8rem; }
.dtr-legacy-model strong { display: flex; align-items: center; min-block-size: 34px; color: var(--dtr-ink); font-weight: 550; overflow-wrap: anywhere; }
.dtr-route .dtr-warning { grid-column: 1 / -1; }
.dtr-editor .dtr-icon-button { display: grid; place-items: center; inline-size: 34px; padding: 0; color: var(--dtr-muted); background: transparent; }

.dtr-picker { position: relative; }
.dtr-editor .dtr-trigger { inline-size: 100%; display: flex; align-items: center; justify-content: space-between; gap: 6px; text-align: start; }
.dtr-trigger-copy { display: flex; align-items: baseline; min-inline-size: 0; gap: 6px; }
.dtr-trigger-name, .dtr-trigger-detail { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dtr-trigger-name { flex: 0 1 auto; }
.dtr-trigger-detail { flex: 1 1 auto; color: var(--dtr-muted); font-size: 12px; }
.dtr-trigger[data-follows=true] .dtr-trigger-name { color: var(--dtr-muted); }
.dtr-menu {
  position: absolute;
  z-index: 20;
  inset: auto;
  inset-inline-end: 0;
  inset-block-start: calc(100% + 4px);
  inline-size: max(100%, min(20rem, 88cqw));
  max-block-size: var(--dtr-menu-available, min(28rem, 57vh));
  margin: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 8px;
  color: var(--dtr-ink);
  border: 1px solid var(--dtr-border);
  border-radius: 10px;
  background: var(--dtr-raised);
  box-shadow: 0 5px 18px var(--dtr-shadow);
}
.dtr-menu[data-up=true]:not([popover]) { inset-block-start: auto; inset-block-end: calc(100% + 4px); }
.dtr-menu[popover] { position: fixed; inset: auto; left: var(--dtr-menu-left); inline-size: var(--dtr-menu-width); }
.dtr-menu[popover][data-up=false] { top: var(--dtr-menu-edge); }
.dtr-menu[popover][data-up=true] { bottom: var(--dtr-menu-edge); }
.dtr-menu[popover]:not(:popover-open) { display: none; }
.dtr-menu input { flex: none; }
.dtr-options { overflow: auto; overscroll-behavior: contain; margin-block-start: 6px; }
.dtr-option-group-label { padding: 8px 8px 3px; font-size: 11px; font-weight: 650; color: var(--dtr-muted); }
.dtr-editor .dtr-option { display: flex; align-items: center; justify-content: space-between; inline-size: 100%; text-align: start; gap: 8px; border: 0; background-color: transparent; overflow-wrap: anywhere; }
.dtr-editor .dtr-option[aria-pressed=true] { background-color: var(--dtr-tint); }
.dtr-option svg { color: var(--dtr-accent); }
.dtr-option-detail { display: block; color: var(--dtr-muted); font-size: 11px; }
.dtr-options :focus-visible { outline-offset: -2px; }
.dtr-options .dtr-muted { padding: 6px 8px; }

.dtr-advanced summary, .dtr-diagnostics summary { padding: 10px 12px; border-radius: 10px; font-weight: 650; }
.dtr-advanced-body { display: grid; gap: 10px; padding: 2px 12px 12px; }
.dtr-history { max-inline-size: 12rem; }
.dtr-preview-list { display: grid; gap: 7px; list-style: none; padding: 0; }
.dtr-preview-list li { display: grid; gap: 4px; }
.dtr-diff { gap: 4px 6px; }
.dtr-diff .dtr-pill { border-radius: 6px; }
.dtr-diff svg { color: var(--dtr-muted); }
.dtr-feedback { display: grid; gap: 8px; margin-block-start: 14px; }
.dtr-feedback:empty { display: none; }
.dtr-warning, .dtr-error { border-inline-start: 2px solid var(--dtr-warn); padding-inline-start: 9px; overflow-wrap: anywhere; }
.dtr-error { border-inline-start-color: var(--dtr-error); }
.dtr-diagnostics { border-inline-start: 2px solid var(--dtr-warn); }
.dtr-diagnostics details { border: 1px solid var(--dtr-border); border-radius: 8px; }
.dtr-diagnostics pre { margin: 0; padding: 0 12px 10px; color: var(--dtr-muted); white-space: pre-wrap; overflow-wrap: anywhere; }
.dtr-footer {
  position: sticky;
  z-index: 5;
  inset-block-end: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 12px;
  margin-block-start: 14px;
  padding: 9px 2px;
  border-block-start: 1px solid var(--dtr-border);
  background: var(--dtr-base);
  box-shadow: 0 -6px 10px -8px var(--dtr-shadow);
}
.dtr-footer-actions { margin-inline-start: auto; }
.dtr-status { display: inline-flex; align-items: center; gap: 7px; }
.dtr-status::before { content: ''; inline-size: 7px; block-size: 7px; flex: none; border-radius: 50%; background: var(--dtr-muted); }
.dtr-status:is([data-status=dirty], [data-status=needsGrant], [data-status=draftStale], [data-status=migrationPending])::before { background: var(--dtr-warn); }
.dtr-status:is([data-status=saveProblem], [data-status=authorizationUnavailable], [data-status=authorizationReadOnly])::before { background: var(--dtr-error); }
.dtr-status[data-status=saved]::before { background: var(--dtr-success); }
.dtr-editor button.dtr-review-problem { border: 0; background: transparent; min-block-size: 28px; padding: 2px 6px; text-decoration: underline; text-underline-offset: .18em; }
.dtr-editor button.dtr-review-problem:hover { background: var(--dsw-alias-interactive-bg-hover); }

@container dtr-editor (max-width: 36rem) {
  .dtr-mode-grid, .dtr-route { grid-template-columns: minmax(0, 1fr); }
  .dtr-editor .dtr-mode { grid-template-columns: auto minmax(0, 1fr) auto; column-gap: 9px; }
  .dtr-mode-icon { grid-area: 1 / 1; }
  .dtr-mode-title { grid-area: 1 / 2; }
  .dtr-mode-check { grid-area: 1 / 3; }
  .dtr-mode-copy { grid-column: 2 / -1; }
}
@media (prefers-reduced-motion: reduce) {
  .dtr-editor *, .dtr-editor *::after { transition: none !important; }
}
`;
var editorStyles = /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("style", { children: CSS });

// src/ui/client.tsx
var import_jsx_runtime5 = require("react/jsx-runtime");
var DELEGATION_COPY = {
  passive: { label: "delegationPassive", note: "delegationPassiveNote" },
  "specialist-first": { label: "delegationSpecialistFirst", note: "delegationSpecialistNote" },
  orchestrator: { label: "delegationOrchestrator", note: "delegationOrchestratorNote" }
};
var SPECIALIST_TASKS = CATEGORY_LIST.filter((category2) => PROACTIVE_SPECIALIST_CATEGORIES.has(category2.id));
var GENERAL_TASKS = CATEGORY_LIST.filter((category2) => !PROACTIVE_SPECIALIST_CATEGORIES.has(category2.id));
function DelegationSettings({ t, id, mode, enforced, onMode, onToggle }) {
  const scope = mode !== "passive";
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("section", { className: "dtr-section", "aria-labelledby": `${id}-title`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h3", { id: `${id}-title`, children: t("behaviorTitle") }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { id: `${id}-mode`, className: "dtr-sr-only", children: t("delegationMode") }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { role: "radiogroup", "aria-labelledby": `${id}-mode`, "aria-describedby": scope ? `${id}-scope` : void 0, className: "dtr-mode-grid", onKeyDown: (event) => {
      if (event.nativeEvent.isComposing) return;
      const index = DELEGATION_MODES.indexOf(mode);
      const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
      const step = event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight") ? 1 : event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft") ? -1 : 0;
      const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? DELEGATION_MODES.length - 1 : step !== 0 ? (index + step + DELEGATION_MODES.length) % DELEGATION_MODES.length : -1;
      const next = DELEGATION_MODES[nextIndex];
      if (next === void 0) return;
      event.preventDefault();
      onMode(next);
      event.currentTarget.querySelectorAll('[role="radio"]')[nextIndex]?.focus();
    }, children: DELEGATION_MODES.map((option) => {
      const active = mode === option;
      const label = `${id}-${option}`;
      return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("button", { type: "button", role: "radio", "aria-checked": active, "aria-labelledby": label, "aria-describedby": `${label}-note`, tabIndex: active ? 0 : -1, className: "dtr-mode", onClick: () => {
        if (!active) onMode(option);
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "dtr-mode-icon", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: option }) }),
        active && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "dtr-mode-check", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: "check" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "dtr-mode-title", id: label, children: t(DELEGATION_COPY[option].label) }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "dtr-mode-copy", id: `${label}-note`, children: t(DELEGATION_COPY[option].note) })
      ] }, option);
    }) }),
    scope && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { className: "dtr-muted dtr-scope", id: `${id}-scope`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: "info" }),
      t("delegationScope")
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "dtr-card dtr-toggle-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { id: `${id}-switch`, children: t("enforceRouting") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { id: `${id}-switch-hint`, className: "dtr-muted", children: t("enforceHint") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", role: "switch", "aria-checked": enforced, "aria-labelledby": `${id}-switch`, "aria-describedby": `${id}-switch-hint`, className: "dtr-switch", onClick: onToggle })
    ] })
  ] });
}
var inject = ["slots", "locale", "configForms", "remote", "remote.session"];
function apply(ctx) {
  const client = ctx;
  ctx.effect(() => client.locale.register(NS, { en: en2, zh: zh2 }), "team-router: editor dictionaries");
  const form = client.configForms.get("team-router");
  const grants = client.configForms.get(MODEL_AUTHORIZATION_ENTRY);
  let reader;
  const inventory = () => reader;
  const optional = ctx;
  optional.inject(["remote.pluginManager"], (child) => {
    reader = child.remote.pluginManager;
    child.effect(() => () => {
      reader = void 0;
    }, "team-router: release diagnostics reader");
  });
  let describe;
  optional.inject(["remote.settings"], (child) => {
    const settings = child.remote.settings;
    describe = () => settings.describe();
    child.effect(() => () => {
      describe = void 0;
    }, "team-router: release settings probe");
  });
  const recheck = async () => {
    const reply = await describe?.();
    if (!reply?.ok) return "unknown";
    const row = reply.value.namespaces.find((item) => item.ns === MODEL_AUTHORIZATION_ENTRY);
    const v = row?.value;
    return row && Number.isSafeInteger(row.revision) && typeof v?.enabled === "boolean" && isAllowedModelArray(v.allowedModels) && reply.value.writable ? "available" : "unchanged";
  };
  const readGrants = () => grants.getSnapshot();
  const subscribeGrants = (listener) => grants.subscribe(listener);
  const readForm = () => form.getSnapshot();
  const subscribeForm = (listener) => form.subscribe(listener);
  function Editor({ t: t2 }) {
    const [editor, setEditor] = React5.useState();
    React5.useLayoutEffect(() => {
      const mounted = new RoutingEditor(form, grants);
      setEditor(mounted);
      return () => mounted.dispose();
    }, []);
    return editor ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(EditorForm, { t: t2, editor }) : null;
  }
  function EditorForm({ t: t2, editor }) {
    const host = React5.useSyncExternalStore(subscribeForm, readForm);
    const grantSnapshot = React5.useSyncExternalStore(subscribeGrants, readGrants);
    const state = React5.useSyncExternalStore(editor.subscribe, editor.getSnapshot);
    const [catalog, setCatalog] = React5.useState();
    const [catalogBusy, setCatalogBusy] = React5.useState(true);
    const [catalogError, setCatalogError] = React5.useState();
    const requestCatalogRefresh = React5.useRef();
    const [overwrite, setOverwrite] = React5.useState(false);
    const [preview, setPreview] = React5.useState();
    const [previewError, setPreviewError] = React5.useState();
    const [focus, setFocus] = React5.useState();
    const fields = React5.useRef(/* @__PURE__ */ new Map());
    const issueSummary = React5.useRef(null);
    const previewButton = React5.useRef(null);
    const routingHeading = React5.useRef(null);
    const restorePreviewFocus = React5.useRef(false);
    const instance = React5.useId();
    const locale = t2("language") === "zh" ? "zh" : "en";
    const draft = state.draft;
    const grantPlan = React5.useMemo(() => draft && planModelGrant(requiredModelRoutes(draft), grantSnapshot), [draft, grantSnapshot]);
    const needsGrant = grantPlan?.kind === "write";
    const grantProblem = grantPlan?.kind === "unavailable" ? grantPlan.reason : grantPlan?.kind === "readOnly" ? "readOnly" : void 0;
    const navigation = grantProblem ? client.get("pluginNavigation") : void 0;
    const openBundle = React5.useCallback((name) => navigation?.openBundle(name), [navigation]);
    const hostDisabled = state.saving || host.status !== "ready" || !host.writable;
    const disabled = hostDisabled || preview !== void 0 || state.stale;
    const catalogReady = catalog !== void 0 && !catalogBusy && catalogError === void 0;
    const catalogIndex = React5.useMemo(() => indexCatalog(catalog), [catalog]);
    const catalogStatus = catalogBusy ? t2("catalogLoading") : catalogError === void 0 ? void 0 : t2("catalogError", { message: catalogError });
    const pickerStatus = catalog === void 0 ? catalogStatus : void 0;
    const defaultSummary = draft && defaultTargetSummary(t2, draft.defaultTarget, catalogIndex, catalogReady);
    const closePreview = React5.useCallback(() => {
      restorePreviewFocus.current = true;
      setPreview(void 0);
    }, []);
    React5.useEffect(() => {
      let active = true;
      let running = false;
      let queued = false;
      const refresh = () => {
        if (!active) return;
        if (running) {
          queued = true;
          return;
        }
        running = true;
        setCatalogBusy(true);
        void (async () => {
          try {
            do {
              queued = false;
              try {
                const response = await client.remote.session.modelCatalog();
                if (!active) return;
                if (response.ok) {
                  setCatalog(response.value);
                  setCatalogError(void 0);
                } else setCatalogError(response.error.message);
              } catch (error) {
                if (active) setCatalogError(error instanceof Error ? error.message : String(error));
              }
            } while (active && queued);
          } finally {
            running = false;
            if (active) setCatalogBusy(false);
          }
        })();
      };
      requestCatalogRefresh.current = refresh;
      const stops = [
        ...["llm/adapters-updated", "llm/models-updated", "settings/document-updated", "credentials/record-updated", "credentials/reference-updated"].map((event) => client.remote.$on(event, refresh)),
        client.on("connection/reset", refresh)
      ];
      refresh();
      return () => {
        active = false;
        requestCatalogRefresh.current = void 0;
        for (const stop of stops) stop();
      };
    }, []);
    React5.useLayoutEffect(() => {
      if (!focus) return;
      const field = fields.current.get(focus);
      const target2 = field && !field.matches(":disabled") ? field : issueSummary.current;
      if (target2) {
        const details = target2.closest("details");
        if (details) details.open = true;
        target2.scrollIntoView({ block: "nearest" });
        target2.focus({ preventScroll: true });
      }
      setFocus(void 0);
    }, [focus, state.issue, draft]);
    React5.useLayoutEffect(() => {
      if (!preview) return;
      const onEscape = (event) => {
        if (event.key !== "Escape" || event.isComposing) return;
        event.preventDefault();
        event.stopPropagation();
        closePreview();
      };
      document.addEventListener("keydown", onEscape, true);
      return () => document.removeEventListener("keydown", onEscape, true);
    }, [preview, closePreview]);
    React5.useLayoutEffect(() => {
      if (!preview && restorePreviewFocus.current) {
        restorePreviewFocus.current = false;
        const target2 = previewButton.current?.matches(":enabled") ? previewButton.current : routingHeading.current;
        target2?.focus({ preventScroll: true });
      }
    }, [preview]);
    const registerField = React5.useCallback((section, field, node) => {
      const key2 = fieldKey(section, field);
      if (node) fields.current.set(key2, node);
      else fields.current.delete(key2);
    }, []);
    const registerHistory = React5.useCallback((node) => registerField("default", "historyLimit", node), [registerField]);
    const revision = state.revision;
    const chooseModel = React5.useCallback((section, choice) => {
      if (choice.mode === "default") {
        if (section !== "default") editor.setCategoryMode(section, "default", revision);
      } else if (choice.mode === "inherit") {
        editor.setNativeModelMode(section, "inherit", revision);
      } else {
        editor.setNativeModelMode(section, "explicit", revision, { provider: choice.provider, id: choice.id });
      }
    }, [editor, revision]);
    const chooseEffort = React5.useCallback((section, provider, id, effort) => {
      const current = editor.getSnapshot().draft;
      if (!current) return;
      const target2 = { executor: "native", model: { mode: "explicit", provider, id, ...effort ? { reasoningEffort: effort } : {} } };
      editor.edit(section === "default" ? { ...current, defaultTarget: target2 } : { ...current, categories: { ...current.categories, [section]: { mode: "target", target: target2 } } }, revision);
    }, [editor, revision]);
    const routeRow = (section, name, purpose, binding2) => {
      const followsDefault = binding2.mode === "default";
      const target2 = binding2.mode === "target" ? binding2.target : void 0;
      const explicit = target2?.executor === "native" && target2.model.mode === "explicit" ? target2.model : void 0;
      const legacyModel = target2 && target2.executor !== "native" ? externalModelSummary(target2, t2) : void 0;
      return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        RouteRow,
        {
          t: t2,
          section,
          name,
          purpose,
          instance,
          catalog: catalogIndex,
          catalogStatus: pickerStatus,
          catalogReady,
          executor: target2?.executor ?? "native",
          legacyModel,
          provider: explicit?.provider,
          model: explicit?.id,
          effort: explicit?.reasoningEffort,
          followsDefault,
          defaultSummary: section === "default" ? void 0 : defaultSummary,
          disabled,
          issueField: state.issue?.section === section ? state.issue.field : void 0,
          registerField,
          onModel: chooseModel,
          onEffort: chooseEffort
        },
        section
      );
    };
    const taskGroup = (entries, specialist) => {
      const group = specialist ? "specialist" : "general";
      return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("section", { className: "dtr-group", "aria-labelledby": `dtr-${instance}-${group}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "dtr-inline dtr-group-heading", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h4", { id: `dtr-${instance}-${group}`, children: t2(group) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "dtr-count", children: entries.length }),
          specialist && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "dtr-pill dtr-pill-brand", children: t2("proactive") })
        ] }),
        draft && entries.map((entry) => routeRow(entry.id, entry[locale].name, entry[locale].purpose, draft.categories[entry.id]))
      ] });
    };
    const save = () => {
      void editor.save({ ...catalog === void 0 ? {} : { catalog }, catalogReady }).then(() => {
        const issue = editor.getSnapshot().issue;
        if (issue) setFocus(fieldKey(issue.section, issue.field));
      });
    };
    const makePreview = () => {
      if (!draft || !catalog || !catalogReady) return;
      try {
        setPreview({ value: previewRecommendations(routingDraftToPolicy(draft), catalog, { overwrite }), revision, catalog });
        setPreviewError(void 0);
      } catch (error) {
        setPreviewError(error instanceof Error ? error.message : String(error));
      }
    };
    const previewStale = preview !== void 0 && (!catalogReady || preview.catalog !== catalog || preview.revision !== host.revision || preview.revision !== revision);
    const migrationPending = state.migrationRequired && !state.migrationConfirmed;
    const saveError = state.error?.kind === "grantUnavailable" || state.error?.kind === "grantReadOnly" ? void 0 : state.error;
    const feedbackId = `dtr-${instance}`;
    const problem = state.stale ? { status: "draftStale", target: "stale" } : grantProblem ? { status: grantProblem === "readOnly" ? "authorizationReadOnly" : "authorizationUnavailable", target: "grant-problem" } : migrationPending ? { status: "migrationPending", target: "migration-card" } : state.issue || previewError !== void 0 || saveError ? { status: "saveProblem", target: state.issue ? "issue" : previewError !== void 0 ? "preview-error" : "save-error" } : void 0;
    const status = problem?.status ?? (needsGrant ? "needsGrant" : state.dirty ? "dirty" : state.notice ?? "current");
    const reviewProblem = () => {
      if (!problem) return;
      const target2 = document.getElementById(`${feedbackId}-${problem.target}`);
      target2?.focus({ preventScroll: true });
      target2?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    };
    const historyInvalid = state.issue?.section === "default" && state.issue.field === "historyLimit";
    const catalogPartial = catalog?.failures.length ? t2("catalogPartial", { message: catalog.failures.map((failure) => `${failure.name}: ${failure.message}`).join("; ") }) : void 0;
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "dtr-editor", "aria-busy": state.saving, children: [
      editorStyles,
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("header", { className: "dtr-header", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h2", { children: t2("title") }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "dtr-muted", children: t2("description") }),
        host.status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { role: "status", className: "dtr-muted", children: t2("loading") }),
        host.status === "unavailable" && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { role: "status", className: "dtr-muted", children: t2("unavailable") }),
        host.status === "ready" && !host.writable && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "dtr-muted dtr-warning", role: "status", children: t2("readOnly") })
      ] }),
      draft && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("fieldset", { disabled, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          DelegationSettings,
          {
            t: t2,
            id: `dtr-${instance}-behavior`,
            mode: state.behavior.delegationMode,
            enforced: state.behavior.enforceNativeSubagentRouting,
            onMode: (mode) => editor.editBehavior({ delegationMode: mode }, revision),
            onToggle: () => editor.editBehavior({ enforceNativeSubagentRouting: !state.behavior.enforceNativeSubagentRouting }, revision)
          }
        ) }),
        state.migrationRequired && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("section", { id: `${feedbackId}-migration-card`, tabIndex: -1, className: "dtr-section dtr-card dtr-note", "aria-labelledby": `dtr-${instance}-migration`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h3", { id: `dtr-${instance}-migration`, children: t2("migrationTitle") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "dtr-muted", children: t2("migrationHint") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { children: t2("migrationCounts", { routes: state.retired?.routes.length ?? 0, rules: state.retired?.ruleCount ?? 0, roles: state.retired?.roleCount ?? 0 }) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "dtr-inline", children: state.migrationConfirmed ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { role: "status", children: t2("migrationConfirmed") }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", disabled: disabled || state.stale, onClick: () => editor.confirmMigration(revision), children: t2("confirmMigration") }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("section", { className: "dtr-section", "aria-labelledby": `dtr-${instance}-routing`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h3", { id: `dtr-${instance}-routing`, ref: routingHeading, tabIndex: -1, children: t2("routingTitle") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("fieldset", { disabled, children: routeRow("default", t2("defaults"), t2("defaultPurpose"), { mode: "target", target: draft.defaultTarget }) }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("fieldset", { disabled, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "dtr-inline dtr-toolbar", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "dtr-inline dtr-toolset", children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", ref: previewButton, disabled: !catalogReady || state.stale, onClick: makePreview, "aria-describedby": `dtr-${instance}-recommendation-help`, children: t2("recommendations") }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { id: `dtr-${instance}-recommendation-help`, className: "dtr-sr-only", children: t2("recommendationHint", { version: RECOMMENDATION_VERSION }) }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "dtr-inline dtr-check dtr-muted", children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { type: "checkbox", checked: overwrite, onChange: (event) => setOverwrite(event.currentTarget.checked) }),
                t2("overwrite")
              ] })
            ] }),
            (catalogBusy || catalogError !== void 0 || catalogPartial) && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "dtr-inline dtr-catalog-status", children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: `dtr-muted${catalogBusy ? "" : " dtr-warning"}`, role: "status", children: catalogStatus ?? catalogPartial }),
              !catalogBusy && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", onClick: () => requestCatalogRefresh.current?.(), children: t2("retry") })
            ] })
          ] }) }),
          preview && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("section", { className: "dtr-card dtr-note", "aria-labelledby": `dtr-${instance}-preview-title`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("h4", { id: `dtr-${instance}-preview-title`, children: t2("previewTitle") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "dtr-muted", children: t2("previewHint") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "dtr-muted", children: t2("recommendationHint", { version: RECOMMENDATION_VERSION }) }),
            preview.value.changes.length ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("ul", { className: "dtr-preview-list", children: preview.value.changes.map((change) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("li", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { children: CATEGORIES[change.category][locale].name }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "dtr-inline dtr-diff", children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "dtr-pill", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "dtr-sr-only", children: [
                    t2("before"),
                    " "
                  ] }),
                  change.before.mode === "default" ? `${t2("useDefault")} \xB7 ${defaultSummary}` : previewTarget(change.before.target, t2)
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(Icon, { name: "arrow" }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "dtr-pill dtr-pill-brand", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "dtr-sr-only", children: [
                    t2("after"),
                    " "
                  ] }),
                  previewTarget(change.after.target, t2)
                ] })
              ] })
            ] }, change.category)) }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { children: t2("noChanges") }),
            previewStale && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "dtr-muted dtr-warning", role: "status", children: t2("previewChanged") }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { className: "dtr-muted", children: [
              t2("preserved", { count: preview.value.preserved.length }),
              " \xB7 ",
              t2("unmatched", { count: preview.value.unavailable.length })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "dtr-inline", children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", autoFocus: true, onClick: closePreview, children: t2("cancelPreview") }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", className: "dtr-primary", disabled: hostDisabled || state.stale || preview.value.changes.length === 0 || previewStale, onClick: () => {
                if (editor.applyRecommendations(preview.value, preview.revision)) closePreview();
              }, children: t2("applyPreview") })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("fieldset", { disabled, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "dtr-group", children: [
            taskGroup(SPECIALIST_TASKS, true),
            taskGroup(GENERAL_TASKS, false)
          ] }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("details", { className: "dtr-section dtr-card dtr-advanced", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("summary", { children: t2("advanced") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "dtr-advanced-body", children: [
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "dtr-field dtr-history", children: [
              t2("historyLimit"),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                "input",
                {
                  ref: registerHistory,
                  id: `dtr-${instance}-history`,
                  "aria-invalid": historyInvalid || void 0,
                  "aria-describedby": historyInvalid ? `dtr-${instance}-issue` : void 0,
                  type: "number",
                  min: 1,
                  max: 1e3,
                  step: 1,
                  disabled,
                  value: draft.historyLimit,
                  onChange: (event) => editor.edit({ ...draft, historyLimit: event.currentTarget.value }, revision)
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { className: "dtr-muted dtr-warning", children: [
              "Codex / Antigravity (agy) / Cursor: ",
              t2("externalBlocked")
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "dtr-feedback", "aria-live": "polite", children: [
        state.stale && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { id: `${feedbackId}-stale`, tabIndex: -1, className: "dtr-muted dtr-warning", children: t2("stale") }),
        state.issue && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { ref: issueSummary, tabIndex: -1, id: `${feedbackId}-issue`, role: "alert", className: "dtr-error", children: [
          state.issue.section === "default" ? t2("defaults") : CATEGORIES[state.issue.section][locale].name,
          " \xB7 ",
          t2(state.issue.field),
          ": ",
          state.issue.detail ?? t2(state.issue.reason)
        ] }),
        previewError !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { id: `${feedbackId}-preview-error`, tabIndex: -1, role: "alert", className: "dtr-error", children: t2("validationError", { message: previewError }) }),
        grantProblem && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(GrantDiagnostics, { id: `${feedbackId}-grant-problem`, problem: grantProblem, locale, inventory, recheck, dirty: state.dirty, openBundle: navigation ? openBundle : void 0 }, grantProblem),
        saveError && !(state.stale && saveError.kind === "refused") && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { id: `${feedbackId}-save-error`, tabIndex: -1, role: "alert", className: "dtr-error", children: saveError.kind === "grantFailed" ? t2("grantFailed") : saveError.kind === "refused" ? t2("refused") : saveError.kind === "migration" ? t2("migrationRequired") : saveError.kind === "previewChanged" ? t2("previewChanged") : t2(saveError.kind === "validation" ? "validationError" : "transportError", { message: saveError.detail }) })
      ] }),
      draft && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("footer", { className: "dtr-footer", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "dtr-inline", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "dtr-status dtr-muted", "data-status": status, role: "status", children: t2(status) }),
          problem && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", className: "dtr-review-problem", "aria-controls": `${feedbackId}-${problem.target}`, onClick: reviewProblem, children: t2("reviewProblem") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "dtr-inline dtr-footer-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", disabled: state.saving || !state.stale && (preview !== void 0 || !state.dirty), onClick: () => {
            setPreview(void 0);
            setPreviewError(void 0);
            editor.discard();
          }, children: t2(state.stale ? "reload" : "cancel") }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", className: "dtr-primary", disabled: disabled || !!grantProblem || !state.dirty && !needsGrant, onClick: save, children: t2(state.saving ? "saving" : "save") })
        ] })
      ] })
    ] });
  }
  const t = client.locale.bind(NS);
  ctx.effect(() => client.configForms.whileServed(["team-router"], () => client.slots.inject("plugins.bundle.config", () => client.slots.register({
    name: "plugins.bundle.config",
    key: "dsh-team-router",
    locale: NS
  }, Editor))), "team-router: bundle detail configuration");
  ctx.effect(() => client.configForms.whileServed(["team-router"], () => client.slots.inject("settings.section", () => client.slots.register({
    name: "settings.section",
    id: "team-router",
    order: 35,
    label: () => t("title"),
    locale: NS
  }, Editor))), "team-router: settings section");
}
function previewTarget(target2, t) {
  const executor = target2.executor === "native" ? t("native") : target2.executor;
  if (target2.model.mode === "inherit") return `${executor} \xB7 ${t("inherit")}`;
  if (target2.model.mode === "executor-default") return `${executor} \xB7 ${t("executorDefault")}`;
  const model = target2.model;
  return `${executor} \xB7 ${"provider" in model ? `${model.provider} / ` : ""}${model.id}${model.reasoningEffort ? ` \xB7 ${model.reasoningEffort}` : ""}`;
}
;return module.exports;}});
//# sourceMappingURL=client.js.map
