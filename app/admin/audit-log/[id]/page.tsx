'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { auditLogApi, AuditEntry } from '@/lib/api';
import { areaIcon, fieldChanges, formatDateTime, humanize, showValue } from '@/lib/audit';

interface Props {
  params: Promise<{ id: string }>;
}

export default function AuditEntryPage({ params }: Props) {
  const { id } = use(params);
  const [entry, setEntry] = useState<AuditEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    auditLogApi
      .get(Number(id))
      .then(setEntry)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load the audit entry'));
  }, [id]);

  const back = (
    <Link href="/admin/audit-log" className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm">
      <span className="material-symbols-outlined text-base">arrow_back</span>
      Audit log
    </Link>
  );

  if (error) {
    return (
      <div className="space-y-6">
        {back}
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-12 text-center text-white/60">
          {error}. It reaches the website with the gym app&apos;s next sync.
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex justify-center py-24">
        <div className="size-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const changes = fieldChanges(entry.detail);
  const otherDetail = !changes && entry.detail != null && entry.detail !== '' ? entry.detail : null;

  const facts: [string, React.ReactNode][] = [
    ['Who', entry.actorUsername ? `${entry.actorUsername}${entry.actorRole ? ` (${entry.actorRole})` : ''}` : 'The app, on its own'],
    ['When', formatDateTime(entry.createdAt)],
    ['Area', humanize(entry.area)],
    ['Action', humanize(entry.action)],
    [
      'About',
      entry.entityType ? (
        entry.link ? (
          <Link href={entry.link} className="text-primary hover:underline">
            {humanize(entry.entityType)} #{entry.entityId} →
          </Link>
        ) : (
          `${humanize(entry.entityType)}${entry.entityId != null ? ` #${entry.entityId}` : ''}`
        )
      ) : (
        '—'
      ),
    ],
  ];

  return (
    <div className="space-y-6">
      {back}

      <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
        <div className="flex items-start gap-4">
          <span className="size-12 shrink-0 rounded-full flex items-center justify-center bg-primary/10 text-primary">
            <span className="material-symbols-outlined">{areaIcon(entry.area)}</span>
          </span>
          <div className="min-w-0">
            <p className="text-white/50 text-sm">Audit entry #{entry.id}</p>
            <h1 className="text-white text-xl font-bold mt-1">{entry.summary}</h1>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {facts.map(([label, value]) => (
            <div key={label} className="bg-surface-dark-lighter/40 rounded-lg p-4">
              <dt className="text-white/50 text-xs uppercase tracking-wider">{label}</dt>
              <dd className="text-white mt-1 break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {changes && (
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter overflow-hidden">
          <h2 className="text-white font-semibold p-4 border-b border-surface-dark-lighter">What changed</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/50 text-left">
                  <th className="px-4 py-3 font-medium">Field</th>
                  <th className="px-4 py-3 font-medium">Before</th>
                  <th className="px-4 py-3 font-medium">After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-dark-lighter">
                {changes.map((c) => (
                  <tr key={c.field}>
                    <td className="px-4 py-3 text-white/80">{humanize(c.field)}</td>
                    <td className="px-4 py-3 text-red-300/80 break-all">{showValue(c.from)}</td>
                    <td className="px-4 py-3 text-emerald-300 break-all">{showValue(c.to)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {otherDetail != null && (
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter overflow-hidden">
          <h2 className="text-white font-semibold p-4 border-b border-surface-dark-lighter">Details</h2>
          {typeof otherDetail === 'object' && !Array.isArray(otherDetail) ? (
            <dl className="divide-y divide-surface-dark-lighter text-sm">
              {Object.entries(otherDetail as Record<string, unknown>).map(([k, v]) => (
                <div key={k} className="px-4 py-3 flex gap-4">
                  <dt className="w-48 shrink-0 text-white/50">{humanize(k)}</dt>
                  <dd className="text-white/90 break-all">{showValue(v)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <pre className="p-4 text-sm text-white/80 whitespace-pre-wrap break-all">{showValue(otherDetail)}</pre>
          )}
        </div>
      )}
    </div>
  );
}
