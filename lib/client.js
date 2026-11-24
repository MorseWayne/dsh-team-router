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
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
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

// src/client.tsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);
var React = __toESM(require("react"), 1);

// src/categories.ts
var CATEGORY_IDS = Object.freeze([
  "visual-engineering",
  "ultrabrain",
  "deep",
  "artistry",
  "quick",
  "unspecified",
  "writing"
]);
function category(id, zh2, en2) {
  return Object.freeze({ id, zh: Object.freeze(zh2), en: Object.freeze(en2) });
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

// src/policy.ts
var CONFIG_FIELDS = /* @__PURE__ */ new Set([
  "routes",
  "rules",
  "roles",
  "defaultRoute",
  "historyLimit"
]);
var ROUTE_FIELDS = /* @__PURE__ */ new Set(["provider", "model", "reasoningEffort"]);
var RULE_FIELDS = /* @__PURE__ */ new Set(["id", "keywords", "route", "priority"]);
var UNSAFE_KEYS = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]);
function fail(path, message) {
  throw new TypeError(`${path}: ${message}`);
}
function record(value, path) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(path, "must be an object");
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype) {
    fail(path, "must be a plain object");
  }
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== "string") fail(path, "symbol fields are not allowed");
    if (UNSAFE_KEYS.has(key)) fail(path, `unsafe key ${JSON.stringify(key)}`);
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!Object.hasOwn(descriptor, "value")) {
      fail(`${path}.${key}`, "must be a data property");
    }
  }
  return value;
}
function exactFields(value, allowed, path) {
  for (const key of Object.getOwnPropertyNames(value)) {
    if (!allowed.has(key)) fail(`${path}.${key}`, "unknown field");
  }
}
function own(value, key) {
  return Object.hasOwn(value, key) ? value[key] : void 0;
}
function text(value, path) {
  if (typeof value !== "string") fail(path, "must be a string");
  const normalized = value.trim();
  if (normalized.length === 0) fail(path, "must not be empty");
  return normalized;
}
function routeName(value, path) {
  const name = text(value, path);
  if (UNSAFE_KEYS.has(name)) fail(path, `unsafe route name ${JSON.stringify(name)}`);
  return name;
}
function integer(value, minimum, maximum, path) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < minimum || value > maximum) {
    fail(path, `must be a finite integer from ${minimum} to ${maximum}`);
  }
  return value;
}
function array(value, maximum, path) {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
    fail(path, "must be an array");
  }
  if (value.length > maximum) fail(path, `must contain at most ${maximum} items`);
  for (const key of Reflect.ownKeys(value)) {
    if (key === "length") continue;
    if (typeof key !== "string" || !Number.isInteger(Number(key)) || Number(key) < 0 || Number(key) >= value.length || String(Number(key)) !== key) {
      fail(path, "unknown array field");
    }
    if (!Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), "value")) {
      fail(`${path}[${key}]`, "must be a data property");
    }
  }
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.hasOwn(value, index)) fail(`${path}[${index}]`, "must not be missing");
  }
  return value;
}
function requireRoute(routes, name, path) {
  if (!Object.hasOwn(routes, name)) fail(path, `unknown route ${JSON.stringify(name)}`);
}
function parseConfig(input) {
  const source = record(input, "config");
  exactFields(source, CONFIG_FIELDS, "config");
  const routeSource = record(own(source, "routes"), "config.routes");
  const routeKeys = Object.getOwnPropertyNames(routeSource);
  if (routeKeys.length > 64) fail("config.routes", "must contain at most 64 routes");
  const routes = /* @__PURE__ */ Object.create(null);
  for (const key of routeKeys) {
    const path = `config.routes[${JSON.stringify(key)}]`;
    const name = routeName(key, path);
    if (Object.hasOwn(routes, name)) fail(path, "duplicate normalized route name");
    const entry = record(routeSource[key], path);
    exactFields(entry, ROUTE_FIELDS, path);
    const route = {
      provider: text(own(entry, "provider"), `${path}.provider`),
      model: text(own(entry, "model"), `${path}.model`)
    };
    const effort = own(entry, "reasoningEffort");
    if (effort !== void 0) route.reasoningEffort = text(effort, `${path}.reasoningEffort`);
    routes[name] = route;
  }
  const rules = [];
  const ruleIds = /* @__PURE__ */ new Set();
  const rawRules = own(source, "rules");
  if (rawRules !== void 0) {
    const entries = array(rawRules, 64, "config.rules");
    for (let index = 0; index < entries.length; index += 1) {
      const path = `config.rules[${index}]`;
      const entry = record(entries[index], path);
      exactFields(entry, RULE_FIELDS, path);
      const id = text(own(entry, "id"), `${path}.id`);
      if (ruleIds.has(id)) fail(`${path}.id`, "duplicate rule id");
      ruleIds.add(id);
      const keywords = array(own(entry, "keywords"), 32, `${path}.keywords`).map(
        (keyword, keywordIndex) => {
          const keywordPath = `${path}.keywords[${keywordIndex}]`;
          const normalized = text(keyword, keywordPath);
          if (normalized.length > 100) fail(keywordPath, "must contain at most 100 characters");
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
        priority: priority === void 0 ? 0 : integer(priority, -1e3, 1e3, `${path}.priority`)
      });
    }
  }
  const roles = /* @__PURE__ */ Object.create(null);
  const rawRoles = own(source, "roles");
  if (rawRoles !== void 0) {
    const entries = record(rawRoles, "config.roles");
    for (const memberName of Object.getOwnPropertyNames(entries)) {
      const path = `config.roles[${JSON.stringify(memberName)}]`;
      if (memberName.trim().length === 0) fail(path, "member name must not be empty");
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
    historyLimit: rawLimit === void 0 ? 100 : integer(rawLimit, 1, 1e3, "config.historyLimit")
  };
  const rawDefault = own(source, "defaultRoute");
  if (rawDefault !== void 0) {
    const name = routeName(rawDefault, "config.defaultRoute");
    requireRoute(routes, name, "config.defaultRoute");
    config.defaultRoute = name;
  }
  return config;
}

// src/routing-policy.ts
var POLICY_FIELDS = ["version", "defaultTarget", "categories", "historyLimit"];
var UNSAFE_KEYS2 = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]);
function fail2(path, message) {
  throw new TypeError(`${path}: ${message}`);
}
function record2(value, path) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail2(path, "must be a plain object");
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype) fail2(path, "must be a plain object");
  const result = /* @__PURE__ */ Object.create(null);
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== "string") fail2(path, "symbol fields are not allowed");
    if (UNSAFE_KEYS2.has(key)) fail2(path, `unsafe key ${JSON.stringify(key)}`);
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === void 0 || !Object.hasOwn(descriptor, "value")) {
      fail2(`${path}.${key}`, "must be a data property");
    }
    result[key] = descriptor.value;
  }
  return result;
}
function exactFields2(value, allowed, path) {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) fail2(`${path}.${key}`, "unknown field");
  }
}
function text2(value, path) {
  if (typeof value !== "string") fail2(path, "must be a string");
  const result = value.trim();
  if (result.length === 0) fail2(path, "must not be empty");
  return result;
}
function integer2(value, minimum, maximum, path) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < minimum || value > maximum) {
    fail2(path, `must be a safe integer from ${minimum} to ${maximum}`);
  }
  return value;
}
function target(input, path) {
  const entry = record2(input, path);
  exactFields2(entry, ["executor", "model"], path);
  const executor = entry.executor;
  if (executor !== "native" && executor !== "codex" && executor !== "agy" && executor !== "cursor") {
    fail2(`${path}.executor`, "expected native, codex, agy, or cursor");
  }
  const modelPath = `${path}.model`;
  const model = record2(entry.model, modelPath);
  if (executor === "native" && model.mode === "inherit") {
    exactFields2(model, ["mode"], modelPath);
    return { executor, model: { mode: "inherit" } };
  }
  if (executor !== "native" && model.mode === "executor-default") {
    exactFields2(model, ["mode"], modelPath);
    return { executor, model: { mode: "executor-default" } };
  }
  if (model.mode !== "explicit") {
    fail2(`${modelPath}.mode`, executor === "native" ? "expected inherit or explicit for native" : "expected executor-default or explicit for an external executor");
  }
  exactFields2(model, executor === "native" ? ["mode", "provider", "id", "reasoningEffort"] : ["mode", "id", "reasoningEffort"], modelPath);
  const id = text2(model.id, `${modelPath}.id`);
  const effort = model.reasoningEffort === void 0 ? {} : {
    reasoningEffort: text2(model.reasoningEffort, `${modelPath}.reasoningEffort`)
  };
  if (executor === "native") {
    return { executor, model: {
      mode: "explicit",
      provider: text2(model.provider, `${modelPath}.provider`),
      id,
      ...effort
    } };
  }
  return { executor, model: { mode: "explicit", id, ...effort } };
}
function binding(input, path) {
  const entry = record2(input, path);
  if (entry.mode === "default") {
    exactFields2(entry, ["mode"], path);
    return { mode: "default" };
  }
  if (entry.mode === "target") {
    exactFields2(entry, ["mode", "target"], path);
    return { mode: "target", target: target(entry.target, `${path}.target`) };
  }
  fail2(`${path}.mode`, "expected default or target");
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
  const source = record2(input, "policy");
  exactFields2(source, POLICY_FIELDS, "policy");
  if (source.version !== 2) fail2("policy.version", "must be 2");
  const result = createDefaultRoutingPolicy();
  if (Object.hasOwn(source, "defaultTarget")) result.defaultTarget = target(source.defaultTarget, "policy.defaultTarget");
  if (Object.hasOwn(source, "historyLimit")) {
    result.historyLimit = integer2(source.historyLimit, 1, 1e3, "policy.historyLimit");
  }
  if (Object.hasOwn(source, "categories")) {
    const entries = record2(source.categories, "policy.categories");
    for (const key of Object.keys(entries)) {
      const path = `policy.categories[${JSON.stringify(key)}]`;
      let id;
      try {
        id = getCategory(key).id;
      } catch (error) {
        fail2(path, error instanceof Error ? error.message : "invalid category");
      }
      result.categories[id] = binding(entries[key], path);
    }
  }
  return result;
}

