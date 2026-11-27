import * as React from 'react';

const CSS = `
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

export const editorStyles = <style>{CSS}</style>;
