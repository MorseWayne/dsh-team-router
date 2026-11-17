window.__ModuleLoader__.load({id:"dsh-team-router",factory(require){var module={exports:{}};var exports=module.exports;
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
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

// src/editor.ts
var sequence = 0;
function rowKey() {
  return `row-${++sequence}`;
}
function policyToDraft(policy) {
  return {
    routes: Object.entries(policy.routes).map(([name, route]) => ({ key: rowKey(), name, ...route, reasoningEffort: route.reasoningEffort ?? "" })),
    rules: policy.rules.map((rule) => ({ key: rowKey(), id: rule.id, keywords: rule.keywords.join("\n"), route: rule.route, priority: String(rule.priority) })),
    roles: Object.entries(policy.roles).map(([name, route]) => ({ key: rowKey(), name, route })),
    defaultRoute: policy.defaultRoute ?? "",
    historyLimit: String(policy.historyLimit)
  };
}
function draftToPolicy(draft) {
  const routes = /* @__PURE__ */ Object.create(null);
  for (const row of draft.routes) {
    const name = row.name.trim();
    if (Object.hasOwn(routes, name)) throw new TypeError(`config.routes: duplicate route name ${JSON.stringify(name)}`);
    routes[name] = {
      provider: row.provider.trim(),
      model: row.model.trim(),
      ...row.reasoningEffort.trim() === "" ? {} : { reasoningEffort: row.reasoningEffort.trim() }
    };
  }
  const roles = /* @__PURE__ */ Object.create(null);
  for (const row of draft.roles) {
    if (Object.hasOwn(roles, row.name)) throw new TypeError(`config.roles: duplicate member name ${JSON.stringify(row.name)}`);
    roles[row.name] = row.route;
  }
  return parseConfig({
    routes,
    rules: draft.rules.map((row) => ({
      id: row.id,
      keywords: row.keywords.split(/\r?\n/).map((word) => word.trim()).filter(Boolean),
      route: row.route,
      priority: row.priority.trim() === "" ? 0 : Number(row.priority)
    })),
    roles,
    ...draft.defaultRoute.trim() === "" ? {} : { defaultRoute: draft.defaultRoute },
    historyLimit: Number(draft.historyLimit)
  });
}
var unsafeNames = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]);
function draftValidationIssue(draft) {
  const issue = (rowKey2, field, reasonKey) => ({ rowKey: rowKey2, field, reasonKey });
  const routes = /* @__PURE__ */ new Set();
  for (const [index, row] of draft.routes.entries()) {
    const name = row.name.trim();
    if (index >= 64) return issue(row.key, "routeName", "validationRouteLimit");
    if (!name) return issue(row.key, "routeName", "validationRequired");
    if (unsafeNames.has(name)) return issue(row.key, "routeName", "validationUnsafeName");
    if (routes.has(name)) return issue(row.key, "routeName", "validationDuplicateRoute");
    routes.add(name);
    if (!row.provider.trim()) return issue(row.key, "provider", "validationRequired");
    if (!row.model.trim()) return issue(row.key, "model", "validationRequired");
  }
  const ruleIds = /* @__PURE__ */ new Set();
  for (const [index, row] of draft.rules.entries()) {
    const id = row.id.trim();
    if (index >= 64) return issue(row.key, "ruleId", "validationRuleLimit");
    if (!id) return issue(row.key, "ruleId", "validationRequired");
    if (ruleIds.has(id)) return issue(row.key, "ruleId", "validationDuplicateRule");
    ruleIds.add(id);
    const priority = row.priority.trim() === "" ? 0 : Number(row.priority);
    if (!Number.isInteger(priority) || priority < -1e3 || priority > 1e3) return issue(row.key, "priority", "validationPriority");
    const words = row.keywords.split(/\r?\n/).map((word) => word.trim()).filter(Boolean);
    if (words.length > 32) return issue(row.key, "keywords", "validationKeywordLimit");
    if (words.some((word) => word.length > 100)) return issue(row.key, "keywords", "validationKeywordLength");
    if (!row.route.trim()) return issue(row.key, "target", "validationRequired");
    if (!routes.has(row.route.trim())) return issue(row.key, "target", "validationUnknownRoute");
  }
  const roles = /* @__PURE__ */ new Set();
  for (const row of draft.roles) {
    if (!row.name.trim()) return issue(row.key, "memberName", "validationRequired");
    if (unsafeNames.has(row.name)) return issue(row.key, "memberName", "validationUnsafeName");
    if (roles.has(row.name)) return issue(row.key, "memberName", "validationDuplicateRole");
    roles.add(row.name);
    if (!row.route.trim()) return issue(row.key, "target", "validationRequired");
    if (!routes.has(row.route.trim())) return issue(row.key, "target", "validationUnknownRoute");
  }
  if (draft.defaultRoute.trim() && !routes.has(draft.defaultRoute.trim())) return issue("defaults", "defaultRoute", "validationUnknownRoute");
  const limit = Number(draft.historyLimit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 1e3) return issue("defaults", "historyLimit", "validationHistory");
  return void 0;
}
function policyRequiresCatalog(policy) {
  return Object.keys(policy.routes).length > 0;
}
function policyMutations(policy) {
  return [
    { op: "set", path: ["routes"], value: policy.routes },
    { op: "set", path: ["rules"], value: policy.rules },
    { op: "set", path: ["roles"], value: policy.roles },
    // null explicitly disables a composition default; unset would re-inherit it.
    { op: "set", path: ["defaultRoute"], value: policy.defaultRoute ?? null },
    { op: "set", path: ["historyLimit"], value: policy.historyLimit }
  ];
}
function resetMutations() {
  return ["routes", "rules", "roles", "defaultRoute", "historyLimit"].map((field) => ({ op: "unset", path: [field] }));
}
function moveRule(rows, index, delta) {
  const next = [...rows];
  const target = index + delta;
  if (index < 0 || index >= rows.length || target < 0 || target >= rows.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
var PolicyEditor = class {
  snapshot = { draft: void 0, revision: void 0, dirty: false, saving: false, stale: false, error: void 0, notice: void 0 };
  listeners = /* @__PURE__ */ new Set();
  stop;
  disposed = false;
  form;
  constructor(form) {
    this.form = form;
    this.accept();
    this.stop = form.subscribe(() => {
      if (this.snapshot.saving) return;
      if (!this.snapshot.dirty) this.accept();
      else this.publish({ ...this.snapshot, stale: form.getSnapshot().revision !== this.snapshot.revision });
    });
  }
  getSnapshot = () => this.snapshot;
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
  publish(snapshot) {
    if (this.disposed) return;
    this.snapshot = snapshot;
    for (const listener of this.listeners) listener();
  }
  accept(notice) {
    const host = this.form.getSnapshot();
    this.publish({ draft: host.value === void 0 ? void 0 : policyToDraft(host.value), revision: host.revision, dirty: false, saving: false, stale: false, error: void 0, notice });
  }
  edit(draft, revision = this.snapshot.revision) {
    if (this.snapshot.saving || !this.form.getSnapshot().writable) return;
    this.publish({ ...this.snapshot, draft, revision, dirty: true, stale: this.form.getSnapshot().revision !== revision, error: void 0, notice: void 0 });
  }
  /** Explicit cancel/reload is the only operation that drops a stale dirty draft. */
  discard() {
    if (!this.snapshot.saving) this.accept();
  }
  save() {
    return this.commit(false, this.snapshot.revision);
  }
  reset(confirmedRevision = this.snapshot.revision) {
    return this.commit(true, confirmedRevision);
  }
  async commit(reset, confirmedRevision) {
    const state = this.snapshot;
    const host = this.form.getSnapshot();
    if (state.saving || state.draft === void 0 || confirmedRevision === void 0 || host.status !== "ready" || !host.writable) return false;
    if (reset && (state.dirty || host.revision !== confirmedRevision || state.revision !== confirmedRevision)) return false;
    let ops;
    try {
      ops = reset ? resetMutations() : policyMutations(draftToPolicy(state.draft));
    } catch (error) {
      this.publish({ ...state, error: { kind: "validation", detail: error instanceof Error ? error.message : String(error) }, notice: void 0 });
      return false;
    }
    this.publish({ ...state, saving: true, error: void 0, notice: void 0 });
    try {
      const accepted = await this.form.mutate(ops, confirmedRevision);
      if (accepted) this.accept(reset ? "reset" : "saved");
      else this.publish({ ...state, saving: false, stale: this.form.getSnapshot().revision !== state.revision, error: { kind: "refused", detail: "" }, notice: void 0 });
      return accepted;
    } catch (error) {
      this.publish({ ...state, saving: false, stale: this.form.getSnapshot().revision !== state.revision, error: { kind: "transport", detail: error instanceof Error ? error.message : String(error) }, notice: void 0 });
      return false;
    }
  }
};

// src/client.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var NS = "teamRouter";
var en = {
  title: "Team model routing",
  description: "Route native teammates without replacing Agent Teams. Changes affect future turn/task boundaries, never an admitted model request.",
  precedence: "Priority: lead override \u2192 matching task rule \u2192 exact teammate name \u2192 default route \u2192 inherited model. Higher rule priority wins; ties follow row order.",
  routes: "Model routes",
  routesHint: "Give each reusable provider/model selection a unique name. Models and reasoning efforts come from the live Host catalog.",
  addRoute: "Add route",
  routeName: "Route name",
  provider: "Provider",
  model: "Model",
  effort: "Reasoning effort",
  providerDefault: "Provider default",
  chooseProvider: "Choose a provider",
  chooseModel: "Choose a model",
  remove: "Remove",
  removeRow: "Remove {name}",
  notLoaded: "{name} (not currently available)",
  rules: "Task rules",
  rulesHint: "Any keyword can match task text. ASCII words use word boundaries; other keywords use substring matching. Put one keyword on each line.",
  addRule: "Add rule",
  ruleId: "Rule ID",
  ruleNumber: "Rule {number}",
  priority: "Priority (\u22121000 to 1000)",
  keywords: "Keywords (one per line)",
  target: "Target route",
  chooseRoute: "Choose a route",
  moveUp: "Move rule up",
  moveDown: "Move rule down",
  roles: "Teammate roles",
  rolesHint: "Exact native teammate names, not job categories. Whitespace and case are significant.",
  addRole: "Add teammate role",
  memberName: "Exact teammate name",
  defaults: "Fallback and history",
  defaultRoute: "Default route",
  inherit: "Inherit the teammate\u2019s model",
  historyLimit: "History limit (1\u20131000)",
  loading: "Loading Host configuration\u2026",
  unavailable: "The team-router entry is not served by this Host.",
  readOnly: "This Host configuration is read-only.",
  catalogLoading: "Loading the live model catalog\u2026",
  catalogError: "Could not load the model catalog: {message}",
  catalogPartial: "Some providers could not be loaded: {message}",
  retry: "Retry catalog",
  catalogRequired: "Load the live model catalog before saving. Your draft has been kept.",
  catalogInvalid: "Route \u201C{name}\u201D is not available in the live catalog. Check its provider, model, and reasoning effort. Your draft has been kept.",
  save: "Save policy",
  saving: "Saving\u2026",
  cancel: "Cancel edits",
  reload: "Discard draft and reload Host values",
  reset: "Restore inherited policy",
  resetHint: "Cancel edits first to restore the composition\u2019s inherited policy. The state directory is never changed.",
  saved: "Policy saved. Future routing boundaries will use these values.",
  resetDone: "Inherited policy restored.",
  dirty: "Unsaved changes",
  current: "Up to date",
  stale: "The Host changed while you were editing. Your draft is preserved; reload before applying a new edit.",
  refused: "The Host refused this save (for example, a revision conflict or validation failure). Your draft is preserved. Reload explicitly or correct the configuration; no automatic overwrite was attempted.",
  validationError: "Invalid policy: {message}",
  transportError: "Save failed: {message}. Your draft is preserved.",
  noRoutes: "No named routes. With no default, teammates inherit their model.",
  noRules: "No task rules.",
  noRoles: "No exact-name role mappings.",
  unknownRoute: "{name} (missing route)",
  resetConfirmTitle: "Restore inherited policy?",
  resetConfirmBody: "This removes the five user overrides: routes, rules, roles, default route, and history limit. Composition values will apply again. The state directory and routing history files are preserved.",
  resetConfirm: "Confirm restore",
  resetCancel: "Keep current policy",
  resetChanged: "The Host changed after this confirmation opened. Cancel and review the new values before restoring.",
  ruleGroup: "Task rule {number}: {name}",
  unnamed: "unnamed",
  moveUpRule: "Move rule {name} up",
  moveDownRule: "Move rule {name} down",
  routeAdded: "Route row {number} added. Enter its name.",
  ruleAdded: "Rule row {number} added. Enter its ID.",
  roleAdded: "Teammate role row {number} added. Enter the exact name.",
  validationSummary: "{field}: {reason}",
  validationRequired: "This field is required.",
  validationDuplicateRoute: "Route names must be unique after trimming whitespace.",
  validationUnsafeName: "This reserved name is not allowed.",
  validationRouteLimit: "Use at most 64 model routes.",
  validationDuplicateRule: "Rule IDs must be unique after trimming whitespace.",
  validationRuleLimit: "Use at most 64 rules.",
  validationPriority: "Enter an integer from \u22121000 to 1000.",
  validationKeywordLimit: "Use at most 32 keywords.",
  validationKeywordLength: "Each keyword must be at most 100 characters.",
  validationDuplicateRole: "Each exact teammate name may appear only once.",
  validationUnknownRoute: "Choose an existing named route.",
  validationHistory: "Enter an integer from 1 to 1000.",
  validationCatalog: "This selection is not available in the live model catalog."
};
var zh = {
  title: "\u56E2\u961F\u6A21\u578B\u8DEF\u7531",
  description: "\u4E3A\u539F\u751F\u961F\u53CB\u5206\u914D\u6A21\u578B\uFF0C\u4E0D\u66FF\u6362 Agent Teams\u3002\u4FEE\u6539\u4EC5\u5728\u540E\u7EED\u8F6E\u6B21\u6216\u4EFB\u52A1\u8FB9\u754C\u751F\u6548\uFF0C\u4E0D\u6539\u53D8\u5DF2\u5F00\u59CB\u7684\u6A21\u578B\u8BF7\u6C42\u3002",
  precedence: "\u4F18\u5148\u7EA7\uFF1ALead \u624B\u52A8\u8986\u76D6 \u2192 \u5339\u914D\u7684\u4EFB\u52A1\u89C4\u5219 \u2192 \u7CBE\u786E\u961F\u53CB\u540D \u2192 \u9ED8\u8BA4\u8DEF\u7531 \u2192 \u7EE7\u627F\u6A21\u578B\u3002\u89C4\u5219\u4F18\u5148\u7EA7\u6570\u503C\u8D8A\u9AD8\u8D8A\u5148\u5339\u914D\uFF1B\u540C\u4F18\u5148\u7EA7\u6309\u884C\u987A\u5E8F\u3002",
  routes: "\u6A21\u578B\u8DEF\u7531",
  routesHint: "\u4E3A\u53EF\u590D\u7528\u7684\u4F9B\u5E94\u5546\u548C\u6A21\u578B\u7EC4\u5408\u8BBE\u7F6E\u552F\u4E00\u540D\u79F0\u3002\u6A21\u578B\u53CA\u63A8\u7406\u5F3A\u5EA6\u6765\u81EA\u5F53\u524D Host \u7684\u5B9E\u65F6\u76EE\u5F55\u3002",
  addRoute: "\u6DFB\u52A0\u8DEF\u7531",
  routeName: "\u8DEF\u7531\u540D\u79F0",
  provider: "\u4F9B\u5E94\u5546",
  model: "\u6A21\u578B",
  effort: "\u63A8\u7406\u5F3A\u5EA6",
  providerDefault: "\u4F9B\u5E94\u5546\u9ED8\u8BA4\u503C",
  chooseProvider: "\u9009\u62E9\u4F9B\u5E94\u5546",
  chooseModel: "\u9009\u62E9\u6A21\u578B",
  remove: "\u5220\u9664",
  removeRow: "\u5220\u9664 {name}",
  notLoaded: "{name}\uFF08\u5F53\u524D\u4E0D\u53EF\u7528\uFF09",
  rules: "\u4EFB\u52A1\u89C4\u5219",
  rulesHint: "\u4EFB\u4E00\u5173\u952E\u8BCD\u53EF\u5339\u914D\u4EFB\u52A1\u6587\u672C\u3002ASCII \u5355\u8BCD\u6309\u8BCD\u8FB9\u754C\u5339\u914D\uFF0C\u5176\u4ED6\u5173\u952E\u8BCD\u6309\u5B50\u4E32\u5339\u914D\u3002\u6BCF\u884C\u586B\u5199\u4E00\u4E2A\u5173\u952E\u8BCD\u3002",
  addRule: "\u6DFB\u52A0\u89C4\u5219",
  ruleId: "\u89C4\u5219 ID",
  ruleNumber: "\u89C4\u5219 {number}",
  priority: "\u4F18\u5148\u7EA7\uFF08\u22121000 \u81F3 1000\uFF09",
  keywords: "\u5173\u952E\u8BCD\uFF08\u6BCF\u884C\u4E00\u4E2A\uFF09",
  target: "\u76EE\u6807\u8DEF\u7531",
  chooseRoute: "\u9009\u62E9\u8DEF\u7531",
  moveUp: "\u4E0A\u79FB\u89C4\u5219",
  moveDown: "\u4E0B\u79FB\u89C4\u5219",
  roles: "\u961F\u53CB\u89D2\u8272",
  rolesHint: "\u586B\u5199\u7CBE\u786E\u7684\u539F\u751F\u961F\u53CB\u540D\u79F0\uFF0C\u800C\u975E\u5C97\u4F4D\u7C7B\u522B\u3002\u540D\u79F0\u533A\u5206\u5927\u5C0F\u5199\uFF0C\u7A7A\u683C\u4E5F\u987B\u4E00\u81F4\u3002",
  addRole: "\u6DFB\u52A0\u961F\u53CB\u89D2\u8272",
  memberName: "\u7CBE\u786E\u961F\u53CB\u540D\u79F0",
  defaults: "\u9ED8\u8BA4\u7B56\u7565\u4E0E\u5386\u53F2\u8BB0\u5F55",
  defaultRoute: "\u9ED8\u8BA4\u8DEF\u7531",
  inherit: "\u7EE7\u627F\u961F\u53CB\u7684\u6A21\u578B",
  historyLimit: "\u5386\u53F2\u8BB0\u5F55\u4E0A\u9650\uFF081\u20131000\uFF09",
  loading: "\u6B63\u5728\u8BFB\u53D6 Host \u914D\u7F6E\u2026",
  unavailable: "\u5F53\u524D Host \u672A\u63D0\u4F9B team-router \u914D\u7F6E\u9879\u3002",
  readOnly: "\u5F53\u524D Host \u914D\u7F6E\u4E3A\u53EA\u8BFB\u3002",
  catalogLoading: "\u6B63\u5728\u8BFB\u53D6\u5B9E\u65F6\u6A21\u578B\u76EE\u5F55\u2026",
  catalogError: "\u65E0\u6CD5\u8BFB\u53D6\u6A21\u578B\u76EE\u5F55\uFF1A{message}",
  catalogPartial: "\u90E8\u5206\u4F9B\u5E94\u5546\u76EE\u5F55\u8BFB\u53D6\u5931\u8D25\uFF1A{message}",
  retry: "\u91CD\u8BD5\u8BFB\u53D6\u76EE\u5F55",
  catalogRequired: "\u4FDD\u5B58\u524D\u8BF7\u5148\u8BFB\u53D6\u5B9E\u65F6\u6A21\u578B\u76EE\u5F55\u3002\u4F60\u7684\u8349\u7A3F\u5DF2\u4FDD\u7559\u3002",
  catalogInvalid: "\u8DEF\u7531\u201C{name}\u201D\u4E0D\u5728\u5B9E\u65F6\u6A21\u578B\u76EE\u5F55\u4E2D\u3002\u8BF7\u68C0\u67E5\u4F9B\u5E94\u5546\u3001\u6A21\u578B\u53CA\u63A8\u7406\u5F3A\u5EA6\u3002\u4F60\u7684\u8349\u7A3F\u5DF2\u4FDD\u7559\u3002",
  save: "\u4FDD\u5B58\u7B56\u7565",
  saving: "\u4FDD\u5B58\u4E2D\u2026",
  cancel: "\u53D6\u6D88\u4FEE\u6539",
  reload: "\u4E22\u5F03\u8349\u7A3F\u5E76\u91CD\u65B0\u8BFB\u53D6 Host \u914D\u7F6E",
  reset: "\u6062\u590D\u7EE7\u627F\u7684\u7B56\u7565",
  resetHint: "\u5982\u9700\u6062\u590D\u7EC4\u5408\u5C42\u7684\u7EE7\u627F\u7B56\u7565\uFF0C\u8BF7\u5148\u53D6\u6D88\u4FEE\u6539\u3002\u6B64\u64CD\u4F5C\u4E0D\u4F1A\u66F4\u6539\u72B6\u6001\u76EE\u5F55\u3002",
  saved: "\u7B56\u7565\u5DF2\u4FDD\u5B58\uFF0C\u5C06\u7528\u4E8E\u540E\u7EED\u8DEF\u7531\u8FB9\u754C\u3002",
  resetDone: "\u5DF2\u6062\u590D\u7EE7\u627F\u7684\u7B56\u7565\u3002",
  dirty: "\u6709\u672A\u4FDD\u5B58\u7684\u4FEE\u6539",
  current: "\u5DF2\u540C\u6B65",
  stale: "\u7F16\u8F91\u671F\u95F4 Host \u914D\u7F6E\u5DF2\u66F4\u65B0\u3002\u4F60\u7684\u8349\u7A3F\u5DF2\u4FDD\u7559\uFF1B\u8BF7\u5148\u91CD\u65B0\u8BFB\u53D6\uFF0C\u518D\u5E94\u7528\u65B0\u7684\u4FEE\u6539\u3002",
  refused: "Host \u62D2\u7EDD\u4E86\u672C\u6B21\u4FDD\u5B58\uFF08\u53EF\u80FD\u662F\u7248\u672C\u51B2\u7A81\u6216\u914D\u7F6E\u6821\u9A8C\u672A\u901A\u8FC7\uFF09\u3002\u8349\u7A3F\u5DF2\u4FDD\u7559\uFF0C\u8BF7\u660E\u786E\u91CD\u65B0\u8BFB\u53D6\u914D\u7F6E\u6216\u4FEE\u6B63\u8F93\u5165\uFF1B\u672A\u81EA\u52A8\u8986\u76D6\u5176\u4ED6\u4FEE\u6539\u3002",
  validationError: "\u7B56\u7565\u4E0D\u5408\u6CD5\uFF1A{message}",
  transportError: "\u4FDD\u5B58\u5931\u8D25\uFF1A{message}\u3002\u4F60\u7684\u8349\u7A3F\u5DF2\u4FDD\u7559\u3002",
  noRoutes: "\u5C1A\u65E0\u547D\u540D\u8DEF\u7531\u3002\u672A\u8BBE\u7F6E\u9ED8\u8BA4\u8DEF\u7531\u65F6\uFF0C\u961F\u53CB\u7EE7\u627F\u5176\u6A21\u578B\u3002",
  noRules: "\u5C1A\u65E0\u4EFB\u52A1\u89C4\u5219\u3002",
  noRoles: "\u5C1A\u65E0\u7CBE\u786E\u540D\u79F0\u89D2\u8272\u6620\u5C04\u3002",
  unknownRoute: "{name}\uFF08\u8DEF\u7531\u4E0D\u5B58\u5728\uFF09",
  resetConfirmTitle: "\u6062\u590D\u7EE7\u627F\u7684\u7B56\u7565\uFF1F",
  resetConfirmBody: "\u6B64\u64CD\u4F5C\u5C06\u6E05\u9664\u8DEF\u7531\u3001\u89C4\u5219\u3001\u89D2\u8272\u3001\u9ED8\u8BA4\u8DEF\u7531\u53CA\u5386\u53F2\u4E0A\u9650\u8FD9\u4E94\u9879\u7528\u6237\u8986\u76D6\uFF0C\u91CD\u65B0\u4F7F\u7528\u7EC4\u5408\u5C42\u7684\u914D\u7F6E\u3002\u72B6\u6001\u76EE\u5F55\u53CA\u8DEF\u7531\u5386\u53F2\u6587\u4EF6\u4F1A\u5B8C\u6574\u4FDD\u7559\u3002",
  resetConfirm: "\u786E\u8BA4\u6062\u590D",
  resetCancel: "\u4FDD\u7559\u5F53\u524D\u7B56\u7565",
  resetChanged: "\u786E\u8BA4\u754C\u9762\u6253\u5F00\u540E Host \u914D\u7F6E\u53D1\u751F\u4E86\u53D8\u5316\u3002\u8BF7\u5148\u53D6\u6D88\uFF0C\u68C0\u67E5\u6700\u65B0\u914D\u7F6E\u540E\u518D\u6062\u590D\u3002",
  ruleGroup: "\u4EFB\u52A1\u89C4\u5219 {number}\uFF1A{name}",
  unnamed: "\u672A\u547D\u540D",
  moveUpRule: "\u4E0A\u79FB\u89C4\u5219 {name}",
  moveDownRule: "\u4E0B\u79FB\u89C4\u5219 {name}",
  routeAdded: "\u5DF2\u6DFB\u52A0\u7B2C {number} \u6761\u8DEF\u7531\uFF0C\u8BF7\u586B\u5199\u540D\u79F0\u3002",
  ruleAdded: "\u5DF2\u6DFB\u52A0\u7B2C {number} \u6761\u89C4\u5219\uFF0C\u8BF7\u586B\u5199 ID\u3002",
  roleAdded: "\u5DF2\u6DFB\u52A0\u7B2C {number} \u6761\u961F\u53CB\u89D2\u8272\uFF0C\u8BF7\u586B\u5199\u7CBE\u786E\u540D\u79F0\u3002",
  validationSummary: "{field}\uFF1A{reason}",
  validationRequired: "\u6B64\u9879\u4E0D\u80FD\u4E3A\u7A7A\u3002",
  validationDuplicateRoute: "\u53BB\u9664\u9996\u5C3E\u7A7A\u683C\u540E\u7684\u8DEF\u7531\u540D\u79F0\u5FC5\u987B\u552F\u4E00\u3002",
  validationUnsafeName: "\u4E0D\u80FD\u4F7F\u7528\u6B64\u4FDD\u7559\u540D\u79F0\u3002",
  validationRouteLimit: "\u6700\u591A\u53EF\u914D\u7F6E 64 \u6761\u6A21\u578B\u8DEF\u7531\u3002",
  validationDuplicateRule: "\u53BB\u9664\u9996\u5C3E\u7A7A\u683C\u540E\u7684\u89C4\u5219 ID \u5FC5\u987B\u552F\u4E00\u3002",
  validationRuleLimit: "\u6700\u591A\u53EF\u914D\u7F6E 64 \u6761\u89C4\u5219\u3002",
  validationPriority: "\u8BF7\u8F93\u5165 \u22121000 \u81F3 1000 \u4E4B\u95F4\u7684\u6574\u6570\u3002",
  validationKeywordLimit: "\u6700\u591A\u53EF\u586B\u5199 32 \u4E2A\u5173\u952E\u8BCD\u3002",
  validationKeywordLength: "\u6BCF\u4E2A\u5173\u952E\u8BCD\u6700\u591A 100 \u4E2A\u5B57\u7B26\u3002",
  validationDuplicateRole: "\u540C\u4E00\u4E2A\u7CBE\u786E\u961F\u53CB\u540D\u79F0\u53EA\u80FD\u914D\u7F6E\u4E00\u6B21\u3002",
  validationUnknownRoute: "\u8BF7\u9009\u62E9\u5DF2\u5B58\u5728\u7684\u547D\u540D\u8DEF\u7531\u3002",
  validationHistory: "\u8BF7\u8F93\u5165 1 \u81F3 1000 \u4E4B\u95F4\u7684\u6574\u6570\u3002",
  validationCatalog: "\u6B64\u9009\u9879\u4E0D\u5728\u5F53\u524D\u5B9E\u65F6\u6A21\u578B\u76EE\u5F55\u4E2D\u3002"
};
var CSS = `
.dtr-editor{color:var(--dsw-alias-label-primary);font-size:14px;line-height:1.55;max-width:900px;min-width:0;margin:0 auto;padding:4px 0 24px}
.dtr-editor *{box-sizing:border-box}.dtr-editor h2{font-size:20px;line-height:1.4;margin:0 0 8px;font-weight:600}.dtr-editor h3{font-size:15px;margin:0;font-weight:600}
.dtr-muted{color:var(--dsw-alias-label-secondary);font-size:13px;margin:4px 0 12px}.dtr-note{padding:12px;border:1px solid var(--dsw-alias-border-l3);border-radius:10px;margin:12px 0;background:var(--dsw-alias-bg-layer-1)}
.dtr-section{border-top:1px solid var(--dsw-alias-border-l3);padding-top:20px;margin-top:22px}.dtr-section-head,.dtr-row-head,.dtr-actions{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.dtr-card{border:1px solid var(--dsw-alias-border-l3);border-radius:12px;padding:14px;margin-top:12px;background:var(--dsw-alias-bg-layer-1)}.dtr-row-head{margin-bottom:12px}.dtr-row-head strong{font-size:13px;overflow-wrap:anywhere}
.dtr-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.dtr-field{display:flex;flex-direction:column;gap:5px;min-width:0;font-size:12px;color:var(--dsw-alias-label-secondary)}.dtr-wide{grid-column:1/-1}
.dtr-editor input,.dtr-editor select,.dtr-editor textarea{font:inherit;font-size:13px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l3);border-radius:8px;padding:8px 10px;min-width:0;width:100%}.dtr-editor textarea{resize:vertical;min-height:86px}
.dtr-editor button{font:inherit;font-size:13px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l3);border-radius:8px;padding:7px 12px;cursor:pointer}.dtr-editor button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}.dtr-editor :focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.dtr-editor :disabled{opacity:.5;cursor:not-allowed}
.dtr-editor button.dtr-primary{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);font-weight:600}.dtr-editor button.dtr-danger,.dtr-error{color:var(--dsw-alias-state-error-primary)}.dtr-success{color:var(--dsw-alias-label-primary);border-inline-start:3px solid var(--dsw-alias-state-success-primary);padding-inline-start:10px}.dtr-warning{color:var(--dsw-alias-label-secondary);border-inline-start:3px solid var(--dsw-alias-state-warn-primary);padding-inline-start:10px}.dtr-message{font-size:13px;white-space:pre-wrap;overflow-wrap:anywhere;margin:12px 0}
.dtr-field-error{font-size:12px;color:var(--dsw-alias-label-secondary)}.dtr-editor [aria-invalid=true]{border-color:var(--dsw-alias-state-error-primary)}.dtr-announcement{min-height:20px;font-size:13px;color:var(--dsw-alias-label-secondary)}.dtr-footer{border-top:1px solid var(--dsw-alias-border-l3);margin-top:24px;padding-top:16px}.dtr-inline{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.dtr-editor fieldset{border:0;margin:0;padding:0;min-width:0}.dtr-empty{font-size:13px;color:var(--dsw-alias-label-tertiary);margin:12px 0}
@media(max-width:620px){.dtr-grid{grid-template-columns:minmax(0,1fr)}.dtr-editor{padding-bottom:16px}.dtr-card{padding:12px}.dtr-section-head{align-items:flex-start}}
`;
var inject = ["slots", "locale", "configForms", "remote", "remote.session"];
function apply(ctx) {
  const client = ctx;
  ctx.effect(() => client.locale.register(NS, { en, zh }), "team-router: editor dictionaries");
  const form = client.configForms.get("team-router");
  const editor = new PolicyEditor(form);
  const readForm = () => form.getSnapshot();
  const subscribeForm = (listener) => form.subscribe(listener);
  ctx.effect(() => () => editor.dispose(), "team-router: staged editor");
  function Editor(props) {
    const t2 = props.t;
    const host = React.useSyncExternalStore(subscribeForm, readForm);
    const state = React.useSyncExternalStore(editor.subscribe, editor.getSnapshot);
    const [catalog, setCatalog] = React.useState();
    const [catalogBusy, setCatalogBusy] = React.useState(true);
    const [catalogError, setCatalogError] = React.useState();
    const [catalogProblem, setCatalogProblem] = React.useState();
    const [retry, setRetry] = React.useState(0);
    const [resetConfirmation, setResetConfirmation] = React.useState();
    const [validationAttempted, setValidationAttempted] = React.useState(false);
    const [externalIssue, setExternalIssue] = React.useState();
    const [pendingFocus, setPendingFocus] = React.useState();
    const [announcement, setAnnouncement] = React.useState();
    const fields = React.useRef(/* @__PURE__ */ new Map());
    const instanceId = React.useId();
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
      const listeners = [
        ...["llm/adapters-updated", "settings/document-updated", "credentials/record-updated", "credentials/reference-updated"].map((event) => client.remote.$on(event, () => {
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
        for (const stop of listeners) stop();
      };
    }, [retry]);
    const draft = state.draft;
    const hostDisabled = state.saving || host.status !== "ready" || !host.writable;
    const disabled = hostDisabled || resetConfirmation !== void 0;
    const issue = externalIssue ?? (validationAttempted && draft ? draftValidationIssue(draft) : void 0);
    const fieldKey = (row, field) => `${row}:${field}`;
    const fieldId = (row, field) => `dtr-${instanceId}-${row}-${field}`;
    const focusIssue = (next) => {
      setPendingFocus(fieldKey(next.rowKey, next.field));
    };
    React.useLayoutEffect(() => {
      if (pendingFocus === void 0) return;
      const input = fields.current.get(pendingFocus);
      if (input) {
        input.focus();
        setPendingFocus(void 0);
      }
    }, [pendingFocus, draft]);
    const fieldProps = (row, field) => {
      const invalid = issue?.rowKey === row && issue.field === field;
      return {
        id: fieldId(row, field),
        ref: (node) => {
          if (node) fields.current.set(fieldKey(row, field), node);
          else fields.current.delete(fieldKey(row, field));
        },
        "aria-invalid": invalid || void 0,
        "aria-describedby": invalid ? `${fieldId(row, field)}-error` : void 0
      };
    };
    const fieldError = (row, field) => issue?.rowKey === row && issue.field === field ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dtr-field-error", id: `${fieldId(row, field)}-error`, children: t2(issue.reasonKey) }) : null;
    const edit = (next) => {
      setCatalogProblem(void 0);
      setExternalIssue(void 0);
      editor.edit(next, state.revision);
    };
    const addRoute = () => {
      if (!draft) return;
      const key = rowKey();
      edit({ ...draft, routes: [...draft.routes, { key, name: "", provider: "", model: "", reasoningEffort: "" }] });
      setPendingFocus(fieldKey(key, "routeName"));
      setAnnouncement({ key: "routeAdded", number: draft.routes.length + 1, serial: key });
    };
    const addRule = () => {
      if (!draft) return;
      const key = rowKey();
      edit({ ...draft, rules: [...draft.rules, { key, id: "", keywords: "", route: "", priority: "0" }] });
      setPendingFocus(fieldKey(key, "ruleId"));
      setAnnouncement({ key: "ruleAdded", number: draft.rules.length + 1, serial: key });
    };
    const addRole = () => {
      if (!draft) return;
      const key = rowKey();
      edit({ ...draft, roles: [...draft.roles, { key, name: "", route: "" }] });
      setPendingFocus(fieldKey(key, "memberName"));
      setAnnouncement({ key: "roleAdded", number: draft.roles.length + 1, serial: key });
    };
    const resetChanged = resetConfirmation !== void 0 && (resetConfirmation.revision === void 0 || host.revision !== resetConfirmation.revision || state.revision !== resetConfirmation.revision);
    const routeNames = draft?.routes.map((route) => route.name.trim()).filter(Boolean) ?? [];
    const targetOptions = (current, optional = false) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: t2(optional ? "inherit" : "chooseRoute") }),
      current !== "" && !routeNames.includes(current) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: current, children: t2("unknownRoute", { name: current }) }),
      [...new Set(routeNames)].map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: name, children: name }, name))
    ] });
    const updateRoute = (index, change) => {
      if (draft) edit({ ...draft, routes: draft.routes.map((row, i) => i === index ? { ...row, ...change } : row) });
    };
    const updateRule = (index, change) => {
      if (draft) edit({ ...draft, rules: draft.rules.map((row, i) => i === index ? { ...row, ...change } : row) });
    };
    const updateRole = (index, change) => {
      if (draft) edit({ ...draft, roles: draft.roles.map((row, i) => i === index ? { ...row, ...change } : row) });
    };
    const save = () => {
      if (!draft) return;
      setValidationAttempted(true);
      setExternalIssue(void 0);
      const invalid = draftValidationIssue(draft);
      if (invalid) {
        focusIssue(invalid);
        void editor.save();
        return;
      }
      let policy;
      try {
        policy = draftToPolicy(draft);
      } catch {
        void editor.save();
        return;
      }
      if (policyRequiresCatalog(policy) && (!catalog || catalogError || catalogBusy)) {
        setCatalogProblem({ key: "catalogRequired" });
        return;
      }
      for (const [name, route] of Object.entries(policy.routes)) {
        const group = catalog?.groups.find((group2) => group2.id === route.provider);
        const model = group?.models.find((model2) => model2.id === route.model);
        if (!model || route.reasoningEffort !== void 0 && !model.reasoning?.efforts.some((effort) => effort.id === route.reasoningEffort)) {
          const row = draft.routes.find((row2) => row2.name.trim() === name);
          const problem = { rowKey: row.key, field: !group ? "provider" : !model ? "model" : "effort", reasonKey: "validationCatalog" };
          setExternalIssue(problem);
          focusIssue(problem);
          setCatalogProblem({ key: "catalogInvalid", name });
          return;
        }
      }
      setCatalogProblem(void 0);
      void editor.save();
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-editor", "aria-busy": state.saving, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: CSS }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t2("title") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-muted", children: t2("description") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dtr-note dtr-muted", children: t2("precedence") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dtr-announcement", role: "status", "aria-live": "polite", "aria-atomic": "true", children: announcement && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t2(announcement.key, { number: announcement.number }) }, announcement.serial) }),
      host.status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "status", children: t2("loading") }),
      host.status === "unavailable" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "status", children: t2("unavailable") }),
      host.status === "ready" && !host.writable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-warning", role: "status", children: t2("readOnly") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-inline", children: [
        catalogBusy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dtr-muted", role: "status", children: t2("catalogLoading") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
          setRetry((value) => value + 1);
        }, disabled: catalogBusy, children: t2("retry") })
      ] }),
      catalogError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-error dtr-message", role: "alert", children: t2("catalogError", { message: catalogError }) }),
      catalog && catalog.failures.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-warning dtr-message", role: "status", children: t2("catalogPartial", { message: catalog.failures.map((row) => `${row.name}: ${row.message}`).join("; ") }) }),
      draft && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { disabled, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "dtr-section", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-section-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: t2("routes") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: addRoute, children: t2("addRoute") })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-muted", children: t2("routesHint") }),
            draft.routes.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-empty", children: t2("noRoutes") }),
            draft.routes.map((row, index) => {
              const group = catalog?.groups.find((group2) => group2.id === row.provider);
              const model = group?.models.find((model2) => model2.id === row.model);
              const efforts = model?.reasoning?.efforts ?? [];
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-card", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-row-head", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: row.name || t2("routeName") }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dtr-danger", "aria-label": t2("removeRow", { name: row.name || t2("routeName") }), onClick: () => edit({ ...draft, routes: draft.routes.filter((_, i) => i !== index) }), children: t2("remove") })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-grid", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dtr-field dtr-wide", children: [
                    t2("routeName"),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { ...fieldProps(row.key, "routeName"), value: row.name, onChange: (event) => updateRoute(index, { name: event.target.value }), autoComplete: "off" }),
                    fieldError(row.key, "routeName")
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dtr-field", children: [
                    t2("provider"),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { ...fieldProps(row.key, "provider"), value: row.provider, onChange: (event) => updateRoute(index, { provider: event.target.value, model: "", reasoningEffort: "" }), children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: t2("chooseProvider") }),
                      row.provider && !group && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: row.provider, children: t2("notLoaded", { name: row.provider }) }),
                      catalog?.groups.map((group2) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: group2.id, children: group2.name }, group2.id))
                    ] }),
                    fieldError(row.key, "provider")
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dtr-field", children: [
                    t2("model"),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { ...fieldProps(row.key, "model"), value: row.model, onChange: (event) => updateRoute(index, { model: event.target.value, reasoningEffort: "" }), children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: t2("chooseModel") }),
                      row.model && !model && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: row.model, children: t2("notLoaded", { name: row.model }) }),
                      group?.models.map((model2) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: model2.id, children: model2.name }, model2.id))
                    ] }),
                    fieldError(row.key, "model")
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dtr-field dtr-wide", children: [
                    t2("effort"),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { ...fieldProps(row.key, "effort"), value: row.reasoningEffort, onChange: (event) => updateRoute(index, { reasoningEffort: event.target.value }), children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "", children: t2("providerDefault") }),
                      row.reasoningEffort && !efforts.some((effort) => effort.id === row.reasoningEffort) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: row.reasoningEffort, children: t2("notLoaded", { name: row.reasoningEffort }) }),
                      efforts.map((effort) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: effort.id, children: effort.name }, effort.id))
                    ] }),
                    fieldError(row.key, "effort")
                  ] })
                ] })
              ] }, row.key);
            })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "dtr-section", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-section-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: t2("rules") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: addRule, children: t2("addRule") })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-muted", children: t2("rulesHint") }),
            draft.rules.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-empty", children: t2("noRules") }),
            draft.rules.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-card", role: "group", "aria-label": t2("ruleGroup", { number: index + 1, name: row.id || t2("unnamed") }), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-row-head", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: row.id || t2("ruleNumber", { number: index + 1 }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-inline", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", "aria-label": t2("moveUpRule", { name: row.id || t2("ruleNumber", { number: index + 1 }) }), disabled: index === 0, onClick: () => edit({ ...draft, rules: moveRule(draft.rules, index, -1) }), children: t2("moveUp") }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", "aria-label": t2("moveDownRule", { name: row.id || t2("ruleNumber", { number: index + 1 }) }), disabled: index === draft.rules.length - 1, onClick: () => edit({ ...draft, rules: moveRule(draft.rules, index, 1) }), children: t2("moveDown") }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dtr-danger", "aria-label": t2("removeRow", { name: row.id || t2("ruleNumber", { number: index + 1 }) }), onClick: () => edit({ ...draft, rules: draft.rules.filter((_, i) => i !== index) }), children: t2("remove") })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-grid", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dtr-field", children: [
                  t2("ruleId"),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { ...fieldProps(row.key, "ruleId"), value: row.id, onChange: (event) => updateRule(index, { id: event.target.value }) }),
                  fieldError(row.key, "ruleId")
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dtr-field", children: [
                  t2("priority"),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { ...fieldProps(row.key, "priority"), type: "number", min: -1e3, max: 1e3, step: 1, value: row.priority, onChange: (event) => updateRule(index, { priority: event.target.value }) }),
                  fieldError(row.key, "priority")
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dtr-field dtr-wide", children: [
                  t2("keywords"),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { ...fieldProps(row.key, "keywords"), value: row.keywords, onChange: (event) => updateRule(index, { keywords: event.target.value }) }),
                  fieldError(row.key, "keywords")
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dtr-field dtr-wide", children: [
                  t2("target"),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { ...fieldProps(row.key, "target"), value: row.route, onChange: (event) => updateRule(index, { route: event.target.value }), children: targetOptions(row.route) }),
                  fieldError(row.key, "target")
                ] })
              ] })
            ] }, row.key))
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "dtr-section", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-section-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: t2("roles") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: addRole, children: t2("addRole") })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-muted", children: t2("rolesHint") }),
            draft.roles.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-empty", children: t2("noRoles") }),
            draft.roles.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-card", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-row-head", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: row.name || t2("memberName") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dtr-danger", "aria-label": t2("removeRow", { name: row.name || t2("memberName") }), onClick: () => edit({ ...draft, roles: draft.roles.filter((_, i) => i !== index) }), children: t2("remove") })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-grid", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dtr-field", children: [
                  t2("memberName"),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { ...fieldProps(row.key, "memberName"), value: row.name, onChange: (event) => updateRole(index, { name: event.target.value }) }),
                  fieldError(row.key, "memberName")
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dtr-field", children: [
                  t2("target"),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { ...fieldProps(row.key, "target"), value: row.route, onChange: (event) => updateRole(index, { route: event.target.value }), children: targetOptions(row.route) }),
                  fieldError(row.key, "target")
                ] })
              ] })
            ] }, row.key))
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "dtr-section", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: t2("defaults") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-grid", style: { marginTop: 12 }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dtr-field", children: [
                t2("defaultRoute"),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { ...fieldProps("defaults", "defaultRoute"), value: draft.defaultRoute, onChange: (event) => edit({ ...draft, defaultRoute: event.target.value }), children: targetOptions(draft.defaultRoute, true) }),
                fieldError("defaults", "defaultRoute")
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dtr-field", children: [
                t2("historyLimit"),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { ...fieldProps("defaults", "historyLimit"), type: "number", min: 1, max: 1e3, step: 1, value: draft.historyLimit, onChange: (event) => edit({ ...draft, historyLimit: event.target.value }) }),
                fieldError("defaults", "historyLimit")
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-footer", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { "aria-live": "polite", children: [
            state.stale && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-warning dtr-message", children: t2("stale") }),
            issue && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "alert", className: "dtr-error dtr-message", children: t2("validationSummary", { field: t2(issue.field), reason: t2(issue.reasonKey) }) }),
            state.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "alert", className: "dtr-error dtr-message", children: state.error.kind === "refused" ? t2("refused") : t2(state.error.kind === "validation" ? "validationError" : "transportError", { message: state.error.detail }) }),
            catalogProblem && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { role: "alert", className: "dtr-error dtr-message", children: t2(catalogProblem.key, { name: catalogProblem.name ?? "" }) }),
            state.notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-success dtr-message", children: t2(state.notice === "saved" ? "saved" : "resetDone") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-actions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dtr-muted", children: t2(state.dirty ? "dirty" : "current") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-inline", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: state.saving || resetConfirmation !== void 0 || !state.dirty && !state.stale, onClick: () => {
                setCatalogProblem(void 0);
                setExternalIssue(void 0);
                setValidationAttempted(false);
                editor.discard();
              }, children: t2(state.stale ? "reload" : "cancel") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dtr-primary", disabled: disabled || !state.dirty || state.stale || catalogBusy && draft.routes.length > 0, onClick: save, children: t2(state.saving ? "saving" : "save") })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", style: { marginTop: 14 }, disabled: disabled || state.dirty || state.stale, onClick: () => {
            setCatalogProblem(void 0);
            setResetConfirmation({ revision: state.revision });
          }, children: t2("reset") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-muted", children: t2("resetHint") }),
          resetConfirmation && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-note", role: "group", "aria-labelledby": `dtr-${instanceId}-reset-title`, "aria-describedby": `dtr-${instanceId}-reset-body`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { id: `dtr-${instanceId}-reset-title`, children: t2("resetConfirmTitle") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-muted", id: `dtr-${instanceId}-reset-body`, children: t2("resetConfirmBody") }),
            resetChanged && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-warning dtr-message", role: "status", children: t2("resetChanged") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-inline", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", autoFocus: true, disabled: state.saving, onClick: () => {
                setResetConfirmation(void 0);
              }, children: t2("resetCancel") }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: hostDisabled || state.dirty || resetChanged, onClick: () => {
                void editor.reset(resetConfirmation.revision).then((accepted) => {
                  if (accepted) {
                    setResetConfirmation(void 0);
                    setExternalIssue(void 0);
                    setValidationAttempted(false);
                  }
                });
              }, children: t2(state.saving ? "saving" : "resetConfirm") })
            ] })
          ] })
        ] })
      ] })
    ] });
  }
  const t = client.locale.bind(NS);
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
