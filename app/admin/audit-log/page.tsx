'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { auditLogApi, AuditEntry } from '@/lib/api';
import { areaIcon, formatDateTime, humanize } from '@/lib/audit';
import { timeAgo } from '@/lib/notifications';

const PAGE_SIZE = 50;

export default function AuditLogPage() {
  const [items, setItems] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{ areas: string[]; actions: string[]; actors: string[] }>({
    areas: [],
    actions: [],
    actors: [],
  });
  const [area, setArea] = useState('');
  const [action, setAction] = useState('');
  const [actor, setActor] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    auditLogApi.filters().then(setFilters).catch(() => undefined);
  }, []);

  // Typing settles before it searches.
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const load = useCallback(
    async (nextPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await auditLogApi.list({
          page: nextPage,
          limit: PAGE_SIZE,
          area: area || undefined,
          action: action || undefined,
          actor: actor || undefined,
          search: search || undefined,
        });
        setItems((prev) => (nextPage === 1 ? res.data : [...prev, ...res.data]));
        setTotal(res.total);
        setPage(nextPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load the audit log');
      } finally {
        setLoading(false);
      }
    },
    [area, action, actor, search]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const select =
    'h-10 px-4 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-white text-2xl font-bold">Audit Log</h1>
        <p className="text-white/60 mt-1">Who changed what in the gym app, and when</p>
      </div>

      <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-4 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40">search</span>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search what happened or who did it"
            className="w-full h-10 pl-10 pr-4 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50"
          />
        </div>
        <select value={actor} onChange={(e) => setActor(e.target.value)} className={select}>
          <option value="">Everyone</option>
          {filters.actors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select value={area} onChange={(e) => setArea(e.target.value)} className={select}>
          <option value="">All areas</option>
          {filters.areas.map((a) => (
            <option key={a} value={a}>
              {humanize(a)}
            </option>
          ))}
        </select>
        <select value={action} onChange={(e) => setAction(e.target.value)} className={select}>
          <option value="">All actions</option>
          {filters.actions.map((a) => (
            <option key={a} value={a}>
              {humanize(a)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter overflow-hidden">
        {error ? (
          <div className="p-12 text-center text-white/60">{error}</div>
        ) : items.length === 0 && !loading ? (
          <div className="p-12 text-center text-white/40">
            <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">history</span>
            {area || action || actor || search ? 'Nothing matches these filters' : 'No audit entries have synced yet'}
          </div>
        ) : (
          <div className="divide-y divide-surface-dark-lighter">
            {items.map((e) => (
              <Link
                key={e.id}
                href={`/admin/audit-log/${e.id}`}
                className="p-4 flex gap-4 hover:bg-surface-dark-lighter/40 transition-colors"
              >
                <span className="size-10 shrink-0 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">{areaIcon(e.area)}</span>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-white">{e.summary}</span>
                  <span className="block text-white/50 text-sm mt-0.5">
                    {e.actorUsername ?? 'The app'}
                    {e.actorRole ? ` · ${e.actorRole}` : ''} · {humanize(e.area)} · {humanize(e.action)}
                  </span>
                </span>
                <span className="text-white/40 text-xs whitespace-nowrap" title={formatDateTime(e.createdAt)}>
                  {e.createdAt ? timeAgo(e.createdAt) : ''}
                </span>
              </Link>
            ))}
          </div>
        )}
        {items.length < total && (
          <button
            onClick={() => load(page + 1)}
            disabled={loading}
            className="w-full py-3 text-sm text-primary border-t border-surface-dark-lighter hover:bg-surface-dark-lighter/40 disabled:opacity-50"
          >
            {loading ? 'Loading…' : `Show more (${total - items.length} left)`}
          </button>
        )}
      </div>
    </div>
  );
}
