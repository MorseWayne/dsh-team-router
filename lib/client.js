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
var React7 = __toESM(require("react"), 1);

// src/core/categories.ts
var BUILTIN_GROUPS = Object.freeze({
  implementation: Object.freeze({ id: "implementation", zh: "\u4EA7\u54C1\u4E0E\u5DE5\u7A0B\u5B9E\u73B0", en: "Product & engineering" }),
  quality: Object.freeze({ id: "quality", zh: "\u8D28\u91CF\u4E0E\u4EA4\u4ED8", en: "Quality & delivery" }),
  analysis: Object.freeze({ id: "analysis", zh: "\u5206\u6790\u4E0E\u8868\u8FBE", en: "Analysis & expression" }),
  general: Object.freeze({ id: "general", zh: "\u901A\u7528\u4E0E\u515C\u5E95", en: "General & fallback" })
});
var BUILTIN_IDS = Object.freeze([
  "visual-engineering",
  "frontend-engineering",
  "backend-data",
  "deep",
  "debugging",
  "code-review",
  "verification-automation",
  "ultrabrain",
  "artistry",
  "writing",
  "scout",
  "quick",
  "unspecified"
]);
function localized([name, purpose, shortPurpose, avoid, example, deliverableCheck]) {
  return Object.freeze({ name, purpose, shortPurpose, avoid, example, deliverableCheck });
}
function category(id, group, proactive, classic7, zh3, en3, defaultEnabled = true) {
  return Object.freeze({ id, group, proactive, classic7, defaultEnabled, zh: localized(zh3), en: localized(en3) });
}
var BUILTINS = Object.freeze({
  "visual-engineering": category(
    "visual-engineering",
    "implementation",
    true,
    true,
    ["\u89C6\u89C9\u4E0E\u4EA4\u4E92", "\u5B9E\u73B0\u9875\u9762\u5E03\u5C40\u3001\u89C6\u89C9\u6837\u5F0F\u3001\u52A8\u753B\u4E0E\u4EA4\u4E92\u4F53\u9A8C\u3002", "\u53EF\u9A8C\u8BC1\u7684\u89C6\u89C9\u4E0E\u4EA4\u4E92", "\u82E5\u4EA4\u4ED8\u91CD\u70B9\u662F\u524D\u7AEF\u72B6\u6001\u6216\u7EC4\u4EF6\u67B6\u6784\uFF0C\u9009\u524D\u7AEF\u5DE5\u7A0B\u3002", "\u91CD\u505A\u767B\u5F55\u9875\u5E76\u9A8C\u8BC1\u4EA4\u4E92\u4E0E\u89C6\u89C9\u6548\u679C\u3002", "\u63D0\u4F9B\u622A\u56FE\u6216\u4EA4\u4E92\u9A8C\u8BC1\uFF0C\u8BF4\u660E\u73AF\u5883\u548C\u672A\u9A8C\u8BC1\u72B6\u6001\u3002"],
    ["Visual & interaction", "Implement page layout, visual styling, animation, and interaction.", "Visual and interaction results", "Choose frontend-engineering when state or component architecture is primary.", "Rebuild the login page and verify its appearance and interactions.", "Screenshots or interaction checks; environment and gaps."]
  ),
  "frontend-engineering": category(
    "frontend-engineering",
    "implementation",
    true,
    false,
    ["\u524D\u7AEF\u5DE5\u7A0B", "\u5B9E\u73B0\u5BA2\u6237\u7AEF\u7EC4\u4EF6\u3001\u72B6\u6001\u3001\u6570\u636E\u6D41\u4E0E\u5E94\u7528\u96C6\u6210\u3002", "\u5BA2\u6237\u7AEF\u7EC4\u4EF6\u4E0E\u6570\u636E\u6D41", "\u82E5\u91CD\u70B9\u662F\u5916\u89C2\u6216\u4EA4\u4E92\u4F53\u9A8C\uFF0C\u9009\u89C6\u89C9\u4E0E\u4EA4\u4E92\u3002", "\u5C06\u641C\u7D22\u7B5B\u9009\u72B6\u6001\u540C\u6B65\u5230\u8DEF\u7531\u5E76\u5904\u7406\u5931\u8D25\u6062\u590D\u3002", "\u5217\u51FA\u53D8\u66F4\u4E0E\u53D7\u5F71\u54CD\u72B6\u6001\uFF0C\u9A8C\u8BC1\u5BA2\u6237\u7AEF\u6B63\u5E38\u548C\u5931\u8D25\u8DEF\u5F84\u3002"],
    ["Frontend engineering", "Implement client-side components, state, data flow, and app integration.", "Client components and data flow", "Use visual-engineering for appearance or interaction as the primary deliverable.", "Synchronize search filters with the URL and handle failure recovery.", "Changed states; success/failure checks."]
  ),
  "backend-data": category(
    "backend-data",
    "implementation",
    true,
    false,
    ["\u540E\u7AEF\u4E0E\u6570\u636E", "\u5B9E\u73B0\u670D\u52A1\u3001API\u3001\u6301\u4E45\u5316\u3001\u67E5\u8BE2\u6216\u6570\u636E\u7BA1\u9053\u3002", "\u670D\u52A1\u3001API \u4E0E\u6570\u636E", "\u82E5\u4EA4\u4ED8\u91CD\u70B9\u662F\u9A8C\u6536\u81EA\u52A8\u5316\u800C\u975E\u670D\u52A1\u6216\u6570\u636E\u80FD\u529B\uFF0C\u9009\u9A8C\u8BC1\u4E0E\u4EA4\u4ED8\u81EA\u52A8\u5316\u3002", "\u4E3A\u5BFC\u5165\u670D\u52A1\u5B9E\u73B0\u5E42\u7B49\u5199\u5165\u3002", "\u8BF4\u660E\u63A5\u53E3\u6216\u6570\u636E\u4E0D\u53D8\u91CF\uFF0C\u9A8C\u8BC1\u6B63\u5E38\u3001\u9519\u8BEF\u53CA\u517C\u5BB9\u8DEF\u5F84\u3002"],
    ["Backend & data", "Implement services, APIs, persistence, queries, and data pipelines.", "Services, APIs, and data", "Use verification-automation for delivery checks rather than service or data capabilities.", "Implement idempotent writes in an import service.", "API/data invariants; success, failure, compatibility checks."]
  ),
  deep: category(
    "deep",
    "implementation",
    true,
    true,
    ["\u7EFC\u5408\u5DE5\u7A0B\u5B9E\u65BD", "\u63A2\u7D22\u3001\u5B9E\u73B0\u5E76\u9A8C\u8BC1\u76EE\u6807\u660E\u786E\u7684\u8DE8\u6A21\u5757\u5DE5\u7A0B\u9700\u6C42\u3002", "\u8DE8\u6A21\u5757\u5B9E\u65BD\u4E0E\u9A8C\u8BC1", "\u53EA\u9700\u7ED9\u51FA\u5206\u6790\u65F6\u9009\u67B6\u6784\u4E0E\u56F0\u96BE\u63A8\u7406\uFF1B\u5C40\u90E8\u660E\u786E\u6539\u52A8\u9009\u5B9A\u5411\u5C0F\u4EFB\u52A1\u3002", "\u5B8C\u6210\u7EA6\u5B9A\u7684\u8DE8\u6A21\u5757\u8FC1\u79FB\u53CA\u56DE\u5F52\u68C0\u67E5\u3002", "\u5217\u51FA\u5B8C\u6210\u8303\u56F4\u4E0E\u7AEF\u5230\u7AEF\u9A8C\u8BC1\uFF0C\u5E76\u4EA4\u4EE3\u672A\u5B8C\u6210\u9879\u548C\u526F\u4F5C\u7528\u3002"],
    ["Integrated engineering", "Explore, implement, and verify a defined goal across engineering boundaries.", "Cross-module implementation", "Use ultrabrain for analysis only or quick for a known small change.", "Implement the agreed cross-module migration with regression checks.", "Completed scope, end-to-end checks, gaps, side effects."]
  ),
  debugging: category(
    "debugging",
    "quality",
    true,
    false,
    ["\u6545\u969C\u8BCA\u65AD", "\u590D\u73B0\u6545\u969C\u3001\u786E\u8BA4\u6839\u56E0\uFF0C\u5E76\u5728\u8BF7\u6C42\u5141\u8BB8\u65F6\u4FEE\u590D\u3002", "\u590D\u73B0\u4E0E\u6839\u56E0\u5B9A\u4F4D", "\u82E5\u76EE\u6807\u662F\u8BC4\u4F30\u6539\u52A8\u98CE\u9669\u800C\u975E\u5B9A\u4F4D\u6545\u969C\uFF0C\u9009\u4EE3\u7801\u5BA1\u67E5\u3002", "\u5B9A\u4F4D\u5076\u53D1\u7684\u91CD\u590D\u5199\u5165\u5E76\u9A8C\u8BC1\u4FEE\u590D\u3002", "\u7ED9\u51FA\u590D\u73B0\u4E0E\u6839\u56E0\u8BC1\u636E\uFF0C\u4EE5\u53CA\u6700\u5C0F\u4FEE\u590D\u6216\u672A\u9A8C\u8BC1\u9879\u3002"],
    ["Fault diagnosis", "Reproduce a failure, establish its root cause, and fix it if requested.", "Failure reproduction and cause", "Use code-review if evaluating a change rather than diagnosing a failure.", "Trace an intermittent duplicate write and verify the fix.", "Repro, cause evidence, minimal fix or gaps."]
  ),
  "code-review": category(
    "code-review",
    "quality",
    true,
    false,
    ["\u4EE3\u7801\u5BA1\u67E5", "\u5BA1\u67E5\u4EE3\u7801\u6539\u52A8\uFF0C\u4F18\u5148\u62A5\u544A\u884C\u4E3A\u3001\u98CE\u9669\u53CA\u56DE\u5F52\u95EE\u9898\u3002", "\u53D8\u66F4\u98CE\u9669\u4E0E\u56DE\u5F52\u5BA1\u67E5", "\u4E0D\u8981\u672A\u7ECF\u8BF7\u6C42\u5B9E\u65BD\u4FEE\u590D\uFF1B\u5B9E\u73B0\u4EFB\u52A1\u9009\u76F8\u5E94\u5DE5\u7A0B\u7C7B\u522B\u3002", "\u5BA1\u67E5\u7F13\u5B58\u53D8\u66F4\u662F\u5426\u53EF\u80FD\u9020\u6210\u8DE8\u7528\u6237\u6570\u636E\u9519\u8BEF\u3002", "\u4E3A\u6BCF\u6761\u53D1\u73B0\u63D0\u4F9B\u6587\u4EF6\u4F4D\u7F6E\u3001\u5F71\u54CD\u7EA7\u522B\u548C\u8BC1\u636E\uFF1B\u8BF4\u660E\u8986\u76D6\u7F3A\u53E3\u3002"],
    ["Code review", "Review a code change for correctness, risk, and regressions.", "Change risk and regressions", "Do not implement unsolicited fixes; use an engineering category for changes.", "Review a cache change for potential cross-user data mixups.", "File locations, severity, evidence, review gaps."]
  ),
  "verification-automation": category(
    "verification-automation",
    "quality",
    true,
    false,
    ["\u9A8C\u8BC1\u4E0E\u4EA4\u4ED8\u81EA\u52A8\u5316", "\u6784\u5EFA\u6D4B\u8BD5\u3001CI\u3001\u6784\u5EFA\u3001\u53D1\u5E03\u548C\u53EF\u91CD\u590D\u7684\u9A8C\u6536\u6D41\u7A0B\u3002", "\u6D4B\u8BD5\u3001CI \u4E0E\u53D1\u5E03\u6D41\u7A0B", "\u5B9A\u4F4D\u67D0\u4E2A\u5DF2\u77E5\u6545\u969C\u65F6\u4F18\u5148\u9009\u6545\u969C\u8BCA\u65AD\u3002", "\u4E3A\u53D1\u5E03\u6D41\u7A0B\u589E\u52A0\u5236\u54C1\u9A8C\u8BC1\u548C\u5192\u70DF\u6D4B\u8BD5\u3002", "\u63D0\u4F9B\u53EF\u91CD\u8DD1\u7684\u68C0\u67E5\u547D\u4EE4\u3001\u901A\u8FC7\u4E0E\u5931\u8D25\u8BC1\u636E\u53CA\u5269\u4F59\u7F3A\u53E3\u3002"],
    ["Verification & delivery automation", "Build tests, CI, build/release automation, and repeatable acceptance checks.", "Tests, CI, and release", "Use debugging when a specific failure is the primary problem.", "Add artifact verification and smoke tests to the release workflow.", "Rerunnable commands, pass/fail evidence, coverage gaps."]
  ),
  ultrabrain: category(
    "ultrabrain",
    "analysis",
    true,
    true,
    ["\u67B6\u6784\u4E0E\u56F0\u96BE\u63A8\u7406", "\u5206\u6790\u56F0\u96BE\u7684\u67B6\u6784\u3001\u903B\u8F91\u6216\u7B97\u6CD5\u95EE\u9898\u5E76\u8BBA\u8BC1\u51B3\u7B56\u3002", "\u56F0\u96BE\u5206\u6790\u4E0E\u51B3\u7B56\u4F9D\u636E", "\u5927\u91CF\u4EE3\u7801\u4FEE\u6539\u4E0D\u7B49\u4E8E\u56F0\u96BE\u63A8\u7406\uFF1B\u4EE5\u5B9E\u65BD\u4E3A\u4E3B\u65F6\u9009\u7EFC\u5408\u5DE5\u7A0B\u5B9E\u65BD\u3002", "\u6BD4\u8F83\u6570\u636E\u5E93\u8FC1\u79FB\u7B56\u7565\u5E76\u8BBA\u8BC1\u63A8\u8350\u65B9\u6848\u3002", "\u7ED9\u51FA\u7ED3\u8BBA\u3001\u66FF\u4EE3\u65B9\u6848\u3001\u53D6\u820D\u4EE5\u53CA\u652F\u6491\u8BC1\u636E\u548C\u4E0D\u786E\u5B9A\u9879\u3002"],
    ["Architecture & reasoning", "Analyze difficult architecture, logic, or algorithm questions and justify decisions.", "Difficult analysis and decisions", "Large code changes are not inherently analysis; use deep for implementation.", "Compare database migration strategies and justify a recommendation.", "Conclusions, alternatives, tradeoffs, evidence, unknowns."]
  ),
  artistry: category(
    "artistry",
    "analysis",
    true,
    true,
    ["\u521B\u610F\u63A2\u7D22", "\u63A2\u7D22\u591A\u79CD\u65B0\u601D\u8DEF\u3001\u975E\u5E38\u89C4\u65B9\u6848\u548C\u521B\u610F\u65B9\u5411\u3002", "\u6709\u5DEE\u5F02\u7684\u521B\u610F\u65B9\u5411", "\u4E0D\u662F\u5E38\u89C4\u754C\u9762\u5B9E\u73B0\u7684\u9ED8\u8BA4\u7C7B\u522B\u3002", "\u4E3A\u65B0\u4EA7\u54C1\u63D0\u51FA\u660E\u663E\u4E0D\u540C\u7684\u4EA4\u4E92\u6982\u5FF5\u3002", "\u5C55\u793A\u5DEE\u5F02\u660E\u663E\u7684\u65B9\u6848\u3001\u8BBE\u8BA1\u7406\u7531\u548C\u9A8C\u8BC1\u65B9\u5411\u3002"],
    ["Creative exploration", "Explore novel ideas, unconventional solutions, and creative directions.", "Distinct creative directions", "Do not use by default for routine interface implementation.", "Propose distinct interaction concepts for a new product.", "Distinct options, rationale, validation plans."]
  ),
  writing: category(
    "writing",
    "analysis",
    true,
    true,
    ["\u6280\u672F\u5199\u4F5C", "\u64B0\u5199\u6280\u672F\u6587\u6863\u3001\u8BF4\u660E\u3001\u6587\u7AE0\u548C\u7ED3\u6784\u5316\u6587\u5B57\u3002", "\u6587\u6863\u4E0E\u7ED3\u6784\u5316\u6587\u5B57", "\u5F53\u4E3B\u8981\u4EA4\u4ED8\u662F\u6280\u672F\u51B3\u7B56\u800C\u975E\u6210\u6587\u65F6\uFF0C\u9009\u67B6\u6784\u4E0E\u56F0\u96BE\u63A8\u7406\u3002", "\u5C06\u547D\u4EE4\u8BF4\u660E\u6574\u7406\u4E3A\u8FD0\u7EF4\u624B\u518C\u3002", "\u4EA4\u4ED8\u9762\u5411\u8BFB\u8005\u7684\u6587\u7A3F\uFF0C\u6838\u5BF9\u5173\u952E\u6280\u672F\u4E8B\u5B9E\u5E76\u6CE8\u660E\u672A\u6838\u5B9E\u9879\u3002"],
    ["Technical writing", "Produce technical documentation, explanations, articles, and organized prose.", "Documentation and prose", "Use ultrabrain when the primary result is a technical decision.", "Organize command explanations into an operations manual.", "Reader-ready text; verified claims and unknowns."]
  ),
  scout: category(
    "scout",
    "analysis",
    true,
    false,
    ["\u4FE1\u606F\u4FA6\u5BDF", "\u53EA\u8BFB\u641C\u96C6\u4EE3\u7801\u7EC6\u8282\u4E0E\u8C03\u7528\u94FE\u3001\u73AF\u5883\u914D\u7F6E\u3001\u957F\u65E5\u5FD7\u5173\u952E\u62A5\u9519\u6216\u6587\u6863\u51FA\u5904\uFF0C\u6574\u7406\u6210\u7CBE\u7B80\u8BC1\u636E\u6E05\u5355\u3002", "\u53EA\u8BFB\u6478\u5E95\u4E0E\u8BC1\u636E\u6E05\u5355", "\u5355\u70B9\u5DF2\u77E5\u6587\u4EF6\u6216\u503C\u76F4\u63A5\u8BFB\u53D6\uFF1B\u4E0D\u6539\u4EE3\u7801\uFF0C\u4E0D\u8FD0\u884C\u6539\u53D8\u72B6\u6001\u7684\u547D\u4EE4\uFF0C\u4E0D\u5224\u65AD\u590D\u6742\u6839\u56E0\u6216\u67B6\u6784\u53D6\u820D\u3002", "\u8FFD\u8E2A\u914D\u7F6E\u4ECE\u58F0\u660E\u5230\u751F\u6548\u7684\u8DEF\u5F84\uFF0C\u6807\u51FA\u65E5\u5FD7\u8BC1\u636E\u548C\u7F3A\u53E3\u3002", "\u53EA\u8BFB\uFF1A\u6458\u8981\u4E8B\u5B9E\uFF0C\u9644\u5173\u952E path:line\u3001URL \u6216\u8F93\u51FA\u6458\u5F55\u53CA\u76F2\u533A\u3002\u901A\u5E38 \u22645 KiB\uFF1B\u8BC1\u636E\u4E0D\u8DB3\u6216\u9700\u8D85\u957F\u65F6\u8BF4\u660E\u539F\u56E0\uFF0C\u4FDD\u7559\u6743\u9650\u963B\u585E\u4E0E\u53CD\u8BC1\uFF0C\u4E0D\u4E0B\u590D\u6742\u6839\u56E0\u7ED3\u8BBA\u3002"],
    ["Information scout", "Gather read-only facts from code and call chains, environment settings, key errors in long logs, or documentation sources.", "Read-only evidence collection", "Read one known file/value directly. No edits, state-changing commands, complex diagnoses or architecture decisions.", "Trace a setting from declaration to use; cite the log evidence and gaps.", "Read-only: facts, key path:line/URL/output excerpts, gaps. Aim for ~5 KiB or less; explain thin evidence or overruns. Keep access blocks and counterevidence; no complex diagnosis."],
    false
  ),
  quick: category(
    "quick",
    "general",
    false,
    true,
    ["\u5B9A\u5411\u5C0F\u4EFB\u52A1", "\u5B8C\u6210\u505A\u6CD5\u660E\u786E\u3001\u8FB9\u754C\u5C0F\u3001\u9A8C\u6536\u7B80\u5355\u7684\u6539\u52A8\u6216\u63D0\u53D6\u3002", "\u660E\u786E\u4E14\u53EF\u5FEB\u901F\u9A8C\u6536", "\u63CF\u8FF0\u77ED\u4E0D\u4EE3\u8868\u4EFB\u52A1\u7B80\u5355\uFF0C\u987B\u660E\u786E\u8303\u56F4\u548C\u9A8C\u6536\u6807\u51C6\u3002", "\u66F4\u65B0\u6307\u5B9A\u914D\u7F6E\u503C\u5E76\u68C0\u67E5\u751F\u6548\u3002", "\u8BF4\u660E\u6539\u52A8\u6216\u63D0\u53D6\u7ED3\u679C\u53CA\u4E00\u9879\u76F4\u63A5\u9A8C\u6536\u68C0\u67E5\u3002"],
    ["Bounded quick task", "Make a small change or extraction with a known approach and simple check.", "Small, well-defined change", "A short prompt is not necessarily a small task; require clear bounds.", "Set the specified config value and confirm it takes effect.", "Show the requested result and one direct check."]
  ),
  unspecified: category(
    "unspecified",
    "general",
    false,
    true,
    ["\u901A\u7528\u515C\u5E95", "\u4F5C\u4E3A\u786E\u5B9E\u4E0D\u9002\u5408\u5176\u4ED6\u7C7B\u522B\u7684\u6700\u540E\u9009\u62E9\u3002", "\u5176\u4ED6\u7C7B\u522B\u5747\u4E0D\u9002\u7528", "\u4E0D\u8981\u56E0\u5C1A\u672A\u5224\u65AD\u8303\u56F4\u6216\u60F3\u6362\u6A21\u578B\u5C31\u9009\u515C\u5E95\u3002", "\u56DE\u7B54\u4E0D\u5C5E\u4E8E\u5176\u4ED6\u7C7B\u522B\u7684\u4E00\u822C\u95EE\u9898\u3002", "\u8BF4\u660E\u7ED3\u679C\u3001\u4F9D\u636E\u548C\u5DF2\u77E5\u9650\u5236\u3002"],
    ["General fallback", "Handle requests that genuinely do not fit any other category.", "Last resort only", "Do not use when scope is unknown or to bypass a matching category.", "Answer a general question that fits no other category.", "Show the result, supporting basis, and known limits."]
  )
});
var BUILTIN_LIST = Object.freeze(BUILTIN_IDS.map((id) => BUILTINS[id]));
var CLASSIC7_IDS = Object.freeze(BUILTIN_IDS.filter((id) => BUILTINS[id].classic7));
function template(templateId, zh3, en3) {
  const text2 = ([name, purpose, avoid, example, nearBuiltin]) => Object.freeze({ name, purpose, avoid, example, nearBuiltin });
  return Object.freeze({ templateId, suggestedId: `custom-${templateId}`, zh: text2(zh3), en: text2(en3) });
}
var CUSTOM_CATEGORY_TEMPLATES = Object.freeze([
  template(
    "evidence-check",
    ["\u8BC1\u636E\u6838\u9A8C", "\u4EA4\u53C9\u6838\u9A8C\u5177\u4F53\u4E3B\u5F20\uFF1A\u5206\u522B\u5217\u51FA\u652F\u6301\u3001\u77DB\u76FE\u548C\u672A\u8BC1\u5B9E\u4E4B\u5904\u53CA\u51FA\u5904\u3002", "\u4E0D\u7528\u4E8E\u5F00\u653E\u5F0F\u641C\u96C6\u4E8B\u5B9E\u6216\u6574\u7406\u624B\u518C\u3002", "\u6838\u5BF9\u6307\u5B9A\u7248\u672C\u4E8B\u4EF6\u53C2\u6570\u7684\u6587\u6863\u548C\u6E90\u7801\u5B9A\u4E49\u3002", "\u53EA\u641C\u96C6\u4E8B\u5B9E\u9009 scout\uFF1B\u6574\u7406\u624B\u518C\u9009 writing\u3002"],
    ["Evidence verification", "Cross-check a specific claim against sources; report supporting, conflicting and unverified points.", "Not for open-ended fact gathering or organizing a manual.", "Check the documented event payload against the source for a given release.", "Use scout to collect facts or writing to organize a manual."]
  ),
  template(
    "security-audit",
    ["\u9632\u5FA1\u6027\u5B89\u5168\u5BA1\u8BA1", "\u63D0\u4F9B\u98CE\u9669\u4F4D\u7F6E\u3001\u53D7\u5F71\u54CD\u8FB9\u754C\u3001\u8BC1\u636E\u548C\u7F13\u89E3\u5EFA\u8BAE\u3002", "\u4E0D\u7528\u4E8E\u5E38\u89C4\u4EE3\u7801\u4FEE\u6539\u3002", "\u5BA1\u67E5\u6743\u9650\u8FB9\u754C\u5E76\u7ED9\u51FA\u9632\u5FA1\u6027\u7F13\u89E3\u5EFA\u8BAE\u3002", "\u5E38\u89C4\u4FEE\u6539\u65F6\u9009\u76F8\u5E94\u5DE5\u7A0B\u7C7B\u3002"],
    ["Defensive security audit", "Report risk locations, affected boundaries, evidence, and mitigations.", "Not for routine code changes.", "Review a permission boundary and recommend defensive mitigations.", "Use the relevant engineering category for routine changes."]
  ),
  template(
    "data-eval",
    ["\u6570\u636E\u4E0E\u6A21\u578B\u8BC4\u6D4B", "\u4EA4\u4ED8\u5B9E\u9A8C\u5206\u6790\u7ED3\u8BBA\u3001\u7F6E\u4FE1\u8FB9\u754C\u6216\u8BC4\u6D4B\u6307\u6807\u8BBE\u8BA1\u3002", "\u4E0D\u7528\u4E8E\u5EFA\u5E93\u6216\u5B9E\u73B0\u6D41\u6C34\u7EBF\u3002", "\u8BBE\u8BA1\u8BC4\u6D4B\u6307\u6807\u5E76\u8BF4\u660E\u6837\u672C\u91CF\u4E0E\u7F6E\u4FE1\u8FB9\u754C\u3002", "\u5EFA\u5E93\u6216\u5199\u6D41\u6C34\u7EBF\u65F6\u9009 backend-data \u6216 verification-automation\u3002"],
    ["Data & model evaluation", "Provide experiment conclusions, confidence bounds, or evaluation metrics design.", "Not for building databases or implementing pipelines.", "Design evaluation metrics with sample and confidence requirements.", "Use backend-data or verification-automation for databases or pipelines."]
  ),
  template(
    "safe-migration",
    ["\u884C\u4E3A\u4FDD\u6301\u7684\u91CD\u6784\u8FC1\u79FB", "\u8DE8\u6A21\u5757\u8FC1\u79FB\uFF0C\u9A8C\u6536\u884C\u4E3A\u4E0D\u53D8\u91CF\u3001\u517C\u5BB9\u7A97\u53E3\u548C\u56DE\u6EDA\u65B9\u6848\u3002", "\u4E0D\u7528\u4E8E\u53EA\u5BA1\u67E5 PR \u7684\u4EFB\u52A1\u3002", "\u8FC1\u79FB\u7F13\u5B58\u5B9E\u73B0\uFF0C\u9A8C\u8BC1\u884C\u4E3A\u4E0E\u6E10\u8FDB\u56DE\u6EDA\u65B9\u6848\u3002", "\u53EA\u5BA1 PR \u65F6\u9009 code-review\u3002"],
    ["Behavior-preserving migration", "Migrate across modules with behavior invariants, a compatibility window, and rollback.", "Not for reviewing a PR only.", "Migrate a cache with behavior checks and a staged rollback plan.", "Use code-review to review a PR only."]
  )
]);
var MAX_CUSTOM_CATEGORIES = 8;
var CUSTOM_ID_PATTERN = /^custom-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
function isBuiltinId(value) {
  return typeof value === "string" && Object.hasOwn(BUILTINS, value);
}
function generateCustomCategoryId(name, existingIds) {
  const taken = new Set(existingIds);
  const slug = name.replace(/[A-Z]/g, (letter) => letter.toLowerCase()).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const stem = /^[a-z]/.test(slug) ? slug : slug ? `cat-${slug}` : "cat";
  for (let index = slug ? 0 : 1; ; index++) {
    const suffix = index === 0 ? "" : `-${index}`;
    const prefix = stem.slice(0, 33 - suffix.length).replace(/-+$/, "");
    const id = `custom-${prefix}${suffix}`;
    if (!taken.has(id)) return id;
  }
}

