import * as React from 'react';
import type { Binding, Target } from '../core/routing-policy.ts';
import type { CatalogIndex } from './catalog-index.ts';
import { Icon, ModelPicker, type ModelChoice } from './ModelPicker.tsx';
import type { RoutingField, RoutingSection } from './routing-editor.ts';
import type { Translate } from './settings-copy.ts';

export type FieldNode = HTMLInputElement | HTMLSelectElement | HTMLButtonElement;
export const fieldKey = (section: RoutingSection, field: RoutingField) => `${section}:${field}`;
export type RegisterField = (section: RoutingSection, field: RoutingField, node: FieldNode | null) => void;
const NO_EFFORTS: readonly { id: string; name: string }[] = [];

interface Display { label: string; detail?: string }
function nativeDisplay(t: Translate, catalog: CatalogIndex, catalogReady: boolean, provider?: string, id?: string): Display {
  if (id === undefined) return { label: t('inherit') };
  if (!id) return { label: t('chooseModel') };
  const group = provider ? catalog.get(provider) : undefined;
  const model = group?.models.get(id)?.model;
  if (model && group && !group.failed) return { label: model.name, detail: group.duplicateNames.has(model.name) ? `${group.name} · ${model.id}` : group.name };
  return { label: catalogReady ? t('unavailableOption', { name: id }) : id, ...(provider ? { detail: group?.name ?? provider } : {}) };
}

export function targetSummary(t: Translate, target: Target, catalog: CatalogIndex, catalogReady: boolean): string {
  const explicit = target.mode === 'explicit' ? target : undefined;
  const display = nativeDisplay(t, catalog, catalogReady, explicit?.provider, explicit?.model);
  const base = display.detail ? `${display.label} · ${display.detail}` : display.label;
  return explicit?.reasoningEffort ? `${base} · ${explicit.reasoningEffort}` : base;
}

export function bindingSummary(t: Translate, binding: Binding, catalog: CatalogIndex, catalogReady: boolean): string {
  return binding.mode === 'default' ? t('useDefault') : targetSummary(t, binding, catalog, catalogReady);
}

interface Props {
  t: Translate;
  section: RoutingSection;
  name: string;
  purpose: string;
  instance: string;
  catalog: CatalogIndex;
  catalogReady: boolean;
  catalogStatus: string | undefined;
  provider: string | undefined;
  model: string | undefined;
  effort: string | undefined;
  followsDefault: boolean;
  defaultSummary: string | undefined;
  enabled?: boolean;
  proactive?: boolean;
  disabled: boolean;
  issueField: RoutingField | undefined;
  registerField: RegisterField;
  onToggleEnabled?: (section: RoutingSection, next: boolean) => void;
  onModel(section: RoutingSection, choice: ModelChoice): void;
  onEffort(section: RoutingSection, provider: string, model: string, effort: string): void;
  extraActions?: React.ReactNode;
  children?: React.ReactNode;
}

