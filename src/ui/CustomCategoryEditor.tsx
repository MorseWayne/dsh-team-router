import * as React from 'react';
import {
  CUSTOM_CATEGORY_TEMPLATES, MAX_CUSTOM_CATEGORIES, generateCustomCategoryId,
} from '../core/categories.ts';
import type { CatalogIndex } from './catalog-index.ts';
import type { ModelChoice } from './ModelPicker.tsx';
import { RouteRow, type RegisterField } from './RouteRow.tsx';
import type {
  CustomCategoryDraft, CustomCategorySeed, RoutingSection, RoutingValidationIssue,
} from './routing-editor.ts';
import type { Translate } from './settings-copy.ts';

interface Props {
  t: Translate;
  locale: 'en' | 'zh';
  custom: readonly CustomCategoryDraft[];
  instance: string;
  catalog: CatalogIndex;
  catalogReady: boolean;
  catalogStatus: string | undefined;
  defaultSummary: string | undefined;
  disabled: boolean;
  issue: RoutingValidationIssue | undefined;
  registerField: RegisterField;
  onAdd(seed?: CustomCategorySeed): string | undefined;
  onUpdate(id: string, patch: Partial<Pick<CustomCategoryDraft, 'id' | 'name' | 'purpose' | 'avoid' | 'enabled' | 'proactive'>>): void;
  onRemove(id: string): void;
  onModel(section: RoutingSection, choice: ModelChoice): void;
  onEffort(section: RoutingSection, provider: string, model: string, effort: string): void;
}

const META_FIELDS = new Set(['id', 'name', 'purpose', 'avoid']);

