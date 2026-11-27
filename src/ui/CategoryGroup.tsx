import * as React from 'react';
import { BUILTIN_GROUPS } from '../core/categories.ts';
import type { BuiltinCategory, BuiltinGroupId, BuiltinId } from '../core/categories.ts';
import type { CatalogIndex } from './catalog-index.ts';
import type { ModelChoice } from './ModelPicker.tsx';
import { RouteRow, type RegisterField } from './RouteRow.tsx';
import type { BuiltinDraftEntry, RoutingSection, RoutingValidationIssue } from './routing-editor.ts';
import type { Translate } from './settings-copy.ts';

interface Props {
  t: Translate;
  locale: 'en' | 'zh';
  groupId: BuiltinGroupId;
  entries: readonly BuiltinCategory[];
  draftBuiltins: Record<BuiltinId, BuiltinDraftEntry>;
  instance: string;
  catalog: CatalogIndex;
  catalogReady: boolean;
  catalogStatus: string | undefined;
  defaultSummary: string | undefined;
  disabled: boolean;
  issue: RoutingValidationIssue | undefined;
  registerField: RegisterField;
  onToggleEnabled(id: BuiltinId, enabled: boolean): void;
  onModel(section: RoutingSection, choice: ModelChoice): void;
  onEffort(section: RoutingSection, provider: string, model: string, effort: string): void;
}

export const CategoryGroup = React.memo(function CategoryGroup({
  t, locale, groupId, entries, draftBuiltins, instance, catalog, catalogReady, catalogStatus,
  defaultSummary, disabled, issue, registerField, onToggleEnabled, onModel, onEffort,
}: Props) {
  const headingId = `dtr-${instance}-group-${groupId}`;
  const groupTitle = BUILTIN_GROUPS[groupId][locale];
  let enabledCount = 0;
  let customizedCount = 0;
  const primary: BuiltinCategory[] = [];
  const followingDefault: BuiltinCategory[] = [];

  for (const entry of entries) {
    const state = draftBuiltins[entry.id];
    if (state.enabled) enabledCount++;
    if (state.binding.mode !== 'default') customizedCount++;
    const hasIssue = issue?.section === entry.id;
    if (!state.enabled || state.binding.mode !== 'default' || hasIssue) primary.push(entry);
    else followingDefault.push(entry);
  }

  const handleToggle = React.useCallback((section: RoutingSection, next: boolean) => {
    onToggleEnabled(section as BuiltinId, next);
  }, [onToggleEnabled]);

  const renderRow = (entry: BuiltinCategory) => {
    const state = draftBuiltins[entry.id];
    const binding = state.binding;
    const followsDefault = binding.mode === 'default';
    const explicit = binding.mode === 'explicit' ? binding : undefined;
    return <RouteRow
      key={entry.id}
      t={t} section={entry.id} name={entry[locale].name} purpose={entry[locale].purpose}
      instance={instance} catalog={catalog} catalogReady={catalogReady} catalogStatus={catalogStatus}
      provider={explicit?.provider} model={explicit?.model} effort={explicit?.reasoningEffort}
      followsDefault={followsDefault} defaultSummary={defaultSummary}
      enabled={state.enabled} proactive={entry.proactive} disabled={disabled}
      issueField={issue?.section === entry.id ? issue.field : undefined}
      registerField={registerField} onToggleEnabled={handleToggle} onModel={onModel} onEffort={onEffort}
    />;
  };

  return <section className="dtr-group" aria-labelledby={headingId}>
    <div className="dtr-inline dtr-group-heading">
      <h4 id={headingId}>{groupTitle}</h4>
      <span className="dtr-count">{t('groupCount', { enabled: enabledCount, total: entries.length })}</span>
      {customizedCount > 0 && <span className="dtr-pill dtr-pill-brand">{t('groupCustomized', { count: customizedCount })}</span>}
    </div>
    {primary.map(renderRow)}
    {followingDefault.length > 0 && (
      <details className="dtr-default-collapse">
        <summary>{t('showDefaultRows', { count: followingDefault.length })}</summary>
        <div className="dtr-group dtr-collapse-body">
          {followingDefault.map(renderRow)}
        </div>
      </details>
    )}
  </section>;
});