export const RouteRow = React.memo(function RouteRow({
  t, section, name, purpose, instance, catalog, catalogReady, catalogStatus,
  provider, model, effort, followsDefault, defaultSummary, enabled = true, proactive = false,
  disabled, issueField, registerField, onToggleEnabled, onModel, onEffort, extraActions, children,
}: Props) {
  const baseId = `dtr-${instance}-${section}`;
  const titleId = `${baseId}-title`;
  const issueId = `dtr-${instance}-issue`;
  const isCategory = section !== 'default';
  const customized = isCategory && !followsDefault;
  const mode = followsDefault ? 'default' : model === undefined ? 'inherit' : 'explicit';
  const display = followsDefault ? { label: t('useDefault'), detail: defaultSummary } : nativeDisplay(t, catalog, catalogReady, provider, model);
  const group = provider ? catalog.get(provider) : undefined;
  const catalogModel = model ? group?.models.get(model)?.model : undefined;
  const efforts = catalogModel?.reasoning?.efforts ?? NO_EFFORTS;
  const showEffort = enabled && !followsDefault && provider !== undefined && model !== undefined && (efforts.length > 0 || effort !== undefined);
  const pickerButton = React.useRef<HTMLButtonElement | null>(null);
  const registerModel = React.useCallback((node: HTMLButtonElement | null) => {
    pickerButton.current = node;
    registerField(section, 'model', node);
    registerField(section, 'provider', node);
  }, [registerField, section]);
  const registerEffort = React.useCallback((node: HTMLSelectElement | null) => registerField(section, 'effort', node), [registerField, section]);
  const chooseModel = React.useCallback((choice: ModelChoice) => onModel(section, choice), [onModel, section]);
  const dormantSummary = !enabled && customized
    ? (model === undefined ? t('inherit') : `${display.label}${display.detail ? ` · ${display.detail}` : ''}${effort ? ` · ${effort}` : ''}`)
    : undefined;

  return <div className={`dtr-card dtr-route${section === 'default' ? ' dtr-route-default' : ''}${!enabled ? ' dtr-route-disabled' : ''}`} role="group" aria-labelledby={titleId}>
    <div className="dtr-stack">
      <div className="dtr-inline dtr-route-title">
        {isCategory && onToggleEnabled && <button
          type="button" role="switch" aria-checked={enabled}
          aria-label={t(enabled ? 'disableCategory' : 'enableCategory', { name })}
          className="dtr-switch dtr-switch-sm" disabled={disabled}
          onClick={() => onToggleEnabled(section, !enabled)}
        />}
        <h4 id={titleId}>{name || section}</h4>
        {isCategory && <code className="dtr-route-id">{section}</code>}
        {isCategory && enabled && <span className={`dtr-pill${customized ? ' dtr-pill-brand' : ''}`}>{t(customized ? 'customized' : 'useDefault')}</span>}
        {isCategory && enabled && proactive && <span className="dtr-pill dtr-pill-accent">{t('proactive')}</span>}
        {isCategory && !enabled && <span className="dtr-pill dtr-pill-muted">{t('disabledBadge')}</span>}
      </div>
      {purpose && <p className="dtr-route-purpose">{purpose}</p>}
      {!enabled && <p className="dtr-muted dtr-dormant-note">
        {t('disabledNote')}{dormantSummary ? ` · ${t('dormantBinding', { summary: dormantSummary })}` : ''}
      </p>}
    </div>
    <div className="dtr-controls">
      {enabled && <>
        <ModelPicker
          t={t} catalog={catalog} status={catalogStatus} mode={mode} provider={provider} model={model}
          label={display.label} detail={display.detail} defaultSummary={defaultSummary}
          id={`${baseId}-model`} titleId={titleId}
          invalid={issueField === 'model' || issueField === 'provider'} issueId={issueId}
          disabled={disabled} register={registerModel} onSelect={chooseModel}
        />
        {showEffort && <label className="dtr-field dtr-effort">{t('effort')}
          <select ref={registerEffort} id={`${baseId}-effort`} aria-invalid={issueField === 'effort' || undefined}
            aria-describedby={issueField === 'effort' ? issueId : undefined} value={effort ?? ''}
            disabled={disabled || !catalogReady || !catalogModel || group?.failed}
            onChange={event => onEffort(section, provider, model, event.currentTarget.value)}>
            <option value="">{t('modelDefault')}</option>
            {effort && !efforts.some(item => item.id === effort) && <option value={effort}>{t('unavailableOption', { name: effort })}</option>}
            {efforts.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}
          </select>
        </label>}
        {customized && <button type="button" className="dtr-icon-button" title={t('reset')} aria-label={t('reset')} disabled={disabled}
          onClick={() => chooseModel({ mode: 'default' })}><Icon name="reset" /></button>}
      </>}
      {extraActions}
    </div>
    {children}
  </div>;
});
