import * as React from 'react';
import { searchCatalog, type CatalogIndex } from './catalog-index.ts';
import type { Translate } from './settings-copy.ts';

const ICON_PATHS = {
  chevron: 'm6 9 6 6 6-6', check: 'm5 12 4 4L19 6', reset: 'M4 11a8 8 0 1 1 2 6m-2-6V5m0 6h6',
  passive: 'M6 5v14M11 8l5 4-5 4',
  'specialist-first': 'M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z',
  orchestrator: 'M9 4h6v5H9zM4 16h6v4H4zM14 16h6v4h-6zM12 9v4m-5 3v-3h10v3',
  info: 'M12 11v5m0-8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  arrow: 'M4 12h15m-6-6 6 6-6 6',
};

export function Icon({ name }: { name: keyof typeof ICON_PATHS }) {
  return <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={ICON_PATHS[name]} /></svg>;
}

export type ModelChoice = { mode: 'default' } | { mode: 'inherit' } | { mode: 'explicit'; provider: string; id: string };

interface Props {
  t: Translate;
  catalog: CatalogIndex;
  status: string | undefined;
  mode: ModelChoice['mode'];
  provider: string | undefined;
  model: string | undefined;
  label: string;
  detail: string | undefined;
  defaultSummary: string | undefined;
  id: string;
  titleId: string;
  invalid: boolean;
  issueId: string;
  disabled: boolean;
  register(node: HTMLButtonElement | null): void;
  onSelect(choice: ModelChoice): void;
}

const PAGE_SIZE = 60;

const CatalogOptions = React.memo(function CatalogOptions({ matches, provider, model, choose }: {
  matches: ReturnType<typeof searchCatalog>;
  provider: string | undefined;
  model: string | undefined;
  choose(choice: ModelChoice): void;
}) {
  // The parent can update the input immediately without reconciling this subtree until matches change.
  return <>{matches.groups.map(group => <div key={group.provider.id} role="group" aria-label={group.provider.name}>
    <div aria-hidden="true" className="dtr-option-group-label">{group.provider.name}</div>
    {group.models.map(entry => {
      const active = provider === group.provider.id && model === entry.id;
      return <button key={entry.id} type="button" className="dtr-option" tabIndex={-1} data-catalog-option="" aria-pressed={active} disabled={group.provider.failed}
        onClick={() => choose({ mode: 'explicit', provider: group.provider.id, id: entry.id })}>
        <span>{entry.name}{group.provider.duplicateNames.has(entry.name) && <span className="dtr-option-detail">{entry.id}</span>}</span>{active && <Icon name="check" />}
      </button>;
    })}
  </div>)}</>;
});