// src/core/routing-fingerprint.ts
function compareCategoryIds(a, b) {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}
function fingerprintNormalized(config) {
  return JSON.stringify({
    version: config.version,
    defaultTarget: config.defaultTarget,
    behavior: config.behavior,
    // A new opt-in category with no override must not change a saved V3 policy's digest.
    // Keep disabled categories with a dormant binding: editing it is still a real change.
    builtins: BUILTIN_IDS.filter((id) => BUILTINS[id].defaultEnabled || config.builtins[id] !== void 0).map((id) => [id, config.builtins[id]?.enabled ?? BUILTINS[id].defaultEnabled, config.builtins[id]?.binding ?? { mode: "default" }]),
    custom: [...config.custom].sort(compareCategoryIds),
    historyLimit: config.historyLimit
  });
}

// src/core/routing-policy.ts
var DELEGATION_MODES = Object.freeze(["passive", "specialist-first", "orchestrator"]);
function isDelegationMode(value) {
  return DELEGATION_MODES.some((mode) => mode === value);
}
var UNSAFE_KEYS = /* @__PURE__ */ new Set(["__proto__", "prototype", "constructor"]);
var UNSAFE_TEXT = /[\p{Cc}\u2028\u2029\u200E\u200F\u202A-\u202E\u2066-\u2069]/u;
function fail(path, message) {
  throw new TypeError(`${path}: ${message}`);
}
function ownValue(value, key2, path) {
  const descriptor = Object.getOwnPropertyDescriptor(value, key2);
  if (!descriptor || !Object.hasOwn(descriptor, "value")) fail(path, "must be an own data property");
  return descriptor.value;
}
function record(value, path, fields) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(path, "must be a plain object");
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== null && prototype !== Object.prototype) fail(path, "must be a plain object");
  const result = /* @__PURE__ */ Object.create(null);
  for (const key2 of Reflect.ownKeys(value)) {
    if (typeof key2 !== "string") fail(path, "symbol fields are not allowed");
    if (UNSAFE_KEYS.has(key2)) fail(path, `unsafe key ${JSON.stringify(key2)}`);
    const field = `${path}[${JSON.stringify(key2)}]`;
    if (fields && !fields.includes(key2)) fail(field, "unknown field");
    result[key2] = ownValue(value, key2, field);
  }
  return result;
}
function onlyFields(value, fields, path) {
  for (const key2 of Object.keys(value)) if (!fields.includes(key2)) fail(`${path}.${key2}`, "unknown field");
}
function list(value, path) {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) fail(path, "must be a plain array");
  const length = ownValue(value, "length", `${path}.length`);
  if (typeof length !== "number" || length > MAX_CUSTOM_CATEGORIES) fail(path, `must contain at most ${MAX_CUSTOM_CATEGORIES} categories`);
  if (Reflect.ownKeys(value).length !== length + 1) fail(path, "sparse arrays and extra array fields are not allowed");
  return Array.from({ length }, (_, index) => ownValue(value, String(index), `${path}[${index}]`));
}
function text(value, limit, path) {
  if (typeof value !== "string" || UNSAFE_TEXT.test(value)) fail(path, "must be single-line text with no control characters");
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > limit * 2 || [...trimmed].length > limit) {
    fail(path, `must have 1\u2013${limit} Unicode code points`);
  }
  return trimmed;
}
function boolean(value, path) {
  if (typeof value !== "boolean") fail(path, "must be a boolean");
  return value;
}
function route(input, path, allowDefault) {
  const entry = record(input, path);
  if (entry.mode === "default" && allowDefault) {
    onlyFields(entry, ["mode"], path);
    return { mode: "default" };
  }
  if (entry.mode === "inherit") {
    onlyFields(entry, ["mode"], path);
    return { mode: "inherit" };
  }
  if (entry.mode !== "explicit") fail(`${path}.mode`, allowDefault ? "expected default, inherit, or explicit" : "expected inherit or explicit");
  onlyFields(entry, ["mode", "provider", "model", "reasoningEffort"], path);
  return {
    mode: "explicit",
    provider: text(entry.provider, 128, `${path}.provider`),
    model: text(entry.model, 128, `${path}.model`),
    ...entry.reasoningEffort === void 0 ? {} : { reasoningEffort: text(entry.reasoningEffort, 48, `${path}.reasoningEffort`) }
  };
}
function target(input, path) {
  return route(input, path, false);
}
function baseConfig(builtins) {
  return {
    version: 3,
    defaultTarget: { mode: "inherit" },
    behavior: { guidance: true, delegationMode: "passive", strict: false },
    builtins,
    custom: [],
    historyLimit: 100
  };
}
function createDefaultRoutingConfig() {
  return baseConfig({ scout: { enabled: true } });
}
function parseRoutingConfig(input) {
  const source = record(input, "routing", ["version", "defaultTarget", "behavior", "builtins", "custom", "historyLimit"]);
  if (source.version !== 3) fail("routing.version", "must be 3");
  const result = baseConfig({});
  if (Object.hasOwn(source, "defaultTarget")) result.defaultTarget = target(source.defaultTarget, "routing.defaultTarget");
  if (Object.hasOwn(source, "behavior")) {
    const path = "routing.behavior";
    const entry = record(source.behavior, path, ["guidance", "delegationMode", "strict"]);
    if (!isDelegationMode(entry.delegationMode)) fail(`${path}.delegationMode`, `expected ${DELEGATION_MODES.join(", ")}`);
    result.behavior = { guidance: boolean(entry.guidance, `${path}.guidance`), delegationMode: entry.delegationMode, strict: boolean(entry.strict, `${path}.strict`) };
  }
  if (Object.hasOwn(source, "builtins")) {
    const map = record(source.builtins, "routing.builtins");
    for (const key2 of Object.keys(map)) if (!isBuiltinId(key2)) fail(`routing.builtins[${JSON.stringify(key2)}]`, "unknown builtin ID");
    for (const id of BUILTIN_IDS) {
      if (!Object.hasOwn(map, id)) continue;
      const path = `routing.builtins[${JSON.stringify(id)}]`;
      const entry = record(map[id], path, ["enabled", "binding"]);
      const override = {};
      if (Object.hasOwn(entry, "enabled")) {
        const enabled = boolean(entry.enabled, `${path}.enabled`);
        if (enabled !== BUILTINS[id].defaultEnabled) override.enabled = enabled;
      }
      if (Object.hasOwn(entry, "binding")) {
        const binding = route(entry.binding, `${path}.binding`, true);
        if (binding.mode !== "default") override.binding = binding;
      }
      if (Object.keys(override).length !== 0) result.builtins[id] = override;
    }
  }
  if (Object.hasOwn(source, "custom")) {
    const ids = /* @__PURE__ */ new Set();
    result.custom = list(source.custom, "routing.custom").map((input2, index) => {
      const path = `routing.custom[${index}]`;
      const entry = record(input2, path, ["id", "name", "purpose", "avoid", "enabled", "proactive", "binding"]);
      if (typeof entry.id !== "string" || entry.id.length < 8 || entry.id.length > 40 || !CUSTOM_ID_PATTERN.test(entry.id) || /[^a-z0-9-]/.test(entry.id)) fail(`${path}.id`, "invalid custom category ID");
      if (ids.has(entry.id)) fail(`${path}.id`, "duplicate custom category ID");
      ids.add(entry.id);
      return {
        id: entry.id,
        name: text(entry.name, 40, `${path}.name`),
        purpose: text(entry.purpose, 120, `${path}.purpose`),
        ...Object.hasOwn(entry, "avoid") ? { avoid: text(entry.avoid, 80, `${path}.avoid`) } : {},
        enabled: boolean(entry.enabled, `${path}.enabled`),
        proactive: boolean(entry.proactive, `${path}.proactive`),
        binding: route(entry.binding, `${path}.binding`, true)
      };
    });
  }
  if (Object.hasOwn(source, "historyLimit")) {
    const limit = source.historyLimit;
    if (typeof limit !== "number" || !Number.isSafeInteger(limit) || limit < 1 || limit > 1e3) {
      fail("routing.historyLimit", "must be a safe integer from 1 to 1000");
    }
    result.historyLimit = limit;
  }
  return result;
}
function routingConfigFingerprint(input) {
  return fingerprintNormalized(parseRoutingConfig(input));
}

