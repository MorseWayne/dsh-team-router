import * as React from 'react';
import type { Target } from '../core/routing-policy.ts';
import type { CatalogIndex } from './catalog-index.ts';
import { Icon, ModelPicker, type ModelChoice } from './ModelPicker.tsx';
import type { RoutingField, RoutingSection } from './routing-editor.ts';
import type { Translate } from './settings-copy.ts';

export type FieldNode = HTMLInputElement | HTMLSelectElement | HTMLButtonElement;
export const fieldKey = (section: RoutingSection, field: RoutingField) => `${section}:${field}`;
export type RegisterField = (section: RoutingSection, field: RoutingField, node: FieldNode | null) => void;
const EXECUTOR_LABELS = { codex: 'Codex', agy: 'Antigravity (agy)', cursor: 'Cursor' } as const;
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

export function externalModelSummary(target: Exclude<Target, { executor: 'native' }>, t: Translate): string {
  if (target.model.mode === 'executor-default') return t('executorDefault');
  return target.model.reasoningEffort ? `${target.model.id} · ${target.model.reasoningEffort}` : target.model.id;
}

export function defaultTargetSummary(t: Translate, target: Target, catalog: CatalogIndex, catalogReady: boolean): string {
  if (target.executor !== 'native') return `${EXECUTOR_LABELS[target.executor]} · ${externalModelSummary(target, t)}`;
  const explicit = target.model.mode === 'explicit' ? target.model : undefined;
  const display = nativeDisplay(t, catalog, catalogReady, explicit?.provider, explicit?.id);
  return display.detail ? `${display.label} · ${display.detail}` : display.label;
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
  executor: Target['executor'];
  legacyModel: string | undefined;
  provider: string | undefined;
  model: string | undefined;
  effort: string | undefined;
  followsDefault: boolean;
  defaultSummary: string | undefined;
  disabled: boolean;
  issueField: RoutingField | undefined;
  registerField: RegisterField;
  onModel(section: RoutingSection, choice: ModelChoice): void;
  onEffort(section: RoutingSection, provider: string, model: string, effort: string): void;
}

// RoutingEditor clones its draft on each edit; only primitive row data crosses this memo boundary.
export const RouteRow = React.memo(function RouteRow({ t, section, name, purpose, instance, catalog, catalogReady, catalogStatus, executor, legacyModel,
  provider, model, effort, followsDefault, defaultSummary, disabled, issueField, registerField, onModel, onEffort }: Props) {
  const baseId = `dtr-${instance}-${section}`;
  const titleId = `${baseId}-title`;
  const issueId = `dtr-${instance}-issue`;
  const customized = section !== 'default' && !followsDefault;
  const showExecutor = !followsDefault && executor !== 'native';
  const mode = followsDefault ? 'default' : model === undefined ? 'inherit' : 'explicit';
  const display = followsDefault ? { label: t('useDefault'), detail: defaultSummary } : nativeDisplay(t, catalog, catalogReady, provider, model);
  const group = provider ? catalog.get(provider) : undefined;
  const catalogModel = model ? group?.models.get(model)?.model : undefined;
  const efforts = catalogModel?.reasoning?.efforts ?? NO_EFFORTS;
  const showEffort = !followsDefault && executor === 'native' && provider !== undefined && model !== undefined && (efforts.length > 0 || effort !== undefined);
  const focusAfterReset = React.useRef(false);
  const pickerButton = React.useRef<HTMLButtonElement | null>(null);
  const registerModel = React.useCallback((node: HTMLButtonElement | null) => {
    pickerButton.current = node;
    registerField(section, 'model', node);
    registerField(section, 'provider', node);
  }, [registerField, section]);
  const registerEffort = React.useCallback((node: HTMLSelectElement | null) => registerField(section, 'effort', node), [registerField, section]);
  const registerExecutor = React.useCallback((node: HTMLSelectElement | null) => registerField(section, 'executor', node), [registerField, section]);
  const chooseModel = React.useCallback((choice: ModelChoice) => onModel(section, choice), [onModel, section]);
  React.useLayoutEffect(() => {
    if (!focusAfterReset.current || (!followsDefault && showExecutor)) return;
    focusAfterReset.current = false;
    pickerButton.current?.focus({ preventScroll: true });
  }, [followsDefault, showExecutor]);

  return <div className={`dtr-card dtr-route${section === 'default' ? ' dtr-route-default' : ''}`} role="group" aria-labelledby={titleId}>
    <div className="dtr-stack">
      <div className="dtr-inline dtr-route-title">
        <h4 id={titleId}>{name}</h4>
        {section !== 'default' && <><code className="dtr-route-id">{section}</code><span className={`dtr-pill${customized ? ' dtr-pill-brand' : ''}`}>{t(customized ? 'customized' : 'useDefault')}</span></>}
      </div>
      <p className="dtr-route-purpose">{purpose}</p>
    </div>
    <div className="dtr-controls">
      {showExecutor ? <><label className="dtr-field dtr-executor">{t('executor')}
        <select ref={registerExecutor} id={`${baseId}-executor`} aria-invalid={issueField === 'executor' || undefined}
          aria-describedby={issueField === 'executor' ? issueId : undefined} value={executor} onChange={() => {
            focusAfterReset.current = true;
            chooseModel({ mode: 'inherit' });
          }}>
          <option value="native">{t('native')}</option>
          <option value={executor} disabled>{EXECUTOR_LABELS[executor]}</option>
        </select>
      </label>{legacyModel && <div className="dtr-field dtr-legacy-model"><span>{t('model')}</span><strong>{legacyModel}</strong></div>}</> : <ModelPicker t={t} catalog={catalog} status={catalogStatus} mode={mode} provider={provider} model={model} label={display.label} detail={display.detail}
        defaultSummary={defaultSummary} id={`${baseId}-model`} titleId={titleId} invalid={issueField === 'model' || issueField === 'provider' || issueField === 'executor'}
        issueId={issueId} disabled={disabled} register={registerModel} onSelect={chooseModel} />}
      {showEffort && <label className="dtr-field dtr-effort">{t('effort')}
        <select ref={registerEffort} id={`${baseId}-effort`} aria-invalid={issueField === 'effort' || undefined}
          aria-describedby={issueField === 'effort' ? issueId : undefined} value={effort ?? ''} disabled={!catalogReady || !catalogModel || group?.failed}
          onChange={event => onEffort(section, provider, model, event.currentTarget.value)}>
          <option value="">{t('modelDefault')}</option>
          {effort && !efforts.some(item => item.id === effort) && <option value={effort}>{t('unavailableOption', { name: effort })}</option>}
          {efforts.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}
        </select>
      </label>}
      {customized && <button type="button" className="dtr-icon-button" title={t('reset')} aria-label={t('reset')} onClick={() => {
        focusAfterReset.current = true;
        chooseModel({ mode: 'default' });
      }}><Icon name="reset" /></button>}
    </div>
    {showExecutor && <p className="dtr-muted dtr-warning">{t('externalBlocked')}</p>}
  </div>;
});