export const ModelPicker = React.memo(function ModelPicker({ t, catalog, status, mode, provider, model, label, detail, defaultSummary, id, titleId, invalid, issueId, disabled, register, onSelect }: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [page, setPage] = React.useState({ filter: '', limit: PAGE_SIZE });
  const filter = React.useDeferredValue(query).trim().toLowerCase();
  const limit = page.filter === filter ? page.limit : PAGE_SIZE;
  const root = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLButtonElement | null>(null);
  const popup = React.useRef<HTMLDivElement>(null);
  const input = React.useRef<HTMLInputElement>(null);
  const focusMore = React.useRef<number>();
  const triggerRef = React.useCallback((node: HTMLButtonElement | null) => { trigger.current = node; register(node); }, [register]);
  const visible = open && !disabled;
  const close = React.useCallback(() => {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }, []);
  const choose = React.useCallback((choice: ModelChoice) => {
    close();
    if (choice.mode !== mode || (choice.mode === 'explicit' && (choice.provider !== provider || choice.id !== model))) onSelect(choice);
  }, [close, mode, provider, model, onSelect]);

  React.useLayoutEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  React.useLayoutEffect(() => {
    if (!visible) return;
    const panel = popup.current;
    const anchor = trigger.current;
    if (!panel || !anchor) return;
    const topLayer = typeof panel.showPopover === 'function';
    const rtl = getComputedStyle(anchor).direction === 'rtl';
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
      const up = below < Math.min(400, height * .57) && below < above;
      panel.dataset.up = String(up);
      panel.style.setProperty('--dtr-menu-available', `${Math.min(448, Math.max(0, up ? above : below))}px`);
      if (topLayer) {
        const menuWidth = Math.min(Math.max(0, width - 2 * margin), Math.max(rect.width, 280));
        const left = Math.max(viewportLeft + margin, Math.min(rtl ? rect.left : rect.right - menuWidth, viewportLeft + width - margin - menuWidth));
        panel.style.setProperty('--dtr-menu-width', `${menuWidth}px`);
        panel.style.setProperty('--dtr-menu-left', `${left}px`);
        panel.style.setProperty('--dtr-menu-edge', `${up ? window.innerHeight - rect.top + gap : rect.bottom + gap}px`);
      }
    };
    place();
    if (topLayer) { panel.popover = 'manual'; panel.showPopover(); }
    input.current?.focus({ preventScroll: true });
    let frame = 0;
    const schedulePlace = (event?: Event) => {
      if (frame || (event?.target instanceof Node && panel.contains(event.target))) return;
      frame = requestAnimationFrame(() => { frame = 0; place(); });
    };
    const onOutside = (event: Event) => { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); };
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
      if (entries.some(entry => !entry.isIntersecting)) setOpen(false);
    }) : undefined;
    observer?.observe(anchor);
    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(() => schedulePlace()) : undefined;
    resizeObserver?.observe(anchor);
    const editor = anchor.closest('.dtr-editor');
    if (editor) resizeObserver?.observe(editor);
    visualViewport?.addEventListener('resize', schedulePlace);
    visualViewport?.addEventListener('scroll', schedulePlace, { passive: true });
    window.addEventListener('resize', schedulePlace);
    window.addEventListener('scroll', schedulePlace, { capture: true, passive: true });
    document.addEventListener('pointerdown', onOutside, true);
    document.addEventListener('focusin', onOutside);
    return () => {
      observer?.disconnect();
      resizeObserver?.disconnect();
      cancelAnimationFrame(frame);
      visualViewport?.removeEventListener('resize', schedulePlace);
      visualViewport?.removeEventListener('scroll', schedulePlace);
      window.removeEventListener('resize', schedulePlace);
      window.removeEventListener('scroll', schedulePlace, true);
      document.removeEventListener('pointerdown', onOutside, true);
      document.removeEventListener('focusin', onOutside);
      if (topLayer && panel.matches(':popover-open')) panel.hidePopover();
    };
  }, [visible]);

  const matches = React.useMemo(() => visible && !status ? searchCatalog(catalog, filter, limit) : undefined, [visible, status, catalog, filter, limit]);
  React.useLayoutEffect(() => {
    if (focusMore.current === undefined) return;
    const options = popup.current?.querySelectorAll<HTMLButtonElement>('[data-catalog-option]:not(:disabled)');
    const next = options && (options[focusMore.current] ?? options[options.length - 1]);
    focusMore.current = undefined;
    (next ?? input.current)?.focus();
  }, [limit]);
  const start = () => { setQuery(''); setPage({ filter: '', limit: PAGE_SIZE }); setOpen(true); };
  const specialOption = (choice: ModelChoice & { mode: 'default' | 'inherit' }, text: string, description?: string) =>
    <button type="button" className="dtr-option" tabIndex={choice.mode === 'default' || defaultSummary === undefined ? 0 : -1} aria-pressed={mode === choice.mode} onClick={() => choose(choice)}>
      <span>{text}{description && <span className="dtr-option-detail">{description}</span>}</span>{mode === choice.mode && <Icon name="check" />}
    </button>;
  const selectionText = detail ? `${label} · ${detail}` : label;
  const popupId = `${id}-popup`;
  return <div className="dtr-field dtr-picker" ref={root} onKeyDown={event => {
    if (disabled || event.nativeEvent.isComposing) return;
    if (!visible) {
      if (event.target === trigger.current && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) { event.preventDefault(); start(); }
      return;
    }
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return; }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    if (event.target === input.current && (event.key === 'Home' || event.key === 'End')) return;
    const options = Array.from(popup.current?.querySelectorAll<HTMLButtonElement>('.dtr-option:not(:disabled)') ?? []);
    if (!options.length) return;
    const previous = options.indexOf(event.target as HTMLButtonElement);
    if (previous < 0 && event.target !== input.current) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
      : event.key === 'ArrowDown' ? Math.min(previous + 1, options.length - 1) : previous < 0 ? options.length - 1 : previous - 1;
    if (next < 0) input.current?.focus(); else options[next]?.focus();
  }}>
    <span id={`${id}-label`}>{t('model')}</span>
    <button ref={triggerRef} id={id} type="button" className="dtr-trigger" title={selectionText} aria-labelledby={`${titleId} ${id}-label ${id}-selection`} aria-expanded={visible}
      aria-invalid={invalid || undefined} aria-describedby={invalid ? issueId : undefined} aria-controls={visible ? popupId : undefined} data-follows={mode === 'default'} disabled={disabled}
      onClick={visible ? close : start}>
      <span className="dtr-trigger-copy" id={`${id}-selection`}><span className="dtr-trigger-name">{label}</span>{detail && <span className="dtr-trigger-detail">{mode === 'default' ? `· ${detail}` : detail}</span>}</span><Icon name="chevron" />
    </button>
    {visible && <div className="dtr-menu" id={popupId} ref={popup}>
      <span className="dtr-sr-only" id={`${id}-keys`}>{t('searchKeys')}</span>
      <input ref={input} type="search" aria-label={t('searchModels')} aria-describedby={`${id}-keys`} placeholder={t('searchModels')} value={query}
        onChange={event => setQuery(event.target.value)} />
      <div className="dtr-options">
        {defaultSummary !== undefined && specialOption({ mode: 'default' }, t('useDefault'), defaultSummary)}
        {specialOption({ mode: 'inherit' }, t('inherit'))}
        {status ? <p className="dtr-muted" role="status">{status}</p> : <>
          {matches && <CatalogOptions matches={matches} provider={provider} model={model} choose={choose} />}
          {!matches?.groups.length && <p className="dtr-muted" role="status">{t('noModels')}</p>}
          {matches?.hasMore && <button type="button" className="dtr-option dtr-more" tabIndex={-1} onClick={() => {
            focusMore.current = popup.current?.querySelectorAll('[data-catalog-option]:not(:disabled)').length;
            setPage({ filter, limit: limit + PAGE_SIZE });
          }}>{t('moreModels')}</button>}
        </>}
      </div>
    </div>}
  </div>;
});
