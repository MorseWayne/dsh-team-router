// Cordis plugin entry. Keep this file a thin re-export: host-specific wiring lives
// in adapter/dsh, host-agnostic routing in core, settings UI in ui.
export * from './adapter/dsh/runtime.ts';
export { DELEGATION_MODES, isDelegationMode } from './core/native-subagent.ts';
export type { DelegationMode } from './core/native-subagent.ts';