// src/migration.ts
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

// src/recommendations.ts
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

// src/routing-editor.ts
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
function routingDraftIssue(draft, catalog, catalogReady = catalog !== void 0) {
  const history = Number(draft.historyLimit);
  if (draft.historyLimit.trim() === "" || !Number.isInteger(history) || history < 1 || history > 1e3) {
    return { section: "default", field: "historyLimit", reason: "history" };
  }
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
  stop;
  disposed = false;
  form;
  constructor(form) {
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
    try {
      const value = host.value === void 0 ? void 0 : routingFormPreview(host.value);
      const draft = value === void 0 ? void 0 : routingPolicyToDraft(value.policy);
      this.customTargets.clear();
      this.nativeModels.clear();
      if (draft) this.remember(draft, true);
      this.publish({
        draft,
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
    if (this.disposed || state.saving || !state.dirty || !state.draft || state.revision === void 0 || host.status !== "ready" || !host.writable) return false;
    if (state.stale || host.revision !== state.revision) {
      this.publish({ ...state, stale: true, migrationConfirmed: false, error: { kind: "refused", detail: "" } });
      return false;
    }
    if (state.migrationRequired && !state.migrationConfirmed) {
      this.publish({ ...state, error: { kind: "migration", detail: "" } });
      return false;
    }
    const issue = routingDraftIssue(state.draft, options.catalog, options.catalogReady ?? options.catalog !== void 0);
    if (issue) {
      this.publish({ ...state, issue, error: void 0, notice: void 0 });
      return false;
    }
    let mutations;
    try {
      mutations = routingPolicyMutations(routingDraftToPolicy(state.draft));
    } catch (error) {
      this.publish({ ...state, error: { kind: "validation", detail: error instanceof Error ? error.message : String(error) } });
      return false;
    }
    this.publish({ ...state, saving: true, issue: void 0, error: void 0, notice: void 0 });
    try {
      const accepted = await this.form.mutate(mutations, state.revision);
      if (accepted) this.accept("saved");
      else this.publish({
        ...state,
        saving: false,
        stale: this.form.getSnapshot().revision !== state.revision,
        error: { kind: "refused", detail: "" },
        notice: void 0
      });
      return accepted;
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
  }
};

// src/client.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var NS = "teamRouter";
var en = {
  language: "en",
  title: "Team task routing",
  description: "Seven built-in task categories. Choose an executor and model for each; changes affect new delegations only, never a running task.",
  authorization: "The model catalog is not authorization. Each delegation checks the current session policy and live capabilities again.",
  categoryColumn: "Task category",
  targetColumn: "Routing configuration",
  defaultPurpose: "Used by all categories without a custom target.",
  draftTarget: "Draft target: {target}",
  defaults: "Default execution target",
  categories: "Task presets",
  binding: "Category target",
  useDefault: "Use the default target",
  custom: "Choose a target",
  switchingHint: "Default/inherited modes deactivate explicit selections. Switching back restores them within this edit session; saving or reloading keeps only the selected mode.",
  executor: "Executor",
  native: "DSH native teammate",
  externalBlocked: "P0 integration is not verified. External execution is unavailable; existing values are preserved, not proof of installation or authentication.",
  modelMode: "Model selection",
  inherit: "Inherit the session model",
  explicit: "Choose a model",
  executorDefault: "Use the external agent\u2019s default",
  searchModels: "Search models",
  noModels: "No matching models",
  provider: "Provider",
  model: "Model",
  effort: "Reasoning effort",
  modelDefault: "Model default",
  chooseProvider: "Choose a provider",
  chooseModel: "Choose a model",
  unavailableOption: "{name} (not available in this catalog)",
  configured: "Configured target: {target}",
  loading: "Loading Host configuration\u2026",
  unavailable: "The team-router configuration is not served by this Host.",
  readOnly: "This Host configuration is read-only.",
  catalogLoading: "Loading the live model catalog\u2026",
  catalogError: "Could not load the catalog: {message}",
  catalogPartial: "Some providers failed: {message}",
  retry: "Retry catalog",
  recommendations: "Preview recommendations",
  recommendationHint: "Version {version}. Curated exact model IDs, not benchmark rankings. Missing candidates keep their current/default target. This does not grant session authorization.",
  overwrite: "Also replace my explicitly selected category targets",
  previewTitle: "Review recommendation changes",
  previewHint: "Confirming only changes the draft. Save separately to apply it. The default target is not changed.",
  applyPreview: "Confirm changes to draft",
  cancelPreview: "Keep current draft",
  noChanges: "No matching changes to apply.",
  preserved: "Explicit selections preserved: {count}",
  unmatched: "Categories without a matching candidate: {count}",
  previewChanged: "The draft or Host revision changed since the preview opened. Generate a new preview.",
  migrationTitle: "Confirm legacy policy migration",
  migrationHint: "Saving V2 retires legacy named routes, keyword rules, exact-name roles, and old member overrides. The Host must back up the legacy policy before committing. Only the old default model is mapped automatically.",
  migrationCounts: "{routes} named routes, {rules} task rules, {roles} role mappings will stop participating in routing.",
  confirmMigration: "I confirm migration and retirement of the old routing rules",
  migrationConfirmed: "Migration confirmed for this revision. Save to commit.",
  migrationRequired: "Confirm migration before saving. Your draft is preserved.",
  advanced: "Advanced settings and executor status",
  historyLimit: "History limit (1\u20131000)",
  save: "Save policy",
  saving: "Saving\u2026",
  cancel: "Cancel edits",
  reload: "Discard draft and reload Host values",
  saved: "Policy saved. New delegations will use these settings.",
  dirty: "Unsaved changes",
  current: "Up to date",
  stale: "The Host changed while you were editing. Your draft is preserved; reload before saving.",
  refused: "The Host refused this save. Your draft is preserved; no automatic overwrite was attempted.",
  validationError: "Invalid policy: {message}",
  transportError: "Save failed: {message}. Your draft is preserved.",
  required: "This field is required.",
  history: "Enter an integer from 1 to 1000.",
  catalog: "This provider, model or effort is not available in the live catalog.",
  catalogRequired: "A current model catalog is required for explicit native models. Inherited targets do not require it.",
  externalUnavailable: "This external executor has not passed integration verification. Select a native target before saving.",
  structure: "The policy structure is invalid."
};
var zh = {
  language: "zh",
  title: "\u56E2\u961F\u4EFB\u52A1\u8DEF\u7531",
  description: "\u5185\u7F6E\u4E03\u4E2A\u4EFB\u52A1\u7C7B\u522B\uFF0C\u6309\u7C7B\u522B\u9009\u62E9\u6267\u884C\u5668\u4E0E\u6A21\u578B\u3002\u4FEE\u6539\u53EA\u5F71\u54CD\u540E\u7EED\u65B0\u59D4\u6D3E\uFF0C\u4E0D\u6539\u53D8\u6B63\u5728\u6267\u884C\u7684\u4EFB\u52A1\u3002",
  authorization: "\u6A21\u578B\u76EE\u5F55\u4E0D\u7B49\u4E8E\u6388\u6743\u3002\u6267\u884C\u59D4\u6D3E\u65F6\u4ECD\u4F1A\u91CD\u65B0\u6821\u9A8C\u5F53\u524D\u4F1A\u8BDD\u7684\u6A21\u578B\u6743\u9650\u4E0E\u5B9E\u9645\u80FD\u529B\u3002",
  categoryColumn: "\u4EFB\u52A1\u7C7B\u522B",
  targetColumn: "\u8DEF\u7531\u914D\u7F6E",
  defaultPurpose: "\u6240\u6709\u672A\u5355\u72EC\u914D\u7F6E\u7684\u7C7B\u522B\u90FD\u4F7F\u7528\u6B64\u76EE\u6807\u3002",
  draftTarget: "\u8349\u7A3F\u76EE\u6807\uFF1A{target}",
  defaults: "\u9ED8\u8BA4\u6267\u884C\u76EE\u6807",
  categories: "\u4EFB\u52A1\u9884\u8BBE",
  binding: "\u7C7B\u522B\u76EE\u6807",
  useDefault: "\u4F7F\u7528\u9ED8\u8BA4\u6267\u884C\u76EE\u6807",
  custom: "\u5355\u72EC\u9009\u62E9\u76EE\u6807",
  switchingHint: "\u5207\u6362\u5230\u9ED8\u8BA4/\u7EE7\u627F\u4F1A\u505C\u7528\u81EA\u9009\u503C\uFF1B\u672C\u6B21\u7F16\u8F91\u4E2D\u5207\u56DE\u53EF\u6062\u590D\u3002\u4FDD\u5B58\u6216\u91CD\u65B0\u8BFB\u53D6\u540E\u4EC5\u4FDD\u7559\u6240\u9009\u6A21\u5F0F\u3002",
  executor: "\u6267\u884C\u5668",
  native: "DSH \u539F\u751F\u961F\u53CB",
  externalBlocked: "P0 \u63A5\u5165\u9A8C\u8BC1\u5C1A\u672A\u901A\u8FC7\uFF0C\u5916\u90E8\u6267\u884C\u6682\u4E0D\u53EF\u7528\u3002\u5DF2\u4FDD\u5B58\u7684\u503C\u4F1A\u4FDD\u7559\uFF1B\u6B64\u72B6\u6001\u4E0D\u4EE3\u8868 CLI \u672A\u5B89\u88C5\u6216\u672A\u8BA4\u8BC1\u3002",
  modelMode: "\u6A21\u578B\u9009\u62E9",
  inherit: "\u7EE7\u627F\u4F1A\u8BDD\u6A21\u578B",
  explicit: "\u6307\u5B9A\u6A21\u578B",
  executorDefault: "\u4F7F\u7528\u5916\u90E8 Agent \u81EA\u8EAB\u9ED8\u8BA4\u6A21\u578B",
  searchModels: "\u641C\u7D22\u6A21\u578B",
  noModels: "\u6CA1\u6709\u5339\u914D\u7684\u6A21\u578B",
  provider: "\u4F9B\u5E94\u5546",
  model: "\u6A21\u578B",
  effort: "\u63A8\u7406\u5F3A\u5EA6",
  modelDefault: "\u6A21\u578B\u9ED8\u8BA4",
  chooseProvider: "\u9009\u62E9\u4F9B\u5E94\u5546",
  chooseModel: "\u9009\u62E9\u6A21\u578B",
  unavailableOption: "{name}\uFF08\u5F53\u524D\u76EE\u5F55\u4E0D\u53EF\u7528\uFF09",
  configured: "\u914D\u7F6E\u76EE\u6807\uFF1A{target}",
  loading: "\u6B63\u5728\u8BFB\u53D6 Host \u914D\u7F6E\u2026",
  unavailable: "\u5F53\u524D Host \u672A\u63D0\u4F9B team-router \u914D\u7F6E\u9879\u3002",
  readOnly: "\u5F53\u524D Host \u914D\u7F6E\u4E3A\u53EA\u8BFB\u3002",
  catalogLoading: "\u6B63\u5728\u8BFB\u53D6\u5B9E\u65F6\u6A21\u578B\u76EE\u5F55\u2026",
  catalogError: "\u65E0\u6CD5\u8BFB\u53D6\u6A21\u578B\u76EE\u5F55\uFF1A{message}",
  catalogPartial: "\u90E8\u5206\u4F9B\u5E94\u5546\u8BFB\u53D6\u5931\u8D25\uFF1A{message}",
  retry: "\u91CD\u8BD5\u8BFB\u53D6\u76EE\u5F55",
  recommendations: "\u9884\u89C8\u63A8\u8350\u914D\u7F6E",
  recommendationHint: "\u63A8\u8350\u7248\u672C {version}\u3002\u4F7F\u7528\u4EBA\u5DE5\u7EF4\u62A4\u7684\u7CBE\u786E\u6A21\u578B\u6807\u8BC6\uFF0C\u4E0D\u4EE3\u8868\u57FA\u51C6\u6700\u4F18\uFF1B\u65E0\u5339\u914D\u9879\u4FDD\u7559\u5F53\u524D/\u9ED8\u8BA4\u76EE\u6807\uFF0C\u4E0D\u6269\u5927\u4F1A\u8BDD\u6388\u6743\u3002",
  overwrite: "\u540C\u65F6\u66FF\u6362\u6211\u5DF2\u5355\u72EC\u9009\u62E9\u7684\u7C7B\u522B\u76EE\u6807",
  previewTitle: "\u786E\u8BA4\u63A8\u8350\u914D\u7F6E\u5DEE\u5F02",
  previewHint: "\u786E\u8BA4\u540E\u53EA\u66F4\u65B0\u8349\u7A3F\uFF0C\u4ECD\u9700\u70B9\u51FB\u4FDD\u5B58\u624D\u4F1A\u751F\u6548\uFF1B\u4E0D\u4FEE\u6539\u9ED8\u8BA4\u6267\u884C\u76EE\u6807\u3002",
  applyPreview: "\u786E\u8BA4\u5E94\u7528\u5230\u8349\u7A3F",
  cancelPreview: "\u4FDD\u7559\u5F53\u524D\u8349\u7A3F",
  noChanges: "\u5F53\u524D\u6CA1\u6709\u53EF\u5E94\u7528\u7684\u5339\u914D\u53D8\u66F4\u3002",
  preserved: "\u5DF2\u4FDD\u7559\u81EA\u9009\u7C7B\u522B\uFF1A{count}",
  unmatched: "\u6CA1\u6709\u5339\u914D\u5019\u9009\u7684\u7C7B\u522B\uFF1A{count}",
  previewChanged: "\u9884\u89C8\u6253\u5F00\u540E\u8349\u7A3F\u6216 Host \u7248\u672C\u53D1\u751F\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u751F\u6210\u9884\u89C8\u3002",
  migrationTitle: "\u786E\u8BA4\u8FC1\u79FB\u65E7\u8DEF\u7531\u7B56\u7565",
  migrationHint: "\u4FDD\u5B58 V2 \u540E\uFF0C\u65E7\u547D\u540D\u8DEF\u7531\u3001\u5173\u952E\u8BCD\u89C4\u5219\u3001\u7CBE\u786E\u961F\u53CB\u89D2\u8272\u548C\u6210\u5458\u8986\u76D6\u4E0D\u518D\u53C2\u4E0E\u8DEF\u7531\u3002Host \u5FC5\u987B\u5148\u5907\u4EFD\u65E7\u914D\u7F6E\u518D\u63D0\u4EA4\uFF1B\u4EC5\u65E7\u9ED8\u8BA4\u6A21\u578B\u4F1A\u81EA\u52A8\u6620\u5C04\u3002",
  migrationCounts: "\u5C06\u505C\u7528 {routes} \u6761\u547D\u540D\u8DEF\u7531\u3001{rules} \u6761\u4EFB\u52A1\u89C4\u5219\u3001{roles} \u6761\u89D2\u8272\u6620\u5C04\u3002",
  confirmMigration: "\u786E\u8BA4\u8FC1\u79FB\u5E76\u505C\u7528\u65E7\u8DEF\u7531\u89C4\u5219",
  migrationConfirmed: "\u5DF2\u786E\u8BA4\u6B64\u7248\u672C\u7684\u8FC1\u79FB\uFF0C\u70B9\u51FB\u4FDD\u5B58\u540E\u63D0\u4EA4\u3002",
  migrationRequired: "\u4FDD\u5B58\u524D\u8BF7\u660E\u786E\u786E\u8BA4\u8FC1\u79FB\uFF0C\u8349\u7A3F\u5DF2\u4FDD\u7559\u3002",
  advanced: "\u9AD8\u7EA7\u8BBE\u7F6E\u4E0E\u6267\u884C\u5668\u72B6\u6001",
  historyLimit: "\u5386\u53F2\u8BB0\u5F55\u4E0A\u9650\uFF081\u20131000\uFF09",
  save: "\u4FDD\u5B58\u7B56\u7565",
  saving: "\u4FDD\u5B58\u4E2D\u2026",
  cancel: "\u53D6\u6D88\u4FEE\u6539",
  reload: "\u4E22\u5F03\u8349\u7A3F\u5E76\u91CD\u65B0\u8BFB\u53D6 Host \u914D\u7F6E",
  saved: "\u7B56\u7565\u5DF2\u4FDD\u5B58\uFF0C\u5C06\u7528\u4E8E\u540E\u7EED\u65B0\u59D4\u6D3E\u3002",
  dirty: "\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539",
  current: "\u5DF2\u540C\u6B65",
  stale: "\u7F16\u8F91\u671F\u95F4 Host \u914D\u7F6E\u5DF2\u66F4\u65B0\u3002\u8349\u7A3F\u5DF2\u4FDD\u7559\uFF0C\u8BF7\u91CD\u65B0\u8BFB\u53D6\u540E\u518D\u4FDD\u5B58\u3002",
  refused: "Host \u62D2\u7EDD\u4E86\u672C\u6B21\u4FDD\u5B58\uFF0C\u8349\u7A3F\u5DF2\u4FDD\u7559\uFF1B\u6CA1\u6709\u5C1D\u8BD5\u81EA\u52A8\u8986\u76D6\u5176\u4ED6\u4FEE\u6539\u3002",
  validationError: "\u7B56\u7565\u4E0D\u5408\u6CD5\uFF1A{message}",
  transportError: "\u4FDD\u5B58\u5931\u8D25\uFF1A{message}\u3002\u8349\u7A3F\u5DF2\u4FDD\u7559\u3002",
  required: "\u6B64\u9879\u4E0D\u80FD\u4E3A\u7A7A\u3002",
  history: "\u8BF7\u8F93\u5165 1 \u81F3 1000 \u4E4B\u95F4\u7684\u6574\u6570\u3002",
  catalog: "\u4F9B\u5E94\u5546\u3001\u6A21\u578B\u6216\u63A8\u7406\u5F3A\u5EA6\u4E0D\u5728\u5F53\u524D\u5B9E\u65F6\u76EE\u5F55\u4E2D\u3002",
  catalogRequired: "\u6307\u5B9A\u539F\u751F\u6A21\u578B\u9700\u8981\u5F53\u524D\u6709\u6548\u76EE\u5F55\uFF1B\u7EE7\u627F\u6A21\u578B\u4E0D\u4F9D\u8D56\u76EE\u5F55\u8BFB\u53D6\u6210\u529F\u3002",
  externalUnavailable: "\u6B64\u5916\u90E8\u6267\u884C\u5668\u5C1A\u672A\u901A\u8FC7\u63A5\u5165\u9A8C\u8BC1\uFF0C\u8BF7\u5207\u6362\u4E3A\u539F\u751F\u76EE\u6807\u540E\u4FDD\u5B58\u3002",
  structure: "\u7B56\u7565\u7ED3\u6784\u4E0D\u5408\u6CD5\u3002"
};
var CSS = `
.dtr-editor{container:dtr-editor / inline-size;color:var(--dsw-alias-label-primary);font-size:14px;line-height:1.55;width:100%;max-width:1140px;min-width:0;margin:0 auto;padding:4px 0 24px}
.dtr-editor *{box-sizing:border-box}.dtr-editor h2{font-size:20px;line-height:1.4;margin:0 0 8px;font-weight:600}.dtr-editor h3{font-size:15px;margin:0;font-weight:600}
.dtr-muted{color:var(--dsw-alias-label-secondary);font-size:13px;margin:4px 0 12px}.dtr-note{padding:12px;border:1px solid var(--dsw-alias-border-l3);border-radius:10px;margin:12px 0;background:var(--dsw-alias-bg-layer-1)}
.dtr-section{border-top:1px solid var(--dsw-alias-border-l3);padding-top:20px;margin-top:22px}.dtr-actions,.dtr-inline{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.dtr-actions{justify-content:space-between}
.dtr-table{width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0;margin-top:12px;border:1px solid var(--dsw-alias-border-l3);border-radius:10px;color:inherit}.dtr-category-col{width:26%}
.dtr-table th,.dtr-table td{text-align:start;vertical-align:top;padding:12px 14px;overflow-wrap:anywhere}.dtr-table thead th{font-size:13px;font-weight:600;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-1)}.dtr-table thead th:first-child{border-start-start-radius:9px}.dtr-table thead th:last-child{border-start-end-radius:9px}
.dtr-table tbody th,.dtr-table td{border-block-start:1px solid var(--dsw-alias-border-l3)}.dtr-table td,.dtr-table thead th+th{border-inline-start:1px solid var(--dsw-alias-border-l3)}.dtr-table th[scope=row]{font-weight:400}.dtr-table th strong,.dtr-table th code,.dtr-purpose{display:block}.dtr-table th code{font-size:11px;color:var(--dsw-alias-label-secondary)}.dtr-purpose,.dtr-target-summary{color:var(--dsw-alias-label-secondary);font-size:12px;margin:4px 0 0}.dtr-table tr:focus-within th[scope=row]{box-shadow:inset 3px 0 var(--dsw-alias-brand-primary)}
.dtr-controls{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,10.5rem),1fr));gap:8px 12px;align-items:end}.dtr-controls>.dtr-target-summary{align-self:center}.dtr-table td>.dtr-target-summary{margin-top:8px}.dtr-field{display:flex;flex-direction:column;gap:4px;min-width:0;font-size:12px;color:var(--dsw-alias-label-secondary)}
.dtr-editor input,.dtr-editor select{font:inherit;font-size:13px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l3);border-radius:8px;padding:8px 10px;min-width:0;width:100%}.dtr-editor input[type=checkbox]{width:auto}
.dtr-editor button{font:inherit;font-size:13px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l3);border-radius:8px;padding:7px 12px;cursor:pointer}.dtr-editor button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.dtr-editor :focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.dtr-editor :disabled{opacity:.5;cursor:not-allowed}
.dtr-editor button.dtr-primary{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);font-weight:600}.dtr-error{color:var(--dsw-alias-state-error-primary)}.dtr-warning{color:var(--dsw-alias-label-secondary);border-inline-start:3px solid var(--dsw-alias-state-warn-primary);padding-inline-start:10px}.dtr-success{border-inline-start:3px solid var(--dsw-alias-state-success-primary);padding-inline-start:10px}.dtr-message{font-size:13px;white-space:pre-wrap;overflow-wrap:anywhere;margin:12px 0}
.dtr-editor [aria-invalid=true]{border-color:var(--dsw-alias-state-error-primary)}.dtr-footer{border-top:1px solid var(--dsw-alias-border-l3);margin-top:24px;padding-top:16px}.dtr-editor fieldset{border:0;margin:0;padding:0;min-width:0}.dtr-editor summary{cursor:pointer}.dtr-preview li{margin:8px 0;overflow-wrap:anywhere}
.dtr-picker{position:relative}.dtr-editor .dtr-trigger{display:flex;align-items:center;justify-content:space-between;text-align:start;gap:8px;background:var(--dsw-alias-bg-base)}.dtr-trigger span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dtr-menu{position:absolute;z-index:3;inset-inline-end:0;top:calc(100% + 4px);width:max(100%,min(20rem,56cqw));padding:8px;border:1px solid var(--dsw-alias-border-l3);border-radius:10px;background:var(--dsw-alias-bg-layer-1)}.dtr-menu-up{top:auto;bottom:calc(100% + 4px)}.dtr-options{overflow:auto;max-height:min(44vh,26rem);overscroll-behavior:contain;margin-top:6px}.dtr-group-name{display:flex;align-items:center;gap:8px;margin:10px 5px 3px;color:var(--dsw-alias-label-secondary)}.dtr-group-name::after{content:'';flex:1;border-top:1px solid var(--dsw-alias-border-l3)}.dtr-editor .dtr-option{display:flex;justify-content:space-between;width:100%;gap:6px;text-align:start;border:0;background:transparent;padding:6px 8px}.dtr-editor .dtr-option[aria-pressed=true]{color:var(--dsw-alias-brand-primary)}.dtr-options :focus-visible{outline-offset:-2px}
@container dtr-editor (max-width:600px){.dtr-category-col{width:30%}.dtr-table th,.dtr-table td{padding:9px 8px}.dtr-controls{gap:6px 8px}.dtr-table select{padding:7px 5px}}
`;
function ModelPicker({ t, catalog, status, selected, label, field, onSelect }) {
  const [open, setOpen] = React.useState(false);
  const [up, setUp] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const root = React.useRef(null);
  const trigger = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const outside = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const choose = (choice) => {
    if (choice?.provider !== selected?.provider || choice?.id !== selected?.id) onSelect(choice);
    close();
  };
  const filter = query.trim().toLowerCase();
  const groups = (open && !status ? catalog?.groups : [])?.map((group) => ({ ...group, models: group.models.filter((model) => [group.name, group.id, model.name, model.id].some((text3) => text3.toLowerCase().includes(filter))) })).filter((group) => group.models.length) ?? [];
  const option = (name, active, pick, key, disabled = false) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dtr-option", "aria-pressed": active, disabled, onClick: pick, children: [
    name,
    active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": "true", children: "\u2713" })
  ] }, key);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      className: "dtr-field dtr-picker",
      ref: root,
      onBlur: (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      },
      onKeyDown: (e) => {
        if (!open || e.nativeEvent.isComposing) return;
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          close();
        }
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        const buttons = Array.from(e.currentTarget.querySelectorAll(".dtr-option:not(:disabled)"));
        if (!buttons.length) return;
        e.preventDefault();
        const index = buttons.indexOf(e.target);
        buttons[e.key === "ArrowDown" ? Math.min(index + 1, buttons.length - 1) : index < 0 ? buttons.length - 1 : Math.max(index - 1, 0)]?.focus();
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { htmlFor: field.id, children: t("model") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            ...field,
            ref: (node) => {
              trigger.current = node;
              field.ref(node);
            },
            type: "button",
            className: "dtr-trigger",
            title: label,
            "aria-label": `${t("model")}: ${label}`,
            "aria-expanded": open,
            "aria-controls": open ? `${field.id}-menu` : void 0,
            onClick: (e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setUp(rect.top > window.innerHeight - rect.bottom && window.innerHeight - rect.bottom < Math.min(480, window.innerHeight * 0.52));
              setQuery("");
              setOpen(!open);
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": "true", children: "\u25BE" })
            ]
          }
        ),
        open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `dtr-menu${up ? " dtr-menu-up" : ""}`, id: `${field.id}-menu`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { autoFocus: true, type: "search", "aria-label": t("searchModels"), placeholder: t("searchModels"), value: query, onChange: (e) => setQuery(e.target.value) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-options", children: [
            !filter && option(t("inherit"), !selected, () => choose(), "inherit"),
            groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { role: "group", "aria-label": group.name, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dtr-group-name", children: group.name }),
              group.models.map((model) => option(
                model.name,
                selected?.provider === group.id && selected.id === model.id,
                () => choose({ provider: group.id, id: model.id }),
                model.id,
                catalog?.failures.some((f) => f.id === group.id)
              ))
            ] }, group.id)),
            !groups.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-muted", role: "status", children: status ?? t("noModels") })
          ] })
        ] })
      ]
    }
  );
}
var inject = ["slots", "locale", "configForms", "remote", "remote.session"];
function apply(ctx) {
  const client = ctx;
  ctx.effect(() => client.locale.register(NS, { en, zh }), "team-router: editor dictionaries");
  const form = client.configForms.get("team-router");
  const readForm = () => form.getSnapshot();
  const subscribeForm = (listener) => form.subscribe(listener);
  function Editor({ t: t2 }) {
    const [editor, setEditor] = React.useState();
    React.useLayoutEffect(() => {
      const mounted = new RoutingEditor(form);
      setEditor(mounted);
      return () => mounted.dispose();
    }, []);
    return editor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorForm, { t: t2, editor }) : null;
  }
  function EditorForm({ t: t2, editor }) {
    const host = React.useSyncExternalStore(subscribeForm, readForm);
    const state = React.useSyncExternalStore(editor.subscribe, editor.getSnapshot);
    const [catalog, setCatalog] = React.useState();
    const [catalogBusy, setCatalogBusy] = React.useState(true);
    const [catalogError, setCatalogError] = React.useState();
    const [retry, setRetry] = React.useState(0);
    const [overwrite, setOverwrite] = React.useState(false);
    const [preview, setPreview] = React.useState();
    const [previewError, setPreviewError] = React.useState();
    const [focus, setFocus] = React.useState();
    const fields = React.useRef(/* @__PURE__ */ new Map());
    const issueSummary = React.useRef(null);
    const instance = React.useId();
    const locale = t2("language") === "zh" ? "zh" : "en";
    const draft = state.draft;
    const hostDisabled = state.saving || host.status !== "ready" || !host.writable;
    const disabled = hostDisabled || preview !== void 0;
    const catalogReady = catalog !== void 0 && !catalogBusy && catalogError === void 0;
    React.useEffect(() => {
      let active = true;
      let generation = 0;
      const refresh = async () => {
        const current = ++generation;
        setCatalogBusy(true);
        try {
          const response = await client.remote.session.modelCatalog();
          if (!active || current !== generation) return;
          if (response.ok) {
            setCatalog(response.value);
            setCatalogError(void 0);
          } else setCatalogError(response.error.message);
        } catch (error) {
          if (active && current === generation) setCatalogError(error instanceof Error ? error.message : String(error));
        } finally {
          if (active && current === generation) setCatalogBusy(false);
        }
      };
      const stops = [
        ...["llm/adapters-updated", "llm/models-updated", "settings/document-updated", "credentials/record-updated", "credentials/reference-updated"].map((event) => client.remote.$on(event, () => {
          void refresh();
        })),
        client.on("connection/reset", () => {
          void refresh();
        })
      ];
      void refresh();
      return () => {
        active = false;
        generation++;
        for (const stop of stops) stop();
      };
    }, [retry]);
    React.useLayoutEffect(() => {
      if (!focus) return;
      const field = fields.current.get(focus);
      if (field && !field.matches(":disabled")) {
        const details = field.closest("details");
        if (details) details.open = true;
        field.focus();
      } else {
        issueSummary.current?.focus();
      }
      setFocus(void 0);
    }, [focus, state.issue, draft]);
    const fieldKey = (section, field) => `${section}:${field}`;
    const fieldProps = (section, field) => {
      const key = fieldKey(section, field);
      const invalid = state.issue?.section === section && state.issue.field === field;
      return {
        id: `dtr-${instance}-${section}-${field}`,
        ref: (node) => {
          if (node) fields.current.set(key, node);
          else fields.current.delete(key);
        },
        "aria-invalid": invalid || void 0,
        "aria-describedby": invalid ? `dtr-${instance}-issue` : void 0
      };
    };
    const targetLabel = (target2) => {
      const executor = target2.executor === "native" ? t2("native") : target2.executor;
      if (target2.model.mode === "inherit") return `${executor} \xB7 ${t2("inherit")}`;
      if (target2.model.mode === "executor-default") return `${executor} \xB7 ${t2("executorDefault")}`;
      const model = target2.model;
      return `${executor} \xB7 ${"provider" in model ? `${model.provider} / ` : ""}${model.id}${model.reasoningEffort ? ` \xB7 ${model.reasoningEffort}` : ""}`;
    };
    const bindingLabel = (binding2) => binding2.mode === "default" ? t2("useDefault") : targetLabel(binding2.target);
    const updateTarget = (section, target2) => {
      if (!draft) return;
      editor.edit(section === "default" ? { ...draft, defaultTarget: target2 } : { ...draft, categories: { ...draft.categories, [section]: { mode: "target", target: target2 } } }, state.revision);
    };
    const targetFields = (section, target2) => {
      const explicit = target2.executor === "native" && target2.model.mode === "explicit" ? target2.model : void 0;
      const group = explicit ? catalog?.groups.find((group2) => group2.id === explicit.provider) : void 0;
      const model = explicit ? group?.models.find((model2) => model2.id === explicit.id) : void 0;
      const efforts = model?.reasoning?.efforts ?? [];
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dtr-field", children: [
          t2("executor"),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { ...fieldProps(section, "executor"), value: target2.executor, onChange: () => updateTarget(section, { executor: "native", model: { mode: "inherit" } }), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "native", children: t2("native") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "codex", disabled: true, children: "Codex \xB7 P0" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "agy", disabled: true, children: "Antigravity (agy) \xB7 P0" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "cursor", disabled: true, children: "Cursor \xB7 P0" })
          ] })
        ] }),
        target2.executor === "native" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          ModelPicker,
          {
            t: t2,
            catalog,
            status: catalogBusy ? t2("catalogLoading") : catalogError === void 0 ? void 0 : t2("catalogError", { message: catalogError }),
            selected: explicit,
            field: fieldProps(section, state.issue?.section === section && state.issue.field === "provider" ? "provider" : "model"),
            label: !explicit ? t2("inherit") : !explicit.id ? t2("chooseModel") : model && !catalog?.failures.some((f) => f.id === explicit.provider) ? `${group.name} / ${model.name}` : catalogReady ? t2("unavailableOption", { name: `${explicit.provider} / ${explicit.id}` }) : `${explicit.provider} / ${explicit.id}`,
            onSelect: (choice) => editor.setNativeModelMode(section, choice ? "explicit" : "inherit", state.revision, choice)
          }
        ),
        explicit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: (efforts.length > 0 || explicit.reasoningEffort !== void 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dtr-field", children: [
          t2("effort"),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { ...fieldProps(section, "effort"), value: explicit.reasoningEffort ?? "", disabled: !catalogReady || !model, onChange: (event) => updateTarget(section, { executor: "native", model: { mode: "explicit", provider: explicit.provider, id: explicit.id, ...event.target.value ? { reasoningEffort: event.target.value } : {} } }), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: t2("modelDefault") }),
            explicit.reasoningEffort && !efforts.some((effort) => effort.id === explicit.reasoningEffort) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: explicit.reasoningEffort, children: t2("unavailableOption", { name: explicit.reasoningEffort }) }),
            efforts.map((effort) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: effort.id, children: effort.name }, effort.id))
          ] })
        ] }) })
      ] });
    };
    const routeRow = (section, name, purpose) => {
      if (!draft) return null;
      const binding2 = section === "default" ? void 0 : draft.categories[section];
      const inherited = binding2?.mode === "default";
      const target2 = binding2?.mode === "target" ? binding2.target : draft.defaultTarget;
      const titleId = `dtr-${instance}-${section}-title`;
      const summary = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-target-summary", children: t2(state.dirty ? "draftTarget" : "configured", { target: targetLabel(target2) }) });
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", { scope: "row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { id: titleId, children: name }),
          section !== "default" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: section }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dtr-purpose", children: purpose })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { role: "group", "aria-labelledby": titleId, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-controls", children: [
            section !== "default" && binding2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dtr-field", children: [
              t2("binding"),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { value: binding2.mode, onChange: (event) => editor.setCategoryMode(section, event.target.value, state.revision), children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "default", children: t2("useDefault") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "target", children: t2("custom") })
              ] })
            ] }),
            inherited ? summary : targetFields(section, target2)
          ] }),
          !inherited && summary,
          !inherited && target2.executor !== "native" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-warning dtr-message", children: t2("externalBlocked") })
        ] }) })
      ] }, section);
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
        setPreview({ value: previewRecommendations(routingDraftToPolicy(draft), catalog, { overwrite }), revision: state.revision });
        setPreviewError(void 0);
      } catch (error) {
        setPreviewError(error instanceof Error ? error.message : String(error));
      }
    };
    const issueMessage = (issue) => issue.detail ?? t2(issue.reason);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-editor", "aria-busy": state.saving, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: CSS }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t2("title") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-muted", children: t2("description") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-note dtr-muted", children: t2("authorization") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-muted", children: t2("switchingHint") }),
      host.status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "status", children: t2("loading") }),
      host.status === "unavailable" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "status", children: t2("unavailable") }),
      host.status === "ready" && !host.writable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-warning", role: "status", children: t2("readOnly") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-inline", children: [
        catalogBusy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dtr-muted", role: "status", children: t2("catalogLoading") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => setRetry((value) => value + 1), disabled: catalogBusy, children: t2("retry") })
      ] }),
      catalogError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-error dtr-message", role: "alert", children: t2("catalogError", { message: catalogError }) }),
      catalog && catalog.failures.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-warning dtr-message", role: "status", children: t2("catalogPartial", { message: catalog.failures.map((entry) => `${entry.name}: ${entry.message}`).join("; ") }) }),
      draft && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        state.migrationRequired && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "dtr-note", "aria-labelledby": `dtr-${instance}-migration`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { id: `dtr-${instance}-migration`, children: t2("migrationTitle") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-muted", children: t2("migrationHint") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t2("migrationCounts", { routes: state.retired?.routes.length ?? 0, rules: state.retired?.ruleCount ?? 0, roles: state.retired?.roleCount ?? 0 }) }),
          state.migrationConfirmed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "status", children: t2("migrationConfirmed") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: disabled || state.stale, onClick: () => editor.confirmMigration(state.revision), children: t2("confirmMigration") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { disabled, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "dtr-section", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { id: `dtr-${instance}-presets`, children: t2("categories") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-muted", children: t2("recommendationHint", { version: RECOMMENDATION_VERSION }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dtr-inline dtr-muted", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: overwrite, onChange: (event) => setOverwrite(event.target.checked) }),
              t2("overwrite")
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: !catalogReady || state.stale, onClick: makePreview, children: t2("recommendations") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { className: "dtr-table", "aria-labelledby": `dtr-${instance}-presets`, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("colgroup", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", { className: "dtr-category-col" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("col", {})
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { scope: "col", children: t2("categoryColumn") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { scope: "col", children: t2("targetColumn") })
              ] }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
                routeRow("default", t2("defaults"), t2("defaultPurpose")),
                CATEGORY_LIST.map((entry) => routeRow(entry.id, entry[locale].name, entry[locale].purpose))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { className: "dtr-section", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: t2("advanced") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "dtr-warning dtr-message", children: [
              "Codex / Antigravity (agy) / Cursor: ",
              t2("externalBlocked")
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dtr-field", children: [
              t2("historyLimit"),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { ...fieldProps("default", "historyLimit"), type: "number", min: 1, max: 1e3, step: 1, value: draft.historyLimit, onChange: (event) => editor.edit({ ...draft, historyLimit: event.target.value }, state.revision) })
            ] })
          ] })
        ] }),
        preview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "dtr-note dtr-preview", role: "group", "aria-labelledby": `dtr-${instance}-preview-title`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { id: `dtr-${instance}-preview-title`, children: t2("previewTitle") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-muted", children: t2("previewHint") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: preview.value.changes.map((change) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
              CATEGORY_LIST.find((entry) => entry.id === change.category)?.[locale].name,
              " \xB7 ",
              change.category
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
            bindingLabel(change.before),
            " \u2192 ",
            targetLabel(change.after.target)
          ] }, change.category)) }),
          preview.value.changes.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t2("noChanges") }),
          (preview.revision !== host.revision || preview.revision !== state.revision) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-warning dtr-message", role: "status", children: t2("previewChanged") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "dtr-muted", children: [
            t2("preserved", { count: preview.value.preserved.length }),
            " \xB7 ",
            t2("unmatched", { count: preview.value.unavailable.length })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-inline", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", autoFocus: true, onClick: () => setPreview(void 0), children: t2("cancelPreview") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: hostDisabled || state.stale || preview.value.changes.length === 0 || preview.revision !== state.revision || host.revision !== preview.revision, onClick: () => {
              if (editor.applyRecommendations(preview.value, preview.revision)) setPreview(void 0);
            }, children: t2("applyPreview") })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-footer", "aria-live": "polite", children: [
        state.stale && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-warning dtr-message", children: t2("stale") }),
        state.issue && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { ref: issueSummary, tabIndex: -1, id: `dtr-${instance}-issue`, role: "alert", className: "dtr-error dtr-message", children: [
          state.issue.section === "default" ? t2("defaults") : CATEGORIES[state.issue.section][locale].name,
          " \xB7 ",
          t2(state.issue.field),
          ": ",
          issueMessage(state.issue)
        ] }),
        previewError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "alert", className: "dtr-error dtr-message", children: t2("validationError", { message: previewError }) }),
        state.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "alert", className: "dtr-error dtr-message", children: state.error.kind === "refused" ? t2("refused") : state.error.kind === "migration" ? t2("migrationRequired") : state.error.kind === "previewChanged" ? t2("previewChanged") : t2(state.error.kind === "validation" ? "validationError" : "transportError", { message: state.error.detail }) }),
        state.notice === "saved" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-success dtr-message", children: t2("saved") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dtr-muted", children: t2(state.dirty ? "dirty" : "current") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-inline", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: state.saving || preview !== void 0 || !state.dirty && !state.stale, onClick: () => {
              setPreviewError(void 0);
              editor.discard();
            }, children: t2(state.stale ? "reload" : "cancel") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dtr-primary", disabled: disabled || !state.dirty || state.stale, onClick: save, children: t2(state.saving ? "saving" : "save") })
          ] })
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
;return module.exports;}});
//# sourceMappingURL=client.js.map