// src/core/sha256.ts
var ROUND = new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var rotate = (word, count) => word >>> count | word << 32 - count;
function sha256(text2) {
  const input = new TextEncoder().encode(text2);
  const bytes = new Uint8Array(Math.ceil((input.length + 9) / 64) * 64);
  bytes.set(input);
  bytes[input.length] = 128;
  const view = new DataView(bytes.buffer);
  view.setBigUint64(bytes.length - 8, BigInt(input.length) * 8n);
  const state = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225];
  let [aa, bb, cc, dd, ee, ff, gg, hh] = [...state];
  const words = new Uint32Array(64);
  for (let block = 0; block < bytes.length; block += 64) {
    let [a, b, c, d, e, f, g, h] = [aa, bb, cc, dd, ee, ff, gg, hh];
    for (let i = 0; i < 64; i++) {
      if (i < 16) words[i] = view.getUint32(block + i * 4);
      else {
        const x = words[i - 15], y = words[i - 2];
        words[i] = words[i - 16] + (rotate(x, 7) ^ rotate(x, 18) ^ x >>> 3) + words[i - 7] + (rotate(y, 17) ^ rotate(y, 19) ^ y >>> 10);
      }
      const t1 = h + (rotate(e, 6) ^ rotate(e, 11) ^ rotate(e, 25)) + (e & f ^ ~e & g) + ROUND[i] + words[i];
      const t2 = (rotate(a, 2) ^ rotate(a, 13) ^ rotate(a, 22)) + (a & b ^ a & c ^ b & c);
      [a, b, c, d, e, f, g, h] = [t1 + t2 >>> 0, a, b, c, d + t1 >>> 0, e, f, g];
    }
    [aa, bb, cc, dd, ee, ff, gg, hh] = [
      aa + a >>> 0,
      bb + b >>> 0,
      cc + c >>> 0,
      dd + d >>> 0,
      ee + e >>> 0,
      ff + f >>> 0,
      gg + g >>> 0,
      hh + h >>> 0
    ];
  }
  return [aa, bb, cc, dd, ee, ff, gg, hh].map((word) => word.toString(16).padStart(8, "0")).join("");
}

// src/core/active-registry.ts
function freeze(value) {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) freeze(nested);
    Object.freeze(value);
  }
  return value;
}
function indexById(entries) {
  const map = new Map(entries.map((entry) => [entry.id, entry]));
  const view = Object.freeze({
    size: map.size,
    get: map.get.bind(map),
    has: map.has.bind(map),
    entries: map.entries.bind(map),
    keys: map.keys.bind(map),
    values: map.values.bind(map),
    [Symbol.iterator]: map[Symbol.iterator].bind(map),
    forEach(callback, thisArg) {
      map.forEach((value, key2) => Reflect.apply(callback, thisArg, [value, key2, view]));
    }
  });
  return view;
}
function resolveActiveRegistry(input) {
  const config = freeze(parseRoutingConfig(input));
  const entries = [];
  const routing = (binding) => binding === void 0 || binding.mode === "default" ? { bindingSource: "default", effectiveTarget: config.defaultTarget } : { bindingSource: "category", effectiveTarget: binding };
  for (const { id, group, en: en3, zh: zh3, proactive, defaultEnabled } of BUILTIN_LIST) {
    const entry = config.builtins[id];
    if (!(entry?.enabled ?? defaultEnabled)) continue;
    entries.push(Object.freeze({
      id,
      origin: "builtin",
      group,
      nameEn: en3.name,
      nameZh: zh3.name,
      purposeEn: en3.purpose,
      purposeZh: zh3.purpose,
      shortPurposeEn: en3.shortPurpose,
      avoidEn: en3.avoid,
      deliverableCheckEn: en3.deliverableCheck,
      proactive,
      ...routing(entry?.binding)
    }));
  }
  for (const entry of [...config.custom].sort(compareCategoryIds)) {
    if (!entry.enabled) continue;
    const points = [...entry.purpose];
    entries.push(Object.freeze({
      id: entry.id,
      origin: "custom",
      group: "custom",
      nameEn: entry.name,
      nameZh: entry.name,
      purposeEn: entry.purpose,
      purposeZh: entry.purpose,
      shortPurposeEn: points.length > 40 ? `${points.slice(0, 39).join("")}\u2026` : entry.purpose,
      ...entry.avoid === void 0 ? {} : { avoidEn: entry.avoid },
      proactive: entry.proactive,
      ...routing(entry.binding)
    }));
  }
  return Object.freeze({ config, configDigest: sha256(fingerprintNormalized(config)), entries: Object.freeze(entries), byId: indexById(entries) });
}
function requiredGrantPairs(registry) {
  const pairs = /* @__PURE__ */ new Map();
  for (const { effectiveTarget } of registry.entries) {
    if (effectiveTarget.mode !== "explicit") continue;
    const { provider, model } = effectiveTarget;
    pairs.set(JSON.stringify([provider, model]), { provider, model });
  }
  return [...pairs.values()];
}

// src/core/recommendations.ts
var RECOMMENDATION_VERSION = "2026-11-28.1";
var candidate = (provider, model, preferredEffort) => Object.freeze({ provider, model, ...preferredEffort === void 0 ? {} : { preferredEffort } });
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
var fastLeaders = [subscriptionMini, agyFlash, chat];
var fastAlternates = [
  mini,
  geminiFlash,
  candidate("antigravity-acp", "gemini-4-hydrogen", "low"),
  candidate("openai-codex", "gpt-6.2-sol", "low"),
  candidate("antigravity-acp", "gemini-4-neon", "low"),
  candidate("openai-codex", "gpt-6.2-astra", "low"),
  candidate(astra.provider, astra.model, "low"),
  candidate(codex.provider, codex.model, "low")
];
var RECOMMENDATION_CANDIDATES = Object.freeze({
  "visual-engineering": Object.freeze([argon, agyOpus, astra, geminiPro, sonnet, codex]),
  "frontend-engineering": Object.freeze([agySonnet, astra, geminiPro, codex, sonnet]),
  "backend-data": Object.freeze([astra, agySonnet, reasoner, codex, sonnet, geminiPro]),
  deep: Object.freeze([agySonnet, astra, geminiPro, agyOpus, codex, sonnet, chat]),
  debugging: Object.freeze([astra, agyOpus, reasoner, codex, opus, geminiPro]),
  "code-review": Object.freeze([agyOpus, astra, reasoner, agySonnet, codex, opus]),
  "verification-automation": Object.freeze([codex, agySonnet, geminiPro, astra, sonnet, subscriptionMini, mini]),
  ultrabrain: Object.freeze([astra, agyOpus, reasoner, opus, geminiPro]),
  artistry: Object.freeze([agyOpus, argon, astra, opus, geminiPro, sonnet]),
  writing: Object.freeze([agySonnet, astra, chat, sonnet, argon, geminiPro]),
  scout: Object.freeze([...fastLeaders, candidate("antigravity-acp", "gemini-3.8-flash", "low"), ...fastAlternates]),
  quick: Object.freeze([...fastLeaders, ...fastAlternates]),
  unspecified: Object.freeze([agySonnet, subscriptionMini, chat, sonnet, geminiFlash])
});
function recommendedTarget(candidates, catalog) {
  for (const { provider, model, preferredEffort } of candidates) {
    if (catalog.failures.some((failure) => failure.id === provider)) continue;
    const match = catalog.groups.find((group) => group.id === provider)?.models.find((entry) => entry.id === model);
    if (!match) continue;
    return {
      mode: "explicit",
      provider,
      model,
      ...preferredEffort !== void 0 && match.reasoning?.efforts.some((e) => e.id === preferredEffort) ? { reasoningEffort: preferredEffort } : {}
    };
  }
  return void 0;
}
function previewRecommendations(input, catalog, options = {}) {
  const registry = resolveActiveRegistry(input);
  const baselineFingerprint = routingConfigFingerprint(registry.config);
  const config = structuredClone(registry.config);
  const changes = [];
  const preserved = [];
  const unavailable = [];
  const skippedDisabled = [];
  const overwrite = options.overwrite === true;
  for (const { id, group } of BUILTIN_LIST) {
    if (options.group !== void 0 && options.group !== group) continue;
    if (!registry.byId.has(id)) {
      skippedDisabled.push(id);
      continue;
    }
    const before = config.builtins[id]?.binding ?? { mode: "default" };
    if (before.mode !== "default" && !overwrite) {
      preserved.push(id);
      continue;
    }
    const after = recommendedTarget(RECOMMENDATION_CANDIDATES[id], catalog);
    if (!after) {
      unavailable.push(id);
      continue;
    }
    if (JSON.stringify(before) === JSON.stringify(after)) continue;
    changes.push({ category: id, before: structuredClone(before), after: { ...after } });
    config.builtins[id] = { ...config.builtins[id], binding: after };
  }
  return {
    manifestVersion: RECOMMENDATION_VERSION,
    baselineFingerprint,
    config,
    changes,
    preserved,
    unavailable,
    skippedDisabled,
    overwrite,
    ...options.group === void 0 ? {} : { group: options.group }
  };
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

// src/ui/CategoryGroup.tsx
var React3 = __toESM(require("react"), 1);

// src/ui/RouteRow.tsx
var React2 = __toESM(require("react"), 1);

// src/ui/ModelPicker.tsx
var React = __toESM(require("react"), 1);
var import_jsx_runtime = require("react/jsx-runtime");
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { "aria-hidden": "true", focusable: "false", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: ICON_PATHS[name] }) });
}
var PAGE_SIZE = 60;
var CatalogOptions = React.memo(function CatalogOptions2({ matches, provider, model, choose }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: matches.groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { role: "group", "aria-label": group.provider.name, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { "aria-hidden": "true", className: "dtr-option-group-label", children: group.provider.name }),
    group.models.map((entry) => {
      const active = provider === group.provider.id && model === entry.id;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
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
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
              entry.name,
              group.provider.duplicateNames.has(entry.name) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dtr-option-detail", children: entry.id })
            ] }),
            active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "check" })
          ]
        },
        entry.id
      );
    })
  ] }, group.provider.id)) });
});
var ModelPicker = React.memo(function ModelPicker2({ t, catalog, status, mode, provider, model, label, detail, defaultSummary, id, titleId, invalid, issueId, disabled, register, onSelect }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState({ filter: "", limit: PAGE_SIZE });
  const filter = React.useDeferredValue(query).trim().toLowerCase();
  const limit = page.filter === filter ? page.limit : PAGE_SIZE;
  const root = React.useRef(null);
  const trigger = React.useRef(null);
  const popup = React.useRef(null);
  const input = React.useRef(null);
  const focusMore = React.useRef();
  const triggerRef = React.useCallback((node) => {
    trigger.current = node;
    register(node);
  }, [register]);
  const visible = open && !disabled;
  const close = React.useCallback(() => {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }, []);
  const choose = React.useCallback((choice) => {
    close();
    if (choice.mode !== mode || choice.mode === "explicit" && (choice.provider !== provider || choice.id !== model)) onSelect(choice);
  }, [close, mode, provider, model, onSelect]);
  React.useLayoutEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  React.useLayoutEffect(() => {
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
  const matches = React.useMemo(() => visible && !status ? searchCatalog(catalog, filter, limit) : void 0, [visible, status, catalog, filter, limit]);
  React.useLayoutEffect(() => {
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
  const specialOption = (choice, text2, description) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dtr-option", tabIndex: choice.mode === "default" || defaultSummary === void 0 ? 0 : -1, "aria-pressed": mode === choice.mode, onClick: () => choose(choice), children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
      text2,
      description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dtr-option-detail", children: description })
    ] }),
    mode === choice.mode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "check" })
  ] });
  const selectionText = detail ? `${label} \xB7 ${detail}` : label;
  const popupId = `${id}-popup`;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-field dtr-picker", ref: root, onKeyDown: (event) => {
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
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { id: `${id}-label`, children: t("model") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
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
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dtr-trigger-copy", id: `${id}-selection`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dtr-trigger-name", children: label }),
            detail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dtr-trigger-detail", children: mode === "default" ? `\xB7 ${detail}` : detail })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "chevron" })
        ]
      }
    ),
    visible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-menu", id: popupId, ref: popup, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dtr-sr-only", id: `${id}-keys`, children: t("searchKeys") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dtr-options", children: [
        defaultSummary !== void 0 && specialOption({ mode: "default" }, t("useDefault"), defaultSummary),
        specialOption({ mode: "inherit" }, t("inherit")),
        status ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-muted", role: "status", children: status }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          matches && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatalogOptions, { matches, provider, model, choose }),
          !matches?.groups.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dtr-muted", role: "status", children: t("noModels") }),
          matches?.hasMore && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dtr-option dtr-more", tabIndex: -1, onClick: () => {
            focusMore.current = popup.current?.querySelectorAll("[data-catalog-option]:not(:disabled)").length;
            setPage({ filter, limit: limit + PAGE_SIZE });
          }, children: t("moreModels") })
        ] })
      ] })
    ] })
  ] });
});

