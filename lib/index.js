// Cordis plugin entry. Keep this file a thin re-export: host-specific wiring lives
// in adapter/dsh, host-agnostic routing in core, settings UI in ui.
export * from "./adapter/dsh/runtime.js";
export { DELEGATION_MODES, isDelegationMode } from "./core/native-subagent.js";
//# sourceMappingURL=index.js.map