export const CustomCategoryEditor = React.memo(function CustomCategoryEditor({
  t, locale, custom, instance, catalog, catalogReady, catalogStatus,
  defaultSummary, disabled, issue, registerField, onAdd, onUpdate, onRemove, onModel, onEffort,
}: Props) {
  const [editing, setEditing] = React.useState<ReadonlySet<string>>(() => new Set());
  const [manualIds, setManualIds] = React.useState<ReadonlySet<string>>(() => new Set());
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string>();
  const headingId = `dtr-${instance}-group-custom`;
  const issueId = `dtr-${instance}-issue`;
  const atLimit = custom.length >= MAX_CUSTOM_CATEGORIES;

  const openEditor = React.useCallback((id: string) => {
    setEditing(prev => { const next = new Set(prev); next.add(id); return next; });
  }, []);
  const toggleEditor = React.useCallback((id: string) => {
    setEditing(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
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
  const addFromTemplate = (template: typeof CUSTOM_CATEGORY_TEMPLATES[number]) => {
    const text = template[locale];
    const id = onAdd({ id: template.suggestedId, name: text.name, purpose: text.purpose, avoid: text.avoid, proactive: false });
    if (id) {
      openEditor(id);
      setShowTemplates(false);
    }
  };

  const handleToggle = React.useCallback((section: RoutingSection, next: boolean) => {
    onUpdate(section, { enabled: next });
  }, [onUpdate]);

  return <section className="dtr-group dtr-custom-section" aria-labelledby={headingId}>
    <div className="dtr-inline dtr-custom-header">
      <div className="dtr-inline dtr-group-heading">
        <h4 id={headingId}>{t('customTitle')}</h4>
        <span className="dtr-count">{custom.length}/{MAX_CUSTOM_CATEGORIES}</span>
      </div>
      <div className="dtr-inline">
        <button type="button" disabled={disabled || atLimit} onClick={addBlank}>{t('customAddBlank')}</button>
        <button type="button" disabled={disabled || atLimit} aria-expanded={showTemplates}
          onClick={() => setShowTemplates(value => !value)}>{t('customAddTemplate')}</button>
      </div>
    </div>
    <p className="dtr-muted">{t('customSubtitle', { max: MAX_CUSTOM_CATEGORIES })}</p>
    {atLimit && <p className="dtr-muted dtr-warning" role="status">{t('customLimitReached', { max: MAX_CUSTOM_CATEGORIES })}</p>}

    {showTemplates && !atLimit && <section className="dtr-card dtr-note" aria-label={t('customTemplatesTitle')}>
      <div className="dtr-inline dtr-toolbar">
        <strong>{t('customTemplatesTitle')}</strong>
        <button type="button" onClick={() => setShowTemplates(false)}>{t('customCancelDelete')}</button>
      </div>
      <div className="dtr-template-grid">
        {CUSTOM_CATEGORY_TEMPLATES.map(template => {
          const text = template[locale];
          return <div key={template.templateId} className="dtr-card dtr-template-card">
            <div className="dtr-stack">
              <div className="dtr-inline dtr-route-title">
                <strong>{text.name}</strong>
                <code className="dtr-route-id">{template.suggestedId}</code>
              </div>
              <p className="dtr-route-purpose">{text.purpose}</p>
              <p className="dtr-muted">{t('customExample', { text: text.example })}</p>
              <p className="dtr-muted">{text.nearBuiltin}</p>
            </div>
            <button type="button" disabled={disabled || atLimit} onClick={() => addFromTemplate(template)}>{t('customUseTemplate')}</button>
          </div>;
        })}
      </div>
    </section>}

    {custom.length === 0 && !showTemplates && <p className="dtr-muted dtr-card dtr-note">{t('customEmpty')}</p>}

    {custom.map(entry => {
      const hasMetaIssue = issue?.section === entry.id && META_FIELDS.has(issue.field);
      const isOpen = editing.has(entry.id) || hasMetaIssue;
      const followsDefault = entry.binding.mode === 'default';
      const explicit = entry.binding.mode === 'explicit' ? entry.binding : undefined;
      const confirming = confirmDeleteId === entry.id;
      const baseId = `dtr-${instance}-${entry.id}`;

      return <RouteRow
        key={entry.id}
        t={t} section={entry.id} name={entry.name || entry.id} purpose={entry.purpose}
        instance={instance} catalog={catalog} catalogReady={catalogReady} catalogStatus={catalogStatus}
        provider={explicit?.provider} model={explicit?.model} effort={explicit?.reasoningEffort}
        followsDefault={followsDefault} defaultSummary={defaultSummary}
        enabled={entry.enabled} proactive={entry.proactive} disabled={disabled}
        issueField={issue?.section === entry.id ? issue.field : undefined}
        registerField={registerField} onToggleEnabled={handleToggle} onModel={onModel} onEffort={onEffort}
        extraActions={<>
          <button type="button" disabled={disabled} aria-expanded={isOpen} onClick={() => toggleEditor(entry.id)}>
            {t(isOpen ? 'customDone' : 'customEdit')}
          </button>
          <button type="button" className="dtr-danger-button" disabled={disabled} onClick={() => setConfirmDeleteId(entry.id)}>
            {t('customDelete')}
          </button>
        </>}
      >
        {confirming && <div className="dtr-custom-confirm" role="alert">
          <span>{t('customDeleteHint')}</span>
          <div className="dtr-inline">
            <button type="button" disabled={disabled} onClick={() => setConfirmDeleteId(undefined)}>{t('customCancelDelete')}</button>
            <button type="button" className="dtr-danger-button" disabled={disabled} onClick={() => {
              setConfirmDeleteId(undefined);
              onRemove(entry.id);
            }}>{t('customDeleteConfirm')}</button>
          </div>
        </div>}

        {isOpen && <div className="dtr-custom-form">
          <div className="dtr-custom-form-grid">
            <label className="dtr-field">
              <span>{t('customName')}</span>
              <input
                ref={node => registerField(entry.id, 'name', node)}
                id={`${baseId}-name`} type="text" maxLength={40} disabled={disabled}
                placeholder={t('customNamePlaceholder')} value={entry.name}
                aria-invalid={(issue?.section === entry.id && issue.field === 'name') || undefined}
                aria-describedby={issue?.section === entry.id && issue.field === 'name' ? issueId : undefined}
                onChange={event => {
                  const nextName = event.currentTarget.value;
                  if (!entry.persisted && !manualIds.has(entry.id)) {
                    const otherIds = custom.filter(item => item.id !== entry.id).map(item => item.id);
                    const nextId = generateCustomCategoryId(nextName, otherIds);
                    setEditing(prev => { const next = new Set(prev); next.delete(entry.id); next.add(nextId); return next; });
                    onUpdate(entry.id, { name: nextName, id: nextId });
                  } else {
                    onUpdate(entry.id, { name: nextName });
                  }
                }}
              />
            </label>
            <label className="dtr-field">
              <span>{t('customId')}{entry.persisted ? ` · ${t('customIdLocked')}` : ''}</span>
              <input
                ref={node => registerField(entry.id, 'id', node)}
                id={`${baseId}-id`} type="text" maxLength={40} disabled={disabled || entry.persisted}
                value={entry.id}
                aria-invalid={(issue?.section === entry.id && issue.field === 'id') || undefined}
                aria-describedby={issue?.section === entry.id && issue.field === 'id' ? issueId : undefined}
                onChange={event => {
                  const nextId = event.currentTarget.value;
                  setManualIds(prev => { const next = new Set(prev); next.delete(entry.id); next.add(nextId); return next; });
                  setEditing(prev => { const next = new Set(prev); next.delete(entry.id); next.add(nextId); return next; });
                  onUpdate(entry.id, { id: nextId });
                }}
              />
              {!entry.persisted && <span className="dtr-muted">{t('customIdHint')}</span>}
            </label>
          </div>

          <label className="dtr-field">
            <span>{t('customPurpose')}</span>
            <input
              ref={node => registerField(entry.id, 'purpose', node)}
              id={`${baseId}-purpose`} type="text" maxLength={120} disabled={disabled}
              placeholder={t('customPurposePlaceholder')} value={entry.purpose}
              aria-invalid={(issue?.section === entry.id && issue.field === 'purpose') || undefined}
              aria-describedby={issue?.section === entry.id && issue.field === 'purpose' ? issueId : undefined}
              onChange={event => onUpdate(entry.id, { purpose: event.currentTarget.value })}
            />
          </label>

          <label className="dtr-field">
            <span>{t('customAvoid')}</span>
            <input
              ref={node => registerField(entry.id, 'avoid', node)}
              id={`${baseId}-avoid`} type="text" maxLength={80} disabled={disabled}
              placeholder={t('customAvoidPlaceholder')} value={entry.avoid}
              aria-invalid={(issue?.section === entry.id && issue.field === 'avoid') || undefined}
              aria-describedby={issue?.section === entry.id && issue.field === 'avoid' ? issueId : undefined}
              onChange={event => onUpdate(entry.id, { avoid: event.currentTarget.value })}
            />
          </label>

          <div className="dtr-toggle-row dtr-custom-proactive">
            <div>
              <strong id={`${baseId}-proactive`}>{t('customProactive')}</strong>
              <p id={`${baseId}-proactive-hint`} className="dtr-muted">{t('customProactiveHint')}</p>
            </div>
            <button
              type="button" role="switch" aria-checked={entry.proactive}
              aria-labelledby={`${baseId}-proactive`} aria-describedby={`${baseId}-proactive-hint`}
              className="dtr-switch" disabled={disabled}
              onClick={() => onUpdate(entry.id, { proactive: !entry.proactive })}
            />
          </div>
        </div>}
      </RouteRow>;
    })}
  </section>;
});