// src/ui/RouteRow.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var fieldKey = (section, field) => `${section}:${field}`;
var NO_EFFORTS = [];
function nativeDisplay(t, catalog, catalogReady, provider, id) {
  if (id === void 0) return { label: t("inherit") };
  if (!id) return { label: t("chooseModel") };
  const group = provider ? catalog.get(provider) : void 0;
  const model = group?.models.get(id)?.model;
  if (model && group && !group.failed) return { label: model.name, detail: group.duplicateNames.has(model.name) ? `${group.name} \xB7 ${model.id}` : group.name };
  return { label: catalogReady ? t("unavailableOption", { name: id }) : id, ...provider ? { detail: group?.name ?? provider } : {} };
}
function targetSummary(t, target2, catalog, catalogReady) {
  const explicit = target2.mode === "explicit" ? target2 : void 0;
  const display = nativeDisplay(t, catalog, catalogReady, explicit?.provider, explicit?.model);
  const base = display.detail ? `${display.label} \xB7 ${display.detail}` : display.label;
  return explicit?.reasoningEffort ? `${base} \xB7 ${explicit.reasoningEffort}` : base;
}
var RouteRow = React2.memo(function RouteRow2({
  t,
  section,
  name,
  purpose,
  instance,
  catalog,
  catalogReady,
  catalogStatus,
  provider,
  model,
  effort,
  followsDefault,
  defaultSummary,
  enabled = true,
  proactive = false,
  disabled,
  issueField,
  registerField,
  onToggleEnabled,
  onModel,
  onEffort,
  extraActions,
  children
}) {
  const baseId = `dtr-${instance}-${section}`;
  const titleId = `${baseId}-title`;
  const issueId = `dtr-${instance}-issue`;
  const isCategory = section !== "default";
  const customized = isCategory && !followsDefault;
  const mode = followsDefault ? "default" : model === void 0 ? "inherit" : "explicit";
  const display = followsDefault ? { label: t("useDefault"), detail: defaultSummary } : nativeDisplay(t, catalog, catalogReady, provider, model);
  const group = provider ? catalog.get(provider) : void 0;
  const catalogModel = model ? group?.models.get(model)?.model : void 0;
  const efforts = catalogModel?.reasoning?.efforts ?? NO_EFFORTS;
  const showEffort = enabled && !followsDefault && provider !== void 0 && model !== void 0 && (efforts.length > 0 || effort !== void 0);
  const pickerButton = React2.useRef(null);
  const registerModel = React2.useCallback((node) => {
    pickerButton.current = node;
    registerField(section, "model", node);
    registerField(section, "provider", node);
  }, [registerField, section]);
  const registerEffort = React2.useCallback((node) => registerField(section, "effort", node), [registerField, section]);
  const chooseModel = React2.useCallback((choice) => onModel(section, choice), [onModel, section]);
  const dormantSummary = !enabled && customized ? model === void 0 ? t("inherit") : `${display.label}${display.detail ? ` \xB7 ${display.detail}` : ""}${effort ? ` \xB7 ${effort}` : ""}` : void 0;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: `dtr-card dtr-route${section === "default" ? " dtr-route-default" : ""}${!enabled ? " dtr-route-disabled" : ""}`, role: "group", "aria-labelledby": titleId, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dtr-stack", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dtr-inline dtr-route-title", children: [
        isCategory && onToggleEnabled && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            type: "button",
            role: "switch",
            "aria-checked": enabled,
            "aria-label": t(enabled ? "disableCategory" : "enableCategory", { name }),
            className: "dtr-switch dtr-switch-sm",
            disabled,
            onClick: () => onToggleEnabled(section, !enabled)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h4", { id: titleId, children: name || section }),
        isCategory && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("code", { className: "dtr-route-id", children: section }),
        isCategory && enabled && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: `dtr-pill${customized ? " dtr-pill-brand" : ""}`, children: t(customized ? "customized" : "useDefault") }),
        isCategory && enabled && proactive && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dtr-pill dtr-pill-accent", children: t("proactive") }),
        isCategory && !enabled && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "dtr-pill dtr-pill-muted", children: t("disabledBadge") })
      ] }),
      purpose && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "dtr-route-purpose", children: purpose }),
      !enabled && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "dtr-muted dtr-dormant-note", children: [
        t("disabledNote"),
        dormantSummary ? ` \xB7 ${t("dormantBinding", { summary: dormantSummary })}` : ""
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "dtr-controls", children: [
      enabled && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
            invalid: issueField === "model" || issueField === "provider",
            issueId,
            disabled,
            register: registerModel,
            onSelect: chooseModel
          }
        ),
        showEffort && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("label", { className: "dtr-field dtr-effort", children: [
          t("effort"),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
            "select",
            {
              ref: registerEffort,
              id: `${baseId}-effort`,
              "aria-invalid": issueField === "effort" || void 0,
              "aria-describedby": issueField === "effort" ? issueId : void 0,
              value: effort ?? "",
              disabled: disabled || !catalogReady || !catalogModel || group?.failed,
              onChange: (event) => onEffort(section, provider, model, event.currentTarget.value),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: "", children: t("modelDefault") }),
                effort && !efforts.some((item) => item.id === effort) && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: effort, children: t("unavailableOption", { name: effort }) }),
                efforts.map((item) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("option", { value: item.id, children: item.name }, item.id))
              ]
            }
          )
        ] }),
        customized && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            type: "button",
            className: "dtr-icon-button",
            title: t("reset"),
            "aria-label": t("reset"),
            disabled,
            onClick: () => chooseModel({ mode: "default" }),
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Icon, { name: "reset" })
          }
        )
      ] }),
      extraActions
    ] }),
    children
  ] });
});

// src/ui/CategoryGroup.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var CategoryGroup = React3.memo(function CategoryGroup2({
  t,
  locale,
  groupId,
  entries,
  draftBuiltins,
  instance,
  catalog,
  catalogReady,
  catalogStatus,
  defaultSummary,
  disabled,
  issue,
  registerField,
  onToggleEnabled,
  onModel,
  onEffort
}) {
  const headingId = `dtr-${instance}-group-${groupId}`;
  const groupTitle = BUILTIN_GROUPS[groupId][locale];
  let enabledCount = 0;
  let customizedCount = 0;
  const primary = [];
  const followingDefault = [];
  for (const entry of entries) {
    const state = draftBuiltins[entry.id];
    if (state.enabled) enabledCount++;
    if (state.binding.mode !== "default") customizedCount++;
    const hasIssue = issue?.section === entry.id;
    if (!state.enabled || state.binding.mode !== "default" || hasIssue) primary.push(entry);
    else followingDefault.push(entry);
  }
  const handleToggle = React3.useCallback((section, next) => {
    onToggleEnabled(section, next);
  }, [onToggleEnabled]);
  const renderRow = (entry) => {
    const state = draftBuiltins[entry.id];
    const binding = state.binding;
    const followsDefault = binding.mode === "default";
    const explicit = binding.mode === "explicit" ? binding : void 0;
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      RouteRow,
      {
        t,
        section: entry.id,
        name: entry[locale].name,
        purpose: entry[locale].purpose,
        instance,
        catalog,
        catalogReady,
        catalogStatus,
        provider: explicit?.provider,
        model: explicit?.model,
        effort: explicit?.reasoningEffort,
        followsDefault,
        defaultSummary,
        enabled: state.enabled,
        proactive: entry.proactive,
        disabled,
        issueField: issue?.section === entry.id ? issue.field : void 0,
        registerField,
        onToggleEnabled: handleToggle,
        onModel,
        onEffort
      },
      entry.id
    );
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("section", { className: "dtr-group", "aria-labelledby": headingId, children: [
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "dtr-inline dtr-group-heading", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h4", { id: headingId, children: groupTitle }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dtr-count", children: t("groupCount", { enabled: enabledCount, total: entries.length }) }),
      customizedCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dtr-pill dtr-pill-brand", children: t("groupCustomized", { count: customizedCount }) })
    ] }),
    primary.map(renderRow),
    followingDefault.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("details", { className: "dtr-default-collapse", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("summary", { children: t("showDefaultRows", { count: followingDefault.length }) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "dtr-group dtr-collapse-body", children: followingDefault.map(renderRow) })
    ] })
  ] });
});

// src/ui/CustomCategoryEditor.tsx
var React4 = __toESM(require("react"), 1);
var import_jsx_runtime4 = require("react/jsx-runtime");
var META_FIELDS = /* @__PURE__ */ new Set(["id", "name", "purpose", "avoid"]);
var CustomCategoryEditor = React4.memo(function CustomCategoryEditor2({
  t,
  locale,
  custom,
  instance,
  catalog,
  catalogReady,
  catalogStatus,
  defaultSummary,
  disabled,
  issue,
  registerField,
  onAdd,
  onUpdate,
  onRemove,
  onModel,
  onEffort
}) {
  const [editing, setEditing] = React4.useState(() => /* @__PURE__ */ new Set());
  const [manualIds, setManualIds] = React4.useState(() => /* @__PURE__ */ new Set());
  const [showTemplates, setShowTemplates] = React4.useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = React4.useState();
  const headingId = `dtr-${instance}-group-custom`;
  const issueId = `dtr-${instance}-issue`;
  const atLimit = custom.length >= MAX_CUSTOM_CATEGORIES;
  const openEditor = React4.useCallback((id) => {
    setEditing((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);
  const toggleEditor = React4.useCallback((id) => {
    setEditing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const addBlank = () => {
    const id = onAdd();
    if (id) {
      openEditor(id);
      setShowTemplates(false);
    }
  };
  const addFromTemplate = (template2) => {
    const text2 = template2[locale];
    const id = onAdd({ id: template2.suggestedId, name: text2.name, purpose: text2.purpose, avoid: text2.avoid, proactive: false });
    if (id) {
      openEditor(id);
      setShowTemplates(false);
    }
  };
  const handleToggle = React4.useCallback((section, next) => {
    onUpdate(section, { enabled: next });
  }, [onUpdate]);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { className: "dtr-group dtr-custom-section", "aria-labelledby": headingId, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dtr-inline dtr-custom-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dtr-inline dtr-group-heading", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h4", { id: headingId, children: t("customTitle") }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "dtr-count", children: [
          custom.length,
          "/",
          MAX_CUSTOM_CATEGORIES
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dtr-inline", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", disabled: disabled || atLimit, onClick: addBlank, children: t("customAddBlank") }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "button",
          {
            type: "button",
            disabled: disabled || atLimit,
            "aria-expanded": showTemplates,
            onClick: () => setShowTemplates((value) => !value),
            children: t("customAddTemplate")
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "dtr-muted", children: t("customSubtitle", { max: MAX_CUSTOM_CATEGORIES }) }),
    atLimit && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "dtr-muted dtr-warning", role: "status", children: t("customLimitReached", { max: MAX_CUSTOM_CATEGORIES }) }),
    showTemplates && !atLimit && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { className: "dtr-card dtr-note", "aria-label": t("customTemplatesTitle"), children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dtr-inline dtr-toolbar", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("strong", { children: t("customTemplatesTitle") }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", onClick: () => setShowTemplates(false), children: t("customCancelDelete") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "dtr-template-grid", children: CUSTOM_CATEGORY_TEMPLATES.map((template2) => {
        const text2 = template2[locale];
        return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dtr-card dtr-template-card", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dtr-stack", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dtr-inline dtr-route-title", children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("strong", { children: text2.name }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("code", { className: "dtr-route-id", children: template2.suggestedId })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "dtr-route-purpose", children: text2.purpose }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "dtr-muted", children: t("customExample", { text: text2.example }) }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "dtr-muted", children: text2.nearBuiltin })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", disabled: disabled || atLimit, onClick: () => addFromTemplate(template2), children: t("customUseTemplate") })
        ] }, template2.templateId);
      }) })
    ] }),
    custom.length === 0 && !showTemplates && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "dtr-muted dtr-card dtr-note", children: t("customEmpty") }),
    custom.map((entry) => {
      const hasMetaIssue = issue?.section === entry.id && META_FIELDS.has(issue.field);
      const isOpen = editing.has(entry.id) || hasMetaIssue;
      const followsDefault = entry.binding.mode === "default";
      const explicit = entry.binding.mode === "explicit" ? entry.binding : void 0;
      const confirming = confirmDeleteId === entry.id;
      const baseId = `dtr-${instance}-${entry.id}`;
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
        RouteRow,
        {
          t,
          section: entry.id,
          name: entry.name || entry.id,
          purpose: entry.purpose,
          instance,
          catalog,
          catalogReady,
          catalogStatus,
          provider: explicit?.provider,
          model: explicit?.model,
          effort: explicit?.reasoningEffort,
          followsDefault,
          defaultSummary,
          enabled: entry.enabled,
          proactive: entry.proactive,
          disabled,
          issueField: issue?.section === entry.id ? issue.field : void 0,
          registerField,
          onToggleEnabled: handleToggle,
          onModel,
          onEffort,
          extraActions: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_jsx_runtime4.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", disabled, "aria-expanded": isOpen, onClick: () => toggleEditor(entry.id), children: t(isOpen ? "customDone" : "customEdit") }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "dtr-danger-button", disabled, onClick: () => setConfirmDeleteId(entry.id), children: t("customDelete") })
          ] }),
          children: [
            confirming && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dtr-custom-confirm", role: "alert", children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: t("customDeleteHint") }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dtr-inline", children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", disabled, onClick: () => setConfirmDeleteId(void 0), children: t("customCancelDelete") }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "dtr-danger-button", disabled, onClick: () => {
                  setConfirmDeleteId(void 0);
                  onRemove(entry.id);
                }, children: t("customDeleteConfirm") })
              ] })
            ] }),
            isOpen && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dtr-custom-form", children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dtr-custom-form-grid", children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("label", { className: "dtr-field", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: t("customName") }),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                    "input",
                    {
                      ref: (node) => registerField(entry.id, "name", node),
                      id: `${baseId}-name`,
                      type: "text",
                      maxLength: 40,
                      disabled,
                      placeholder: t("customNamePlaceholder"),
                      value: entry.name,
                      "aria-invalid": issue?.section === entry.id && issue.field === "name" || void 0,
                      "aria-describedby": issue?.section === entry.id && issue.field === "name" ? issueId : void 0,
                      onChange: (event) => {
                        const nextName = event.currentTarget.value;
                        if (!entry.persisted && !manualIds.has(entry.id)) {
                          const otherIds = custom.filter((item) => item.id !== entry.id).map((item) => item.id);
                          const nextId = generateCustomCategoryId(nextName, otherIds);
                          setEditing((prev) => {
                            const next = new Set(prev);
                            next.delete(entry.id);
                            next.add(nextId);
                            return next;
                          });
                          onUpdate(entry.id, { name: nextName, id: nextId });
                        } else {
                          onUpdate(entry.id, { name: nextName });
                        }
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("label", { className: "dtr-field", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
                    t("customId"),
                    entry.persisted ? ` \xB7 ${t("customIdLocked")}` : ""
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                    "input",
                    {
                      ref: (node) => registerField(entry.id, "id", node),
                      id: `${baseId}-id`,
                      type: "text",
                      maxLength: 40,
                      disabled: disabled || entry.persisted,
                      value: entry.id,
                      "aria-invalid": issue?.section === entry.id && issue.field === "id" || void 0,
                      "aria-describedby": issue?.section === entry.id && issue.field === "id" ? issueId : void 0,
                      onChange: (event) => {
                        const nextId = event.currentTarget.value;
                        setManualIds((prev) => {
                          const next = new Set(prev);
                          next.delete(entry.id);
                          next.add(nextId);
                          return next;
                        });
                        setEditing((prev) => {
                          const next = new Set(prev);
                          next.delete(entry.id);
                          next.add(nextId);
                          return next;
                        });
                        onUpdate(entry.id, { id: nextId });
                      }
                    }
                  ),
                  !entry.persisted && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "dtr-muted", children: t("customIdHint") })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("label", { className: "dtr-field", children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: t("customPurpose") }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                  "input",
                  {
                    ref: (node) => registerField(entry.id, "purpose", node),
                    id: `${baseId}-purpose`,
                    type: "text",
                    maxLength: 120,
                    disabled,
                    placeholder: t("customPurposePlaceholder"),
                    value: entry.purpose,
                    "aria-invalid": issue?.section === entry.id && issue.field === "purpose" || void 0,
                    "aria-describedby": issue?.section === entry.id && issue.field === "purpose" ? issueId : void 0,
                    onChange: (event) => onUpdate(entry.id, { purpose: event.currentTarget.value })
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("label", { className: "dtr-field", children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: t("customAvoid") }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                  "input",
                  {
                    ref: (node) => registerField(entry.id, "avoid", node),
                    id: `${baseId}-avoid`,
                    type: "text",
                    maxLength: 80,
                    disabled,
                    placeholder: t("customAvoidPlaceholder"),
                    value: entry.avoid,
                    "aria-invalid": issue?.section === entry.id && issue.field === "avoid" || void 0,
                    "aria-describedby": issue?.section === entry.id && issue.field === "avoid" ? issueId : void 0,
                    onChange: (event) => onUpdate(entry.id, { avoid: event.currentTarget.value })
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "dtr-toggle-row dtr-custom-proactive", children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("strong", { id: `${baseId}-proactive`, children: t("customProactive") }),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { id: `${baseId}-proactive-hint`, className: "dtr-muted", children: t("customProactiveHint") })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                  "button",
                  {
                    type: "button",
                    role: "switch",
                    "aria-checked": entry.proactive,
                    "aria-labelledby": `${baseId}-proactive`,
                    "aria-describedby": `${baseId}-proactive-hint`,
                    className: "dtr-switch",
                    disabled,
                    onClick: () => onUpdate(entry.id, { proactive: !entry.proactive })
                  }
                )
              ] })
            ] })
          ]
        },
        entry.id
      );
    })
  ] });
});

// src/ui/GrantDiagnostics.tsx
var React5 = __toESM(require("react"), 1);

// src/ui/model-grants.ts
var MODEL_AUTHORIZATION_ENTRY = "subagent-model-selection-settings";
var key = (route2) => JSON.stringify([route2.provider, route2.model]);
function requiredModelRoutes(config) {
  return requiredGrantPairs(resolveActiveRegistry(config));
}
function isAllowedModelArray(value) {
  if (!Array.isArray(value)) return false;
  for (const row of value) {
    if (typeof row?.provider !== "string" || !row.provider.length || typeof row?.model !== "string" || !row.model.length) return false;
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
  const missing = required.filter((route2) => !existing.has(key(route2)));
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
var import_jsx_runtime5 = require("react/jsx-runtime");
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
var GrantDiagnostics = React5.memo(function GrantDiagnostics2({ id, problem, locale, inventory, recheck, openBundle, dirty }) {
  const t = locale === "zh" ? zh : en;
  const [attempt, retry] = React5.useReducer((v) => v + 1, 0);
  const [evidence, setEvidence] = React5.useState();
  const [probe, setProbe] = React5.useState();
  const [copy, setCopy] = React5.useState();
  React5.useEffect(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("section", { id, tabIndex: -1, className: "dtr-card dtr-note dtr-diagnostics", "aria-labelledby": `${id}-summary`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { id: `${id}-summary`, role: "status", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("strong", { children: t[problem] }) }),
    problem === "unserved" && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { children: !evidence ? t.checking : conflict && evidence.component === "disabled" ? locale === "zh" ? "\u5B50\u667A\u80FD\u4F53\u6A21\u578B\u6388\u6743\u7EC4\u4EF6\u672A\u542F\u7528\u3002" : "Subagent model authorization is disabled." : t[evidence.component] }),
    conflict && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("p", { children: [
      t.conflict(conflict.installed, conflict.runtime),
      " ",
      conflict.offered ? t.update(conflict.offered) : t.noTarget
    ] }),
    probe && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { role: "status", children: locale === "zh" ? { available: "DSH \u5DF2\u80FD\u63D0\u4F9B\u6388\u6743\u8BBE\u7F6E\u3002\u82E5\u4FDD\u5B58\u4ECD\u4E0D\u53EF\u7528\uFF0C\u8BF7\u8BB0\u4E0B\u672A\u4FDD\u5B58\u7684\u4FEE\u6539\uFF0C\u518D\u5237\u65B0\u9875\u9762\u3002", unchanged: "\u5DF2\u91CD\u65B0\u68C0\u6D4B\uFF0C\u6388\u6743\u8BBE\u7F6E\u4ECD\u672A\u5C31\u7EEA\u6216\u4E0D\u53EF\u5199\u3002", unknown: "\u65E0\u6CD5\u4ECE DSH \u83B7\u53D6\u6700\u65B0\u72B6\u6001\u3002\u8BF7\u786E\u8BA4\u8FDE\u63A5\u540E\u91CD\u8BD5\u3002" }[probe] : { available: "DSH now serves authorization settings. If Save remains unavailable, note your unsaved edits before refreshing the page.", unchanged: "Checked again: the settings are still unavailable or read-only.", unknown: "Could not reach DSH for a fresh status. Check the connection and retry." }[probe] }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "dtr-inline", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", onClick: retry, children: t.retry }),
      conflict && openBundle && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", onClick: () => openBundle(conflict.name), children: t.open }),
      problem !== "loading" && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { type: "button", onClick: async () => {
        try {
          await navigator.clipboard.writeText(report);
          setCopy("copied");
        } catch {
          setCopy("manual");
        }
      }, children: t.copy })
    ] }),
    dirty && conflict && openBundle && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { className: "dtr-muted", children: t.leave }),
    copy && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("p", { role: "status", children: t[copy] }),
    problem !== "loading" && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("details", { open: copy === "manual" || void 0, children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("summary", { children: t.details }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("pre", { children: report })
    ] }, copy === "manual" ? "manual" : "details")
  ] });
});

// src/ui/routing-editor.ts
var UNSAFE_TEXT2 = /[\p{Cc}\u2028\u2029\u200E\u200F\u202A-\u202E\u2066-\u2069]/u;
var CLASSIC7_SET = new Set(CLASSIC7_IDS);
function validSingleLine(value, limit) {
  if (UNSAFE_TEXT2.test(value)) return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && [...trimmed].length <= limit;
}
function routingFormConfig(value) {
  return value.routing === void 0 ? createDefaultRoutingConfig() : parseRoutingConfig(value.routing);
}
function routingConfigToDraft(input, persistedCustomIds) {
  const config = parseRoutingConfig(input);
  const builtins = /* @__PURE__ */ Object.create(null);
  for (const id of BUILTIN_IDS) {
    const override = config.builtins[id];
    builtins[id] = {
      enabled: override?.enabled ?? BUILTINS[id].defaultEnabled,
      binding: override?.binding ? structuredClone(override.binding) : { mode: "default" }
    };
  }
  const custom = config.custom.map((entry) => ({
    id: entry.id,
    persisted: persistedCustomIds ? persistedCustomIds.has(entry.id) : true,
    name: entry.name,
    purpose: entry.purpose,
    avoid: entry.avoid ?? "",
    enabled: entry.enabled,
    proactive: entry.proactive,
    binding: structuredClone(entry.binding)
  }));
  return {
    defaultTarget: structuredClone(config.defaultTarget),
    behavior: { ...config.behavior },
    builtins,
    custom,
    historyLimit: String(config.historyLimit)
  };
}
function routingDraftToConfig(draft) {
  const builtins = {};
  for (const id of BUILTIN_IDS) {
    const entry = draft.builtins[id];
    if (!entry) continue;
    const override = {};
    if (entry.enabled !== BUILTINS[id].defaultEnabled) override.enabled = entry.enabled;
    if (entry.binding.mode !== "default") override.binding = entry.binding;
    if (Object.keys(override).length > 0) builtins[id] = override;
  }
  const custom = draft.custom.map((entry) => ({
    id: entry.id,
    name: entry.name,
    purpose: entry.purpose,
    ...entry.avoid.trim() === "" ? {} : { avoid: entry.avoid },
    enabled: entry.enabled,
    proactive: entry.proactive,
    binding: entry.binding
  }));
  return parseRoutingConfig({
    version: 3,
    defaultTarget: draft.defaultTarget,
    behavior: draft.behavior,
    builtins,
    custom,
    historyLimit: draft.historyLimit.trim() === "" ? NaN : Number(draft.historyLimit)
  });
}
function routingConfigMutations(input) {
  return [{ op: "set", path: ["routing"], value: parseRoutingConfig(input) }];
}
function validateExplicitTarget(section, target2, checkCatalog, catalog, catalogReady = catalog !== void 0) {
  if (!target2.provider.trim()) return { section, field: "provider", reason: "required" };
  if (!target2.model.trim()) return { section, field: "model", reason: "required" };
  if (!checkCatalog) return void 0;
  if (!catalogReady || !catalog) return { section, field: "model", reason: "catalogRequired" };
  const group = catalog.groups.find((entry) => entry.id === target2.provider.trim());
  if (!group || catalog.failures.some((failure) => failure.id === group.id)) {
    return { section, field: "provider", reason: "catalog" };
  }
  const model = group.models.find((entry) => entry.id === target2.model.trim());
  if (!model) return { section, field: "model", reason: "catalog" };
  if (target2.reasoningEffort !== void 0 && !model.reasoning?.efforts.some((effort) => effort.id === target2.reasoningEffort?.trim())) {
    return { section, field: "effort", reason: "catalog" };
  }
  return void 0;
}
function routingDraftIssue(draft, catalog, catalogReady = catalog !== void 0) {
  const history = Number(draft.historyLimit);
  if (draft.historyLimit.trim() === "" || !Number.isInteger(history) || history < 1 || history > 1e3) {
    return { section: "default", field: "historyLimit", reason: "history" };
  }
  if (draft.custom.length > MAX_CUSTOM_CATEGORIES) {
    return { section: "default", field: "id", reason: "customLimit" };
  }
  let anyEnabledFollowsDefault = false;
  for (const id of BUILTIN_IDS) {
    const entry = draft.builtins[id];
    if (entry?.enabled && entry.binding.mode === "default") anyEnabledFollowsDefault = true;
  }
  for (const entry of draft.custom) {
    if (entry.enabled && entry.binding.mode === "default") anyEnabledFollowsDefault = true;
  }
  if (draft.defaultTarget.mode === "explicit") {
    const issue = validateExplicitTarget("default", draft.defaultTarget, anyEnabledFollowsDefault, catalog, catalogReady);
    if (issue) return issue;
  }
  for (const id of BUILTIN_IDS) {
    const entry = draft.builtins[id];
    if (!entry || entry.binding.mode !== "explicit") continue;
    const issue = validateExplicitTarget(id, entry.binding, entry.enabled, catalog, catalogReady);
    if (issue) return issue;
  }
  const seenCustomIds = /* @__PURE__ */ new Set();
  for (const entry of draft.custom) {
    const section = entry.id || "custom";
    if (entry.id.length < 8 || entry.id.length > 40 || !CUSTOM_ID_PATTERN.test(entry.id) || /[^a-z0-9-]/.test(entry.id)) {
      return { section, field: "id", reason: "customId" };
    }
    if (seenCustomIds.has(entry.id)) {
      return { section, field: "id", reason: "customDuplicate" };
    }
    seenCustomIds.add(entry.id);
    if (!validSingleLine(entry.name, 40)) return { section, field: "name", reason: "text" };
    if (!validSingleLine(entry.purpose, 120)) return { section, field: "purpose", reason: "text" };
    if (entry.avoid !== "" && (UNSAFE_TEXT2.test(entry.avoid) || entry.avoid.trim() !== "" && !validSingleLine(entry.avoid, 80))) {
      return { section, field: "avoid", reason: "text" };
    }
    if (entry.binding.mode === "explicit") {
      const issue = validateExplicitTarget(section, entry.binding, entry.enabled, catalog, catalogReady);
      if (issue) return issue;
    }
  }
  try {
    routingDraftToConfig(draft);
  } catch (error) {
    return { section: "default", field: "model", reason: "structure", detail: error instanceof Error ? error.message : String(error) };
  }
  return void 0;
}
function sameEffectiveActiveTargets(a, b) {
  const stripBehavior = (config) => routingConfigFingerprint({
    ...config,
    behavior: { guidance: true, delegationMode: "passive", strict: false }
  });
  return stripBehavior(a) === stripBehavior(b);
}
var RoutingEditor = class {
  state = {
    draft: void 0,
    revision: void 0,
    dirty: false,
    saving: false,
    stale: false,
    issue: void 0,
    error: void 0,
    notice: void 0
  };
  listeners = /* @__PURE__ */ new Set();
  customBindings = /* @__PURE__ */ new Map();
  explicitTargets = /* @__PURE__ */ new Map();
  savedConfig;
  savedFingerprint;
  persistedCustomIds = /* @__PURE__ */ new Set();
  stop;
  disposed = false;
  form;
  grants;
  constructor(form, grants) {
    this.form = form;
    this.grants = grants;
    this.accept();
    this.stop = form.subscribe(() => {
      if (this.state.saving) return;
      if (!this.state.dirty) this.accept();
      else {
        const stale = form.getSnapshot().revision !== this.state.revision;
        this.publish({ ...this.state, stale });
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
      this.customBindings.clear();
      this.explicitTargets.clear();
    }
    if (draft.defaultTarget.mode === "explicit") this.explicitTargets.set("default", structuredClone(draft.defaultTarget));
    for (const id of BUILTIN_IDS) {
      const binding = draft.builtins[id].binding;
      if (binding.mode !== "default") {
        this.customBindings.set(id, structuredClone(binding));
        if (binding.mode === "explicit") this.explicitTargets.set(id, structuredClone(binding));
      }
    }
    for (const entry of draft.custom) {
      if (entry.binding.mode !== "default") {
        this.customBindings.set(entry.id, structuredClone(entry.binding));
        if (entry.binding.mode === "explicit") this.explicitTargets.set(entry.id, structuredClone(entry.binding));
      }
    }
  }
  computeDirty(draft) {
    if (this.savedFingerprint === void 0) return true;
    try {
      return routingConfigFingerprint(routingDraftToConfig(draft)) !== this.savedFingerprint;
    } catch {
      return true;
    }
  }
  accept(notice) {
    const host = this.form.getSnapshot();
    try {
      const config = host.value === void 0 ? void 0 : routingFormConfig(host.value);
      this.savedConfig = config;
      this.savedFingerprint = config === void 0 ? void 0 : routingConfigFingerprint(config);
      this.persistedCustomIds = new Set(config?.custom.map((entry) => entry.id) ?? []);
      const draft = config === void 0 ? void 0 : routingConfigToDraft(config, this.persistedCustomIds);
      this.customBindings.clear();
      this.explicitTargets.clear();
      if (draft) this.remember(draft, true);
      this.publish({
        draft,
        revision: host.revision,
        dirty: false,
        saving: false,
        stale: false,
        issue: void 0,
        error: void 0,
        notice
      });
    } catch (error) {
      this.savedConfig = void 0;
      this.savedFingerprint = void 0;
      this.persistedCustomIds.clear();
      this.publish({
        ...this.state,
        draft: void 0,
        revision: host.revision,
        dirty: false,
        saving: false,
        stale: false,
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
    const cloned = structuredClone(draft);
    this.remember(cloned);
    this.publish({
      ...this.state,
      draft: cloned,
      revision,
      dirty: this.computeDirty(cloned),
      stale,
      issue: void 0,
      error: void 0,
      notice: void 0
    });
  }
  editBehavior(patch, revision = this.state.revision) {
    const draft = this.state.draft;
    if (!draft) return;
    this.edit({ ...draft, behavior: { ...draft.behavior, ...patch } }, revision);
  }
  setBuiltinEnabled(id, enabled, revision = this.state.revision) {
    const draft = this.state.draft;
    if (!draft || !isBuiltinId(id)) return;
    this.edit({
      ...draft,
      builtins: { ...draft.builtins, [id]: { ...draft.builtins[id], enabled } }
    }, revision);
  }
  /** Bulk-toggle builtin enabled switches only; preserves bindings, custom categories, and requires explicit Save. */
  applyBuiltinPreset(preset, revision = this.state.revision) {
    const draft = this.state.draft;
    if (!draft) return;
    const builtins = { ...draft.builtins };
    for (const id of BUILTIN_IDS) {
      const enabled = preset === "all" || CLASSIC7_SET.has(id);
      builtins[id] = { ...builtins[id], enabled };
    }
    this.edit({ ...draft, builtins }, revision);
  }
  setSectionBinding(section, binding, revision = this.state.revision) {
    const draft = this.state.draft;
    if (!draft) return;
    if (section === "default") {
      if (binding.mode === "default") return;
      this.edit({ ...draft, defaultTarget: binding }, revision);
      return;
    }
    if (isBuiltinId(section)) {
      this.edit({
        ...draft,
        builtins: { ...draft.builtins, [section]: { ...draft.builtins[section], binding } }
      }, revision);
      return;
    }
    const index = draft.custom.findIndex((entry) => entry.id === section);
    if (index < 0) return;
    const nextCustom = [...draft.custom];
    nextCustom[index] = { ...nextCustom[index], binding };
    this.edit({ ...draft, custom: nextCustom }, revision);
  }
  setCategoryMode(section, mode, revision = this.state.revision) {
    const target2 = this.customBindings.get(section) ?? { mode: "inherit" };
    this.setSectionBinding(section, mode === "default" ? { mode: "default" } : target2, revision);
  }
  setNativeModelMode(section, mode, revision = this.state.revision, choice) {
    const previous = this.explicitTargets.get(section);
    const matches = previous?.provider === choice?.provider && previous?.model === choice?.model;
    const target2 = mode === "inherit" ? { mode: "inherit" } : choice && !matches ? { mode: "explicit", provider: choice.provider, model: choice.model } : previous ?? { mode: "explicit", provider: "", model: "" };
    this.setSectionBinding(section, target2, revision);
  }
  setSectionEffort(section, provider, model, effort, revision = this.state.revision) {
    const target2 = { mode: "explicit", provider, model, ...effort ? { reasoningEffort: effort } : {} };
    this.setSectionBinding(section, target2, revision);
  }
  addCustomCategory(seed, revision = this.state.revision) {
    const draft = this.state.draft;
    if (!draft || draft.custom.length >= MAX_CUSTOM_CATEGORIES) return void 0;
    const taken = new Set(draft.custom.map((entry2) => entry2.id));
    let id;
    if (seed?.id && CUSTOM_ID_PATTERN.test(seed.id) && seed.id.length >= 8 && seed.id.length <= 40 && !taken.has(seed.id)) {
      id = seed.id;
    } else {
      id = generateCustomCategoryId(seed?.name ?? seed?.id ?? "", taken);
    }
    const entry = {
      id,
      persisted: false,
      name: seed?.name ?? "",
      purpose: seed?.purpose ?? "",
      avoid: seed?.avoid ?? "",
      enabled: true,
      proactive: seed?.proactive ?? false,
      binding: { mode: "default" }
    };
    this.edit({ ...draft, custom: [...draft.custom, entry] }, revision);
    return id;
  }
  updateCustomCategory(id, patch, revision = this.state.revision) {
    const draft = this.state.draft;
    if (!draft) return;
    const index = draft.custom.findIndex((entry) => entry.id === id);
    if (index < 0) return;
    const current = draft.custom[index];
    const nextId = current.persisted ? current.id : patch.id ?? current.id;
    const nextEntry = { ...current, ...patch, id: nextId, persisted: current.persisted };
    const nextCustom = [...draft.custom];
    nextCustom[index] = nextEntry;
    this.edit({ ...draft, custom: nextCustom }, revision);
  }
  removeCustomCategory(id, revision = this.state.revision) {
    const draft = this.state.draft;
    if (!draft) return;
    const nextCustom = draft.custom.filter((entry) => entry.id !== id);
    if (nextCustom.length === draft.custom.length) return;
    this.customBindings.delete(id);
    this.explicitTargets.delete(id);
    this.edit({ ...draft, custom: nextCustom }, revision);
  }
  discard() {
    if (!this.disposed && !this.state.saving) this.accept();
  }
  applyRecommendations(preview, revision = this.state.revision) {
    const host = this.form.getSnapshot();
    if (this.disposed || this.state.saving || !this.state.draft || host.status !== "ready" || !host.writable) return false;
    try {
      if (revision === void 0 || revision !== host.revision || revision !== this.state.revision || preview.baselineFingerprint !== routingConfigFingerprint(routingDraftToConfig(this.state.draft))) {
        this.publish({ ...this.state, error: { kind: "previewChanged", detail: "" } });
        return false;
      }
      this.edit(routingConfigToDraft(preview.config, this.persistedCustomIds), revision);
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
      this.publish({ ...state, stale: true, error: { kind: "refused", detail: "" } });
      return false;
    }
    const behaviorOnlyCandidate = (() => {
      if (!this.savedConfig) return false;
      try {
        const candidate2 = routingDraftToConfig(state.draft);
        return sameEffectiveActiveTargets(candidate2, this.savedConfig);
      } catch {
        return false;
      }
    })();
    const catalogReady = options.catalogReady ?? options.catalog !== void 0;
    if (!behaviorOnlyCandidate || catalogReady) {
      const issue = routingDraftIssue(state.draft, options.catalog, catalogReady);
      if (issue) {
        this.publish({ ...state, issue, error: void 0, notice: void 0 });
        return false;
      }
    }
    let parsedConfig;
    try {
      parsedConfig = routingDraftToConfig(state.draft);
    } catch (error) {
      this.publish({ ...state, error: { kind: "validation", detail: error instanceof Error ? error.message : String(error) } });
      return false;
    }
    const required = requiredModelRoutes(parsedConfig);
    const grant = planModelGrant(required, this.grants.getSnapshot());
    const configDirty = this.savedFingerprint === void 0 || routingConfigFingerprint(parsedConfig) !== this.savedFingerprint;
    if (!configDirty && grant.kind === "complete") return false;
    if (grant.kind === "unavailable" || grant.kind === "readOnly") {
      this.publish({ ...state, error: { kind: grant.kind === "readOnly" ? "grantReadOnly" : "grantUnavailable", detail: "" }, notice: void 0 });
      return false;
    }
    this.publish({ ...state, saving: true, issue: void 0, error: void 0, notice: void 0 });
    try {
      if (configDirty && !await this.form.mutate(routingConfigMutations(parsedConfig), state.revision)) {
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
  description: "Choose how the assistant delegates tasks and which models each active category uses.",
  behaviorTitle: "Delegation and validation",
  delegationMode: "Delegation mode",
  delegationPassive: "Passive",
  delegationPassiveNote: "Apply routing only when the assistant chooses to delegate.",
  delegationSpecialistFirst: "Specialist-first",
  delegationSpecialistNote: "Proactively delegate specialist work; handle small tasks directly.",
  delegationOrchestrator: "Lead coordinator",
  delegationOrchestratorNote: "The lead scopes and verifies while subagents run matching work; does not switch the lead model or enable team boards.",
  delegationScope: "Root session only. Proactive routes must be enabled, authorized, and differ in provider, model, or reasoning effort. Explicit user requests to work directly take priority.",
  activeSummary: "Active: {builtinEnabled}/{builtinTotal} built-in \xB7 {customEnabled}/{customTotal} custom \xB7 {proactive} eligible for proactive delegation",
  enforceRouting: "Strict native subagent validation",
  enforceHint: "Block calls that don\u2019t match active category routes and ask the assistant to retry.",
  guidanceToggle: "Inject routing guidance and reminders",
  guidanceHint: "Include active category routes in system instructions and proactive step-1 reminders.",
  routingTitle: "Model routing",
  defaults: "Default fallback target",
  defaultPurpose: "Used by enabled categories that follow the default.",
  presetLabel: "Built-in switches:",
  presetAll: "All {count} built-in",
  presetClassic7: "Compact 7",
  presetHint: "Only changes built-in on/off switches. Saved bindings and custom categories are kept.",
  proactive: "Proactive",
  disabledBadge: "Disabled",
  disabledNote: "Disabled \u2014 excluded from prompts, strict validation, and model authorization.",
  dormantBinding: "Saved binding kept: {summary}",
  groupCount: "{enabled}/{total} active",
  groupCustomized: "{count} customized",
  showDefaultRows: "Following default ({count})",
  useDefault: "Follow default",
  customized: "Customized",
  reset: "Reset to default",
  inherit: "Inherit session model",
  enableCategory: "Enable {name}",
  disableCategory: "Disable {name}",
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
  recommendationScope: "Recommendation scope",
  scopeAll: "All enabled built-in",
  recommendationHint: "Version {version}. Matches exact catalog IDs for enabled built-in categories only. Custom categories are never guessed.",
  overwrite: "Overwrite customized",
  previewTitle: "Review recommended changes",
  before: "Current:",
  after: "Recommended:",
  previewHint: "Applying updates the draft only. Save to persist. Default target and custom categories stay unchanged.",
  applyPreview: "Apply to draft",
  cancelPreview: "Keep current draft",
  noChanges: "No matching changes to apply.",
  preserved: "Customized kept: {count}",
  unmatched: "No matching candidate: {count}",
  skippedDisabled: "Disabled skipped: {count}",
  previewChanged: "The draft or Host revision changed since the preview opened. Generate a new preview.",
  customTitle: "Custom categories",
  customSubtitle: "Add up to {max} domain-specific deliverables. Disabled or deleted categories keep past execution history readable.",
  customEmpty: "No custom categories yet. Create a blank one or start from a common scenario template.",
  customAddBlank: "New blank category",
  customAddTemplate: "From common scenario",
  customTemplatesTitle: "Start from a scenario template",
  customUseTemplate: "Use template",
  customExample: "Example: {text}",
  customLimitReached: "Limit reached ({max}/{max}). Delete one before adding another.",
  customEdit: "Edit details",
  customDone: "Done editing",
  customDelete: "Delete",
  customDeleteConfirm: "Confirm delete",
  customDeleteHint: "Past execution history and running tasks are preserved.",
  customCancelDelete: "Cancel",
  customName: "Display name",
  customNamePlaceholder: "e.g. Evidence verification",
  customId: "Category ID",
  customIdHint: "Lowercase ASCII starting with custom- (8\u201340 chars). Locked after saving.",
  customIdLocked: "Locked after save",
  customPurpose: "When to choose this category",
  customPurposePlaceholder: "Use when input is\u2026 and the main deliverable is\u2026",
  customAvoid: "When NOT to choose it (optional)",
  customAvoidPlaceholder: "If only\u2026, choose another category instead.",
  customProactive: "Eligible for proactive delegation",
  customProactiveHint: "Off by default for new custom categories; turn on once routing is verified.",
  advanced: "Advanced settings",
  historyLimit: "History limit (1\u20131000)",
  save: "Save changes",
  saving: "Saving\u2026",
  cancel: "Undo edits",
  reload: "Reload Host settings",
  saved: "Saved",
  dirty: "Unsaved changes",
  current: "Up to date",
  needsGrant: "Model authorization needed",
  stale: "The Host changed while you were editing. Your draft is preserved; reload before saving.",
  refused: "The Host refused this save. Your draft is preserved; no automatic overwrite was attempted.",
  grantFailed: "Routing config is saved, but model authorization could not be confirmed. Retry Save.",
  validationError: "Invalid configuration: {message}",
  transportError: "Save failed: {message}. Your draft is preserved.",
  required: "This field is required.",
  history: "Enter an integer from 1 to 1000.",
  catalog: "This provider, model, or effort is not available in the live catalog.",
  catalogRequired: "A current model catalog is required for active explicit models. Inherited targets do not require it.",
  structure: "The routing configuration structure is invalid.",
  customIdError: "ID must be 8\u201340 lowercase ASCII chars matching custom-a-z0-9.",
  customDuplicate: "This custom category ID is already used.",
  customLimit: "At most 8 custom categories are allowed.",
  textError: "Enter single-line text without control characters within the allowed length.",
  fieldId: "ID",
  fieldName: "Name",
  fieldPurpose: "When to choose",
  fieldAvoid: "When not to choose"
};
var zh2 = {
  language: "zh",
  title: "\u56E2\u961F\u4EFB\u52A1\u8DEF\u7531",
  description: "\u8BBE\u7F6E\u4E3B\u52A9\u624B\u7684\u59D4\u6D3E\u65B9\u5F0F\uFF0C\u4EE5\u53CA\u5404\u4E2A\u5DF2\u542F\u7528\u7C7B\u522B\u4F7F\u7528\u7684\u6A21\u578B\u3002",
  behaviorTitle: "\u59D4\u6D3E\u4E0E\u6821\u9A8C",
  delegationMode: "\u59D4\u6D3E\u6A21\u5F0F",
  delegationPassive: "\u88AB\u52A8\u8DEF\u7531",
  delegationPassiveNote: "\u4EC5\u5728\u4E3B\u52A9\u624B\u4E3B\u52A8\u8C03\u7528\u5B50\u667A\u80FD\u4F53\u65F6\u5E94\u7528\u8DEF\u7531\u3002",
  delegationSpecialistFirst: "\u4E13\u957F\u4F18\u5148",
  delegationSpecialistNote: "\u4E3B\u52A8\u59D4\u6D3E\u4E13\u957F\u4EFB\u52A1\uFF0C\u7B80\u5355\u4EFB\u52A1\u7531\u4E3B\u52A9\u624B\u5904\u7406\u3002",
  delegationOrchestrator: "\u4E3B\u52A9\u624B\u7EDF\u7B79",
  delegationOrchestratorNote: "\u4E3B\u52A9\u624B\u8D1F\u8D23\u5206\u5DE5\u548C\u9A8C\u6536\uFF0C\u5339\u914D\u5DE5\u4F5C\u4EA4\u7ED9\u5B50\u52A9\u624B\uFF1B\u4E0D\u4F1A\u81EA\u52A8\u5207\u6362\u4E3B\u52A9\u624B\u6A21\u578B\uFF0C\u4E5F\u4E0D\u81EA\u52A8\u5F00\u542F\u56E2\u961F\u770B\u677F\u3002",
  delegationScope: "\u4EC5\u5728\u4E3B\u4F1A\u8BDD\u751F\u6548\u3002\u53C2\u4E0E\u4E3B\u52A8\u59D4\u6D3E\u7684\u7C7B\u522B\u987B\u5DF2\u542F\u7528\u3001\u5DF2\u6388\u6743\uFF0C\u4E14\u4F9B\u5E94\u5546\u3001\u6A21\u578B\u6216\u63A8\u7406\u5F3A\u5EA6\u4E0E\u4E3B\u52A9\u624B\u4E0D\u540C\u3002\u7528\u6237\u660E\u786E\u8981\u6C42\u76F4\u63A5\u5904\u7406\u65F6\u4F18\u5148\u670D\u4ECE\u7528\u6237\u3002",
  activeSummary: "\u5F53\u524D\u751F\u6548\uFF1A\u5185\u7F6E {builtinEnabled}/{builtinTotal} \xB7 \u81EA\u5B9A\u4E49 {customEnabled}/{customTotal} \xB7 \u5176\u4E2D {proactive} \u9879\u5141\u8BB8\u4E3B\u52A8\u63D0\u793A",
  enforceRouting: "\u4E25\u683C\u6821\u9A8C\u539F\u751F\u5B50\u667A\u80FD\u4F53",
  enforceHint: "\u62E6\u622A\u4E0D\u5339\u914D\u5F53\u524D\u6D3B\u8DC3\u7C7B\u522B\u7684\u8C03\u7528\uFF0C\u5E76\u63D0\u793A\u4E3B\u52A9\u624B\u6309\u914D\u7F6E\u91CD\u8BD5\u3002",
  guidanceToggle: "\u6CE8\u5165\u5206\u7C7B\u8DEF\u7531\u63D0\u793A\u4E0E\u9996\u6B65\u63D0\u9192",
  guidanceHint: "\u5728\u7CFB\u7EDF\u63D0\u793A\u548C\u4E3B\u52A8\u6A21\u5F0F\u9996\u6B65\u63D0\u9192\u4E2D\u5217\u51FA\u5F53\u524D\u542F\u7528\u7684\u7C7B\u522B\u8DEF\u7531\u3002",
  routingTitle: "\u6A21\u578B\u8DEF\u7531",
  defaults: "\u9ED8\u8BA4\u515C\u5E95\u6A21\u578B",
  defaultPurpose: "\u4F9B\u5DF2\u542F\u7528\u4E14\u300C\u8DDF\u968F\u9ED8\u8BA4\u300D\u7684\u4EFB\u52A1\u7C7B\u522B\u4F7F\u7528\u3002",
  presetLabel: "\u5185\u7F6E\u5FEB\u6377\u5207\u6362\uFF1A",
  presetAll: "\u5168\u90E8 {count} \u7C7B",
  presetClassic7: "\u7CBE\u7B80 7 \u7C7B",
  presetHint: "\u4EC5\u6279\u91CF\u5207\u6362\u5185\u7F6E\u7C7B\u522B\u7684\u542F\u505C\u5F00\u5173\uFF0C\u4E0D\u4F1A\u6E05\u7A7A\u5DF2\u9009\u6A21\u578B\uFF0C\u4E5F\u4E0D\u5F71\u54CD\u81EA\u5B9A\u4E49\u7C7B\u522B\u3002",
  proactive: "\u53EF\u4E3B\u52A8",
  disabledBadge: "\u5DF2\u505C\u7528",
  disabledNote: "\u5DF2\u505C\u7528 \u2014 \u4E0D\u53C2\u4E0E\u63D0\u793A\u8BCD\u3001\u4E25\u683C\u6821\u9A8C\u4E0E\u6A21\u578B\u6388\u6743\u3002",
  dormantBinding: "\u5DF2\u4FDD\u7559\u539F\u6A21\u578B\u7ED1\u5B9A\uFF1A{summary}",
  groupCount: "\u542F\u7528 {enabled}/{total}",
  groupCustomized: "\u5DF2\u81EA\u5B9A\u4E49 {count}",
  showDefaultRows: "\u8DDF\u968F\u9ED8\u8BA4\uFF08{count} \u9879\uFF09",
  useDefault: "\u8DDF\u968F\u9ED8\u8BA4",
  customized: "\u5DF2\u81EA\u5B9A\u4E49",
  reset: "\u6062\u590D\u8DDF\u968F\u9ED8\u8BA4",
  inherit: "\u7EE7\u627F\u4F1A\u8BDD\u6A21\u578B",
  enableCategory: "\u542F\u7528 {name}",
  disableCategory: "\u505C\u7528 {name}",
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
  recommendationScope: "\u63A8\u8350\u8303\u56F4",
  scopeAll: "\u5168\u90E8\u5DF2\u542F\u7528\u5185\u7F6E\u7C7B",
  recommendationHint: "\u63A8\u8350\u7248\u672C {version}\u3002\u6309\u7CBE\u786E\u76EE\u5F55 ID \u5339\u914D\u5DF2\u542F\u7528\u7684\u5185\u7F6E\u7C7B\u522B\uFF0C\u7EDD\u4E0D\u5BF9\u81EA\u5B9A\u4E49\u7C7B\u522B\u778E\u731C\u6A21\u578B\u3002",
  overwrite: "\u8986\u76D6\u5DF2\u81EA\u5B9A\u4E49\u76EE\u6807",
  previewTitle: "\u786E\u8BA4\u63A8\u8350\u914D\u7F6E\u5DEE\u5F02",
  before: "\u5F53\u524D\u914D\u7F6E\uFF1A",
  after: "\u63A8\u8350\u914D\u7F6E\uFF1A",
  previewHint: "\u786E\u8BA4\u540E\u4EC5\u66F4\u65B0\u8349\u7A3F\uFF0C\u70B9\u4FDD\u5B58\u540E\u624D\u751F\u6548\uFF1B\u4E0D\u4F1A\u4FEE\u6539\u9ED8\u8BA4\u515C\u5E95\u6A21\u578B\u548C\u81EA\u5B9A\u4E49\u7C7B\u522B\u3002",
  applyPreview: "\u5E94\u7528\u5230\u8349\u7A3F",
  cancelPreview: "\u4FDD\u7559\u5F53\u524D\u8349\u7A3F",
  noChanges: "\u5F53\u524D\u6CA1\u6709\u53EF\u5E94\u7528\u7684\u5339\u914D\u53D8\u66F4\u3002",
  preserved: "\u4FDD\u7559\u81EA\u5B9A\u4E49\uFF1A{count}",
  unmatched: "\u65E0\u5339\u914D\u5019\u9009\uFF1A{count}",
  skippedDisabled: "\u8DF3\u8FC7\u5DF2\u505C\u7528\uFF1A{count}",
  previewChanged: "\u9884\u89C8\u6253\u5F00\u540E\u8349\u7A3F\u6216 Host \u7248\u672C\u53D1\u751F\u53D8\u5316\uFF0C\u8BF7\u91CD\u65B0\u751F\u6210\u9884\u89C8\u3002",
  customTitle: "\u81EA\u5B9A\u4E49\u7C7B\u522B",
  customSubtitle: "\u6700\u591A\u6DFB\u52A0 {max} \u4E2A\u4E13\u5C5E\u4EA4\u4ED8\u7C7B\u522B\u3002\u505C\u7528\u6216\u5220\u9664\u540E\uFF0C\u5386\u53F2\u8BB0\u5F55\u4ECD\u53EF\u6B63\u5E38\u67E5\u770B\u3002",
  customEmpty: "\u8FD8\u6CA1\u6709\u81EA\u5B9A\u4E49\u7C7B\u522B\u3002\u53EF\u4EE5\u65B0\u5EFA\u7A7A\u767D\u7C7B\u522B\uFF0C\u6216\u76F4\u63A5\u4ECE\u5E38\u7528\u573A\u666F\u6A21\u677F\u8D77\u6B65\u3002",
  customAddBlank: "\u65B0\u5EFA\u7A7A\u767D\u7C7B\u522B",
  customAddTemplate: "\u4ECE\u5E38\u7528\u573A\u666F\u521B\u5EFA",
  customTemplatesTitle: "\u9009\u62E9\u4E00\u4E2A\u5E38\u7528\u573A\u666F\u6A21\u677F",
  customUseTemplate: "\u4F7F\u7528\u6B64\u6A21\u677F",
  customExample: "\u793A\u4F8B\uFF1A{text}",
  customLimitReached: "\u5DF2\u8FBE\u4E0A\u9650\uFF08{max}/{max}\uFF09\uFF0C\u5220\u9664\u65E7\u9879\u540E\u53EF\u7EE7\u7EED\u65B0\u589E\u3002",
  customEdit: "\u7F16\u8F91\u8BE6\u60C5",
  customDone: "\u6536\u8D77\u7F16\u8F91",
  customDelete: "\u5220\u9664",
  customDeleteConfirm: "\u786E\u8BA4\u5220\u9664",
  customDeleteHint: "\u5386\u53F2\u8BB0\u5F55\u4E0E\u8FD0\u884C\u4E2D\u7684\u4EFB\u52A1\u5C06\u4FDD\u7559\u3002",
  customCancelDelete: "\u53D6\u6D88",
  customName: "\u5C55\u793A\u540D\u79F0",
  customNamePlaceholder: "\u4F8B\u5982\uFF1A\u8BC1\u636E\u6838\u9A8C",
  customId: "\u7C7B\u522B ID",
  customIdHint: "\u4EE5 custom- \u5F00\u5934\u7684\u5C0F\u5199\u5B57\u6BCD\u6570\u5B57\uFF088\u201340 \u5B57\u7B26\uFF09\uFF0C\u4FDD\u5B58\u540E\u9501\u5B9A\u3002",
  customIdLocked: "\u4FDD\u5B58\u540E\u5DF2\u9501\u5B9A",
  customPurpose: "\u4EC0\u4E48\u65F6\u5019\u9009\u5B83",
  customPurposePlaceholder: "\u5F53\u8F93\u5165\u5DF2\u7ECF\u2026\u2026\uFF0C\u9700\u8981\u4EA4\u4ED8\u2026\u2026\u65F6\u4F7F\u7528",
  customAvoid: "\u4EC0\u4E48\u65F6\u5019\u522B\u9009\u5B83\uFF08\u53EF\u9009\uFF09",
  customAvoidPlaceholder: "\u5982\u679C\u53EA\u662F\u2026\u2026\uFF0C\u8BF7\u6539\u9009\u5176\u4ED6\u7C7B\u522B",
  customProactive: "\u5141\u8BB8\u53C2\u4E0E\u4E3B\u52A8\u59D4\u6D3E",
  customProactiveHint: "\u65B0\u5EFA\u81EA\u5B9A\u4E49\u7C7B\u522B\u9ED8\u8BA4\u5173\u95ED\uFF0C\u786E\u8BA4\u5206\u7C7B\u51C6\u786E\u540E\u518D\u5F00\u542F\u3002",
  advanced: "\u9AD8\u7EA7\u8BBE\u7F6E",
  historyLimit: "\u5386\u53F2\u8BB0\u5F55\u4E0A\u9650\uFF081\u20131000\uFF09",
  save: "\u4FDD\u5B58\u4FEE\u6539",
  saving: "\u4FDD\u5B58\u4E2D\u2026",
  cancel: "\u64A4\u9500\u4FEE\u6539",
  reload: "\u91CD\u65B0\u8BFB\u53D6 Host \u914D\u7F6E",
  saved: "\u5DF2\u4FDD\u5B58",
  dirty: "\u6709\u672A\u4FDD\u5B58\u4FEE\u6539",
  current: "\u5DF2\u540C\u6B65",
  needsGrant: "\u9700\u8981\u8865\u9F50\u6A21\u578B\u6388\u6743",
  stale: "\u7F16\u8F91\u671F\u95F4 Host \u914D\u7F6E\u5DF2\u66F4\u65B0\u3002\u8349\u7A3F\u5DF2\u4FDD\u7559\uFF0C\u8BF7\u91CD\u65B0\u8BFB\u53D6\u540E\u518D\u4FDD\u5B58\u3002",
  refused: "Host \u62D2\u7EDD\u4E86\u672C\u6B21\u4FDD\u5B58\uFF0C\u8349\u7A3F\u5DF2\u4FDD\u7559\uFF1B\u6CA1\u6709\u5C1D\u8BD5\u81EA\u52A8\u8986\u76D6\u5176\u4ED6\u4FEE\u6539\u3002",
  grantFailed: "\u8DEF\u7531\u914D\u7F6E\u5DF2\u4FDD\u5B58\uFF0C\u4F46\u672A\u80FD\u786E\u8BA4\u6A21\u578B\u6388\u6743\u3002\u8BF7\u518D\u6B21\u70B9\u51FB\u4FDD\u5B58\u91CD\u8BD5\u3002",
  validationError: "\u914D\u7F6E\u4E0D\u5408\u6CD5\uFF1A{message}",
  transportError: "\u4FDD\u5B58\u5931\u8D25\uFF1A{message}\u3002\u8349\u7A3F\u5DF2\u4FDD\u7559\u3002",
  required: "\u6B64\u9879\u4E0D\u80FD\u4E3A\u7A7A\u3002",
  history: "\u8BF7\u8F93\u5165 1 \u81F3 1000 \u4E4B\u95F4\u7684\u6574\u6570\u3002",
  catalog: "\u4F9B\u5E94\u5546\u3001\u6A21\u578B\u6216\u63A8\u7406\u5F3A\u5EA6\u4E0D\u5728\u5F53\u524D\u5B9E\u65F6\u76EE\u5F55\u4E2D\u3002",
  catalogRequired: "\u5DF2\u542F\u7528\u7684\u663E\u5F0F\u6A21\u578B\u9700\u8981\u5F53\u524D\u6709\u6548\u76EE\u5F55\uFF1B\u7EE7\u627F\u6A21\u578B\u4E0D\u4F9D\u8D56\u76EE\u5F55\u8BFB\u53D6\u6210\u529F\u3002",
  structure: "\u8DEF\u7531\u914D\u7F6E\u7ED3\u6784\u4E0D\u5408\u6CD5\u3002",
  customIdError: "ID \u987B\u4E3A 8\u201340 \u4F4D\u5C0F\u5199\u5B57\u6BCD/\u6570\u5B57/\u8FDE\u5B57\u7B26\uFF0C\u4E14\u4EE5 custom- \u5F00\u5934\u3002",
  customDuplicate: "\u8BE5\u81EA\u5B9A\u4E49\u7C7B\u522B ID \u5DF2\u5B58\u5728\u3002",
  customLimit: "\u6700\u591A\u53EA\u80FD\u6DFB\u52A0 8 \u4E2A\u81EA\u5B9A\u4E49\u7C7B\u522B\u3002",
  textError: "\u8BF7\u586B\u5199\u7B26\u5408\u957F\u5EA6\u9650\u5236\u7684\u5355\u884C\u6587\u672C\uFF08\u4E0D\u80FD\u542B\u6362\u884C\u6216\u63A7\u5236\u5B57\u7B26\uFF09\u3002",
  fieldId: "ID",
  fieldName: "\u540D\u79F0",
  fieldPurpose: "\u9002\u7528\u8BF4\u660E",
  fieldAvoid: "\u6392\u9664\u8BF4\u660E"
};

// src/ui/settings-styles.tsx
var React6 = require("react");
var import_jsx_runtime6 = require("react/jsx-runtime");
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
.dtr-editor button.dtr-danger-button { color: var(--dtr-error); border-color: color-mix(in srgb, var(--dtr-error) 40%, var(--dtr-border)); background: transparent; }
.dtr-editor button.dtr-danger-button:hover:not(:disabled) { background-color: color-mix(in srgb, var(--dtr-error) 10%, var(--dtr-base)); }
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
.dtr-summary-bar { display: flex; gap: 8px; align-items: center; padding: 8px 12px; border-radius: 10px; background: var(--dtr-subtle); font-size: 13px; color: var(--dtr-ink); }
.dtr-scope { display: flex; gap: 8px; align-items: start; padding-inline: 2px; }
.dtr-scope svg { margin-block-start: 2px; }
.dtr-toggle-row { display: flex; gap: 12px; align-items: center; justify-content: space-between; padding: 11px 14px; }
.dtr-toggle-row strong { display: block; margin-block-end: 2px; font-weight: 650; }
.dtr-editor .dtr-switch { position: relative; flex: none; inline-size: 42px; block-size: 24px; min-block-size: 0; padding: 0; border-radius: 999px; border-color: var(--dtr-outline); background-color: var(--dtr-subtle); }
.dtr-editor .dtr-switch::after { content: ''; position: absolute; inset-block-start: 3px; inset-inline-start: 3px; inline-size: 16px; block-size: 16px; border-radius: 50%; background: var(--dtr-muted); transition: transform 140ms ease, background-color 140ms ease; }
.dtr-editor .dtr-switch[aria-checked=true], .dtr-editor .dtr-switch[aria-checked=true]:hover:not(:disabled) { border-color: var(--dtr-brand); background-color: var(--dtr-brand); }
.dtr-editor .dtr-switch[aria-checked=true]::after { transform: translateX(18px); background: var(--dtr-on-brand); }
.dtr-editor .dtr-switch[aria-checked=true]:dir(rtl)::after { transform: translateX(-18px); }
.dtr-editor .dtr-switch-sm { inline-size: 34px; block-size: 20px; }
.dtr-editor .dtr-switch-sm::after { inset-block-start: 2px; inset-inline-start: 2px; inline-size: 14px; block-size: 14px; }
.dtr-editor .dtr-switch-sm[aria-checked=true]::after { transform: translateX(14px); }
.dtr-editor .dtr-switch-sm[aria-checked=true]:dir(rtl)::after { transform: translateX(-14px); }

.dtr-toolbar { justify-content: space-between; align-items: center; gap: 8px 14px; }
.dtr-preset-bar { gap: 6px 8px; }
.dtr-toolset { gap: 8px 10px; }
.dtr-editor .dtr-scope-select { inline-size: auto; max-inline-size: 14rem; }
.dtr-check { cursor: pointer; gap: 6px; }
.dtr-check input { accent-color: var(--dtr-brand); margin: 0; }
.dtr-catalog-status { padding: 8px 10px; overflow-wrap: anywhere; }
.dtr-catalog-status p { flex: 1 1 10rem; }
.dtr-groups-stack { display: grid; gap: 18px; }
.dtr-group { display: grid; gap: 8px; }
.dtr-group-heading { gap: 6px 8px; padding: 0 2px; }
.dtr-pill { display: inline-block; font-size: 11px; line-height: 1.4; color: var(--dtr-muted); border-radius: 999px; background: var(--dtr-subtle); padding: 2px 7px; }
.dtr-pill-brand { color: var(--dtr-ink); background: var(--dtr-tint); }
.dtr-pill-accent { color: var(--dtr-accent); background: color-mix(in srgb, var(--dtr-accent) 12%, transparent); }
.dtr-pill-muted { color: var(--dtr-muted); background: var(--dtr-subtle); }
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
.dtr-route-disabled { opacity: .78; border-style: dashed; background: var(--dtr-base); }
.dtr-dormant-note { font-size: 12px; }
.dtr-route-title { gap: 5px 7px; }
.dtr-route-id { color: var(--dtr-muted); font-size: 11px; padding-inline: 3px; overflow-wrap: anywhere; }
.dtr-route-purpose { color: var(--dtr-muted); font-size: 12px; overflow-wrap: anywhere; }
.dtr-controls { display: flex; flex-wrap: wrap; align-items: end; justify-content: flex-end; gap: 8px; min-inline-size: 0; }
.dtr-controls .dtr-picker { flex: 1 1 8rem; }
.dtr-effort { flex: 0 1 8rem; }
.dtr-route .dtr-warning { grid-column: 1 / -1; }
.dtr-editor .dtr-icon-button { display: grid; place-items: center; inline-size: 34px; padding: 0; color: var(--dtr-muted); background: transparent; }

.dtr-default-collapse { border: 1px dashed var(--dtr-border); border-radius: 10px; background: color-mix(in srgb, var(--dtr-surface) 55%, var(--dtr-base)); }
.dtr-default-collapse summary { padding: 8px 12px; font-size: 13px; color: var(--dtr-muted); border-radius: 10px; }
.dtr-collapse-body { padding: 0 8px 8px; }

.dtr-custom-section { margin-block-start: 4px; }
.dtr-custom-header { justify-content: space-between; }
.dtr-template-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.dtr-template-card { display: grid; gap: 10px; align-content: space-between; padding: 12px; background: var(--dtr-base); }
.dtr-custom-form { grid-column: 1 / -1; display: grid; gap: 10px; padding-block-start: 10px; border-block-start: 1px solid var(--dtr-border); }
.dtr-custom-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.dtr-custom-proactive { padding: 8px 10px; border-radius: 8px; background: var(--dtr-subtle); }
.dtr-custom-confirm { grid-column: 1 / -1; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; border: 1px solid color-mix(in srgb, var(--dtr-warn) 45%, var(--dtr-border)); background: color-mix(in srgb, var(--dtr-warn) 8%, var(--dtr-surface)); font-size: 13px; }

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
.dtr-advanced-body .dtr-toggle-row { padding: 0; }
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
.dtr-status:is([data-status=dirty], [data-status=needsGrant])::before { background: var(--dtr-warn); }
.dtr-status[data-status=saved]::before { background: var(--dtr-success); }

@container dtr-editor (max-width: 38rem) {
  .dtr-mode-grid, .dtr-route, .dtr-template-grid, .dtr-custom-form-grid { grid-template-columns: minmax(0, 1fr); }
  .dtr-editor .dtr-mode { grid-template-columns: auto minmax(0, 1fr) auto; column-gap: 9px; }
  .dtr-mode-icon { grid-area: 1 / 1; }
  .dtr-mode-title { grid-area: 1 / 2; }
  .dtr-mode-check { grid-area: 1 / 3; }
  .dtr-mode-copy { grid-column: 2 / -1; }
  .dtr-controls { justify-content: flex-start; }
}
@media (prefers-reduced-motion: reduce) {
  .dtr-editor *, .dtr-editor *::after { transition: none !important; }
}
`;
var editorStyles = /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("style", { children: CSS });

// src/ui/client.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
var DELEGATION_COPY = {
  passive: { label: "delegationPassive", note: "delegationPassiveNote" },
  "specialist-first": { label: "delegationSpecialistFirst", note: "delegationSpecialistNote" },
  orchestrator: { label: "delegationOrchestrator", note: "delegationOrchestratorNote" }
};
var GROUP_ORDER = ["implementation", "quality", "analysis", "general"];
var GROUP_ENTRIES = {
  implementation: BUILTIN_LIST.filter((entry) => entry.group === "implementation"),
  quality: BUILTIN_LIST.filter((entry) => entry.group === "quality"),
  analysis: BUILTIN_LIST.filter((entry) => entry.group === "analysis"),
  general: BUILTIN_LIST.filter((entry) => entry.group === "general")
};
function fieldLabel(t, field) {
  switch (field) {
    case "id":
      return t("fieldId");
    case "name":
      return t("fieldName");
    case "purpose":
      return t("fieldPurpose");
    case "avoid":
      return t("fieldAvoid");
    case "provider":
      return t("provider");
    case "model":
      return t("model");
    case "effort":
      return t("effort");
    case "historyLimit":
      return t("historyLimit");
  }
}
function reasonLabel(t, reason) {
  switch (reason) {
    case "customId":
      return t("customIdError");
    case "customDuplicate":
      return t("customDuplicate");
    case "customLimit":
      return t("customLimit");
    case "text":
      return t("textError");
    case "required":
      return t("required");
    case "history":
      return t("history");
    case "catalog":
      return t("catalog");
    case "catalogRequired":
      return t("catalogRequired");
    case "structure":
      return t("structure");
  }
}
function DelegationSettings({ t, id, mode, strict, summary, onMode, onToggleStrict }) {
  const scope = mode !== "passive";
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("section", { className: "dtr-section", "aria-labelledby": `${id}-title`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { id: `${id}-title`, children: t("behaviorTitle") }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { id: `${id}-mode`, className: "dtr-sr-only", children: t("delegationMode") }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { role: "radiogroup", "aria-labelledby": `${id}-mode`, "aria-describedby": scope ? `${id}-scope` : void 0, className: "dtr-mode-grid", onKeyDown: (event) => {
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
      return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("button", { type: "button", role: "radio", "aria-checked": active, "aria-labelledby": label, "aria-describedby": `${label}-note`, tabIndex: active ? 0 : -1, className: "dtr-mode", onClick: () => {
        if (!active) onMode(option);
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "dtr-mode-icon", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Icon, { name: option }) }),
        active && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "dtr-mode-check", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Icon, { name: "check" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "dtr-mode-title", id: label, children: t(DELEGATION_COPY[option].label) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "dtr-mode-copy", id: `${label}-note`, children: t(DELEGATION_COPY[option].note) })
      ] }, option);
    }) }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("p", { className: "dtr-summary-bar", role: "status", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Icon, { name: "info" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: summary })
    ] }),
    scope && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("p", { className: "dtr-muted dtr-scope", id: `${id}-scope`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Icon, { name: "info" }),
      t("delegationScope")
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "dtr-card dtr-toggle-row", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("strong", { id: `${id}-switch`, children: t("enforceRouting") }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { id: `${id}-switch-hint`, className: "dtr-muted", children: t("enforceHint") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", role: "switch", "aria-checked": strict, "aria-labelledby": `${id}-switch`, "aria-describedby": `${id}-switch-hint`, className: "dtr-switch", onClick: onToggleStrict })
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
    return row && Number.isSafeInteger(row.revision) && typeof v?.enabled === "boolean" && Array.isArray(v.allowedModels) && reply.value.writable ? "available" : "unchanged";
  };
  const readGrants = () => grants.getSnapshot();
  const subscribeGrants = (listener) => grants.subscribe(listener);
  const readForm = () => form.getSnapshot();
  const subscribeForm = (listener) => form.subscribe(listener);
  function Editor({ t: t2 }) {
    const [editor, setEditor] = React7.useState();
    React7.useLayoutEffect(() => {
      const mounted = new RoutingEditor(form, grants);
      setEditor(mounted);
      return () => mounted.dispose();
    }, []);
    return editor ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(EditorForm, { t: t2, editor }) : null;
  }
  function EditorForm({ t: t2, editor }) {
    const host = React7.useSyncExternalStore(subscribeForm, readForm);
    const grantSnapshot = React7.useSyncExternalStore(subscribeGrants, readGrants);
    const state = React7.useSyncExternalStore(editor.subscribe, editor.getSnapshot);
    const [catalog, setCatalog] = React7.useState();
    const [catalogBusy, setCatalogBusy] = React7.useState(true);
    const [catalogError, setCatalogError] = React7.useState();
    const [retry, setRetry] = React7.useState(0);
    const [overwrite, setOverwrite] = React7.useState(false);
    const [scope, setScope] = React7.useState("all");
    const [preview, setPreview] = React7.useState();
    const [previewError, setPreviewError] = React7.useState();
    const [focus, setFocus] = React7.useState();
    const fields = React7.useRef(/* @__PURE__ */ new Map());
    const issueSummary = React7.useRef(null);
    const previewButton = React7.useRef(null);
    const restorePreviewFocus = React7.useRef(false);
    const instance = React7.useId();
    const locale = t2("language") === "zh" ? "zh" : "en";
    const draft = state.draft;
    const grantPlan = React7.useMemo(() => {
      if (!draft) return void 0;
      try {
        return planModelGrant(requiredModelRoutes(routingDraftToConfig(draft)), grantSnapshot);
      } catch {
        return void 0;
      }
    }, [draft, grantSnapshot]);
    const needsGrant = grantPlan !== void 0 && grantPlan.kind !== "complete";
    const grantProblem = grantPlan?.kind === "unavailable" ? grantPlan.reason : grantPlan?.kind === "readOnly" ? "readOnly" : void 0;
    const navigation = grantProblem ? client.get("pluginNavigation") : void 0;
    const openBundle = React7.useCallback((name) => navigation?.openBundle(name), [navigation]);
    const hostDisabled = state.saving || host.status !== "ready" || !host.writable;
    const disabled = hostDisabled || preview !== void 0;
    const catalogReady = catalog !== void 0 && !catalogBusy && catalogError === void 0;
    const catalogIndex = React7.useMemo(() => indexCatalog(catalog), [catalog]);
    const catalogStatus = catalogBusy ? t2("catalogLoading") : catalogError === void 0 ? void 0 : t2("catalogError", { message: catalogError });
    const defaultSummary = draft && targetSummary(t2, draft.defaultTarget, catalogIndex, catalogReady);
    const activeSummaryText = React7.useMemo(() => {
      if (!draft) return "";
      try {
        const registry = resolveActiveRegistry(routingDraftToConfig(draft));
        const builtinEnabled = registry.entries.filter((entry) => entry.origin === "builtin").length;
        const customEnabled = registry.entries.filter((entry) => entry.origin === "custom").length;
        const proactive = registry.entries.filter((entry) => entry.proactive).length;
        return t2("activeSummary", {
          builtinEnabled,
          builtinTotal: BUILTIN_IDS.length,
          customEnabled,
          customTotal: draft.custom.length,
          proactive
        });
      } catch {
        const builtinEnabled = BUILTIN_IDS.filter((id) => draft.builtins[id].enabled).length;
        const customEnabled = draft.custom.filter((entry) => entry.enabled).length;
        const proactive = BUILTIN_IDS.filter((id) => draft.builtins[id].enabled && BUILTINS[id].proactive).length + draft.custom.filter((entry) => entry.enabled && entry.proactive).length;
        return t2("activeSummary", {
          builtinEnabled,
          builtinTotal: BUILTIN_IDS.length,
          customEnabled,
          customTotal: draft.custom.length,
          proactive
        });
      }
    }, [draft, t2]);
    React7.useEffect(() => {
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
    React7.useLayoutEffect(() => {
      if (!focus) return;
      const field = fields.current.get(focus);
      const target2 = field && !field.matches(":disabled") ? field : issueSummary.current;
      if (target2) {
        let details = target2.closest("details");
        while (details) {
          details.open = true;
          details = details.parentElement?.closest("details") ?? null;
        }
        target2.scrollIntoView({ block: "nearest" });
        target2.focus({ preventScroll: true });
      }
      setFocus(void 0);
    }, [focus, state.issue, draft]);
    React7.useLayoutEffect(() => {
      if (!preview && restorePreviewFocus.current) {
        restorePreviewFocus.current = false;
        if (previewButton.current?.matches(":enabled")) previewButton.current.focus({ preventScroll: true });
      }
    }, [preview]);
    const registerField = React7.useCallback((section, field, node) => {
      const key2 = fieldKey(section, field);
      if (node) fields.current.set(key2, node);
      else fields.current.delete(key2);
    }, []);
    const registerHistory = React7.useCallback((node) => registerField("default", "historyLimit", node), [registerField]);
    const revision = state.revision;
    const chooseModel = React7.useCallback((section, choice) => {
      if (choice.mode === "default") {
        if (section !== "default") editor.setCategoryMode(section, "default", revision);
      } else if (choice.mode === "inherit") {
        editor.setNativeModelMode(section, "inherit", revision);
      } else {
        editor.setNativeModelMode(section, "explicit", revision, { provider: choice.provider, model: choice.id });
      }
    }, [editor, revision]);
    const chooseEffort = React7.useCallback((section, provider, model, effort) => {
      editor.setSectionEffort(section, provider, model, effort, revision);
    }, [editor, revision]);
    const toggleBuiltin = React7.useCallback((id, enabled) => {
      editor.setBuiltinEnabled(id, enabled, revision);
    }, [editor, revision]);
    const applyPreset = React7.useCallback((preset) => {
      editor.applyBuiltinPreset(preset, revision);
    }, [editor, revision]);
    const addCustom = React7.useCallback((seed) => editor.addCustomCategory(seed, revision), [editor, revision]);
    const updateCustom = React7.useCallback(
      (id, patch) => {
        editor.updateCustomCategory(id, patch, revision);
      },
      [editor, revision]
    );
    const removeCustom = React7.useCallback((id) => editor.removeCustomCategory(id, revision), [editor, revision]);
    const save = () => {
      void editor.save({ ...catalog === void 0 ? {} : { catalog }, catalogReady }).then(() => {
        const issue = editor.getSnapshot().issue;
        if (issue) setFocus(fieldKey(issue.section, issue.field));
      });
    };
    const makePreview = () => {
      if (!draft || !catalog || !catalogReady) return;
      try {
        setPreview({
          value: previewRecommendations(routingDraftToConfig(draft), catalog, {
            overwrite,
            ...scope === "all" ? {} : { group: scope }
          }),
          revision
        });
        setPreviewError(void 0);
      } catch (error) {
        setPreviewError(error instanceof Error ? error.message : String(error));
      }
    };
    const closePreview = () => {
      restorePreviewFocus.current = true;
      setPreview(void 0);
    };
    const previewStale = preview !== void 0 && (preview.revision !== host.revision || preview.revision !== revision);
    const status = needsGrant ? "needsGrant" : state.dirty ? "dirty" : state.notice ?? "current";
    const historyInvalid = state.issue?.section === "default" && state.issue.field === "historyLimit";
    const catalogPartial = catalog?.failures.length ? t2("catalogPartial", { message: catalog.failures.map((failure) => `${failure.name}: ${failure.message}`).join("; ") }) : void 0;
    const issueSectionName = (section) => {
      if (section === "default") return t2("defaults");
      if (isBuiltinId(section)) return BUILTINS[section][locale].name;
      return draft?.custom.find((entry) => entry.id === section)?.name || section;
    };
    const defaultExplicit = draft?.defaultTarget.mode === "explicit" ? draft.defaultTarget : void 0;
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "dtr-editor", "aria-busy": state.saving, children: [
      editorStyles,
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("header", { className: "dtr-header", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { children: t2("title") }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "dtr-muted", children: t2("description") }),
        host.status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { role: "status", className: "dtr-muted", children: t2("loading") }),
        host.status === "unavailable" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { role: "status", className: "dtr-muted", children: t2("unavailable") }),
        host.status === "ready" && !host.writable && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "dtr-muted dtr-warning", role: "status", children: t2("readOnly") })
      ] }),
      draft && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(import_jsx_runtime7.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("fieldset", { disabled, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          DelegationSettings,
          {
            t: t2,
            id: `dtr-${instance}-behavior`,
            mode: draft.behavior.delegationMode,
            strict: draft.behavior.strict,
            summary: activeSummaryText,
            onMode: (delegationMode) => editor.editBehavior({ delegationMode }, revision),
            onToggleStrict: () => editor.editBehavior({ strict: !draft.behavior.strict }, revision)
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("section", { className: "dtr-section", "aria-labelledby": `dtr-${instance}-routing`, children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { id: `dtr-${instance}-routing`, children: t2("routingTitle") }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("fieldset", { disabled, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            RouteRow,
            {
              t: t2,
              section: "default",
              name: t2("defaults"),
              purpose: t2("defaultPurpose"),
              instance,
              catalog: catalogIndex,
              catalogReady,
              catalogStatus,
              provider: defaultExplicit?.provider,
              model: defaultExplicit?.model,
              effort: defaultExplicit?.reasoningEffort,
              followsDefault: false,
              defaultSummary: void 0,
              disabled,
              issueField: state.issue?.section === "default" ? state.issue.field : void 0,
              registerField,
              onModel: chooseModel,
              onEffort: chooseEffort
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("fieldset", { disabled, children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "dtr-inline dtr-toolbar", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "dtr-inline dtr-preset-bar", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "dtr-muted", children: t2("presetLabel") }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", onClick: () => applyPreset("all"), children: t2("presetAll", { count: BUILTIN_IDS.length }) }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", onClick: () => applyPreset("classic7"), children: t2("presetClassic7") })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "dtr-inline dtr-toolset", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
                  "select",
                  {
                    "aria-label": t2("recommendationScope"),
                    className: "dtr-scope-select",
                    value: scope,
                    onChange: (event) => setScope(event.currentTarget.value),
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("option", { value: "all", children: t2("scopeAll") }),
                      GROUP_ORDER.map((groupId) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("option", { value: groupId, children: BUILTIN_GROUPS[groupId][locale] }, groupId))
                    ]
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "button",
                  {
                    type: "button",
                    ref: previewButton,
                    disabled: !catalogReady || state.stale,
                    onClick: makePreview,
                    "aria-describedby": `dtr-${instance}-recommendation-help`,
                    children: t2("recommendations")
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { id: `dtr-${instance}-recommendation-help`, className: "dtr-sr-only", children: t2("recommendationHint", { version: RECOMMENDATION_VERSION }) }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("label", { className: "dtr-inline dtr-check dtr-muted", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("input", { type: "checkbox", checked: overwrite, onChange: (event) => setOverwrite(event.currentTarget.checked) }),
                  t2("overwrite")
                ] })
              ] }),
              (catalogBusy || catalogError !== void 0 || catalogPartial) && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "dtr-inline dtr-catalog-status", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: `dtr-muted${catalogBusy ? "" : " dtr-warning"}`, role: "status", children: catalogStatus ?? catalogPartial }),
                !catalogBusy && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", onClick: () => setRetry((value) => value + 1), children: t2("retry") })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "dtr-muted", children: t2("presetHint") })
          ] }),
          preview && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("section", { className: "dtr-card dtr-note", "aria-labelledby": `dtr-${instance}-preview-title`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h4", { id: `dtr-${instance}-preview-title`, children: t2("previewTitle") }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "dtr-muted", children: t2("previewHint") }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "dtr-muted", children: t2("recommendationHint", { version: RECOMMENDATION_VERSION }) }),
            preview.value.changes.length ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("ul", { className: "dtr-preview-list", children: preview.value.changes.map((change) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("li", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("strong", { children: BUILTINS[change.category][locale].name }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "dtr-inline dtr-diff", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "dtr-pill", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "dtr-sr-only", children: [
                    t2("before"),
                    " "
                  ] }),
                  change.before.mode === "default" ? `${t2("useDefault")} \xB7 ${defaultSummary}` : previewTarget(change.before, t2)
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Icon, { name: "arrow" }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "dtr-pill dtr-pill-brand", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "dtr-sr-only", children: [
                    t2("after"),
                    " "
                  ] }),
                  previewTarget(change.after, t2)
                ] })
              ] })
            ] }, change.category)) }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { children: t2("noChanges") }),
            previewStale && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "dtr-muted dtr-warning", role: "status", children: t2("previewChanged") }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("p", { className: "dtr-muted", children: [
              t2("preserved", { count: preview.value.preserved.length }),
              " \xB7 ",
              t2("unmatched", { count: preview.value.unavailable.length }),
              " \xB7 ",
              t2("skippedDisabled", { count: preview.value.skippedDisabled.length })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "dtr-inline", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", autoFocus: true, onClick: closePreview, children: t2("cancelPreview") }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "button",
                {
                  type: "button",
                  className: "dtr-primary",
                  disabled: hostDisabled || state.stale || preview.value.changes.length === 0 || previewStale,
                  onClick: () => {
                    if (editor.applyRecommendations(preview.value, preview.revision)) closePreview();
                  },
                  children: t2("applyPreview")
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("fieldset", { disabled, children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "dtr-groups-stack", children: [
            GROUP_ORDER.map((groupId) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              CategoryGroup,
              {
                t: t2,
                locale,
                groupId,
                entries: GROUP_ENTRIES[groupId],
                draftBuiltins: draft.builtins,
                instance,
                catalog: catalogIndex,
                catalogReady,
                catalogStatus,
                defaultSummary,
                disabled,
                issue: state.issue,
                registerField,
                onToggleEnabled: toggleBuiltin,
                onModel: chooseModel,
                onEffort: chooseEffort
              },
              groupId
            )),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              CustomCategoryEditor,
              {
                t: t2,
                locale,
                custom: draft.custom,
                instance,
                catalog: catalogIndex,
                catalogReady,
                catalogStatus,
                defaultSummary,
                disabled,
                issue: state.issue,
                registerField,
                onAdd: addCustom,
                onUpdate: updateCustom,
                onRemove: removeCustom,
                onModel: chooseModel,
                onEffort: chooseEffort
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("details", { className: "dtr-section dtr-card dtr-advanced", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("summary", { children: t2("advanced") }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "dtr-advanced-body", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "dtr-toggle-row", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("strong", { id: `dtr-${instance}-guidance`, children: t2("guidanceToggle") }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { id: `dtr-${instance}-guidance-hint`, className: "dtr-muted", children: t2("guidanceHint") })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "button",
                {
                  type: "button",
                  role: "switch",
                  "aria-checked": draft.behavior.guidance,
                  "aria-labelledby": `dtr-${instance}-guidance`,
                  "aria-describedby": `dtr-${instance}-guidance-hint`,
                  className: "dtr-switch",
                  disabled,
                  onClick: () => editor.editBehavior({ guidance: !draft.behavior.guidance }, revision)
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("label", { className: "dtr-field dtr-history", children: [
              t2("historyLimit"),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
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
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "dtr-feedback", "aria-live": "polite", children: [
        state.stale && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "dtr-muted dtr-warning", children: t2("stale") }),
        state.issue && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("p", { ref: issueSummary, tabIndex: -1, id: `dtr-${instance}-issue`, role: "alert", className: "dtr-error", children: [
          issueSectionName(state.issue.section),
          " \xB7 ",
          fieldLabel(t2, state.issue.field),
          ": ",
          state.issue.detail ?? reasonLabel(t2, state.issue.reason)
        ] }),
        previewError && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { role: "alert", className: "dtr-error", children: t2("validationError", { message: previewError }) }),
        grantProblem && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(GrantDiagnostics, { id: `dtr-${instance}-grants`, problem: grantProblem, locale, inventory, recheck, dirty: state.dirty, openBundle: navigation ? openBundle : void 0 }, grantProblem),
        state.error && state.error.kind !== "grantUnavailable" && state.error.kind !== "grantReadOnly" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { role: "alert", className: "dtr-error", children: state.error.kind === "grantFailed" ? t2("grantFailed") : state.error.kind === "refused" ? t2("refused") : state.error.kind === "previewChanged" ? t2("previewChanged") : t2(state.error.kind === "validation" ? "validationError" : "transportError", { message: state.error.detail }) })
      ] }),
      draft && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("footer", { className: "dtr-footer", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "dtr-status dtr-muted", "data-status": status, role: "status", children: t2(status) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "dtr-inline dtr-footer-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "button",
            {
              type: "button",
              disabled: state.saving || preview !== void 0 || !state.dirty && !state.stale,
              onClick: () => {
                setPreviewError(void 0);
                editor.discard();
              },
              children: t2(state.stale ? "reload" : "cancel")
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
            "button",
            {
              type: "button",
              className: "dtr-primary",
              disabled: disabled || !!grantProblem || !state.dirty && !needsGrant || state.stale,
              onClick: save,
              children: t2(state.saving ? "saving" : "save")
            }
          )
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
  if (target2.mode === "inherit") return t("inherit");
  return `${target2.provider} / ${target2.model}${target2.reasoningEffort ? ` \xB7 ${t("effort")}: ${target2.reasoningEffort}` : ""}`;
}
;return module.exports;}});
//# sourceMappingURL=client.js.map
