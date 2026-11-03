'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { accountsApi, AccountPermissions, AccountPermissionRow, ApiError } from '@/lib/api';
import { ROLE_LABELS } from '@/lib/roles';

type Choice = 'default' | 'grant' | 'deny';

const ACTION_STYLES: Record<string, string> = {
  view: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  create: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  edit: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  delete: 'bg-red-500/10 text-red-400 border-red-500/20',
  approve: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  manage: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

function errorText(err: unknown, fallback: string) {
  return err instanceof ApiError || err instanceof Error ? err.message : fallback;
}

const choiceOf = (row: AccountPermissionRow): Choice => row.override ?? 'default';

/** What the account would get with this choice. */
function effectiveWith(row: AccountPermissionRow, choice: Choice): boolean {
  if (!row.grantable) return row.effective;
  if (choice === 'grant') return true;
  if (choice === 'deny') return false;
  return row.roleDefault;
}

/**
 * Per-account website permissions: each one follows the role default unless an admin
 * allows or denies it for this person. The API applies a change on the account's very
 * next request; nobody is signed out.
 */
export default function AccountPermissionsPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [data, setData] = useState<AccountPermissions | null>(null);
  const [draft, setDraft] = useState<Record<string, Choice>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const apply = (result: AccountPermissions) => {
    setData(result);
    setDraft(Object.fromEntries(result.permissions.map((p) => [p.key, choiceOf(p)])));
  };

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      apply(await accountsApi.getPermissions(id));
    } catch (err) {
      setError(errorText(err, 'Failed to load permissions'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const groups = useMemo(() => {
    const byArea = new Map<string, AccountPermissionRow[]>();
    for (const p of data?.permissions ?? []) {
      byArea.set(p.area, [...(byArea.get(p.area) ?? []), p]);
    }
    return [...byArea.entries()];
  }, [data]);

  const changes = useMemo(() => {
    const out: Record<string, 'grant' | 'deny' | null> = {};
    for (const p of data?.permissions ?? []) {
      const next = draft[p.key] ?? 'default';
      if (p.grantable && next !== choiceOf(p)) out[p.key] = next === 'default' ? null : next;
    }
    return out;
  }, [data, draft]);
  const changeCount = Object.keys(changes).length;
  const overrideCount = (data?.permissions ?? []).filter((p) => p.override).length;

  const save = async (overrides: Record<string, 'grant' | 'deny' | null>, message: string) => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      apply(await accountsApi.setPermissions(id, overrides));
      setNotice(message);
    } catch (err) {
      setError(errorText(err, 'Could not save permissions'));
    } finally {
      setSaving(false);
    }
  };

  const resetAll = () => {
    const overrides = Object.fromEntries(
      (data?.permissions ?? []).filter((p) => p.override).map((p) => [p.key, null]),
    ) as Record<string, null>;
    void save(overrides, 'Permissions reset to the role defaults.');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <Link href="/admin/accounts" className="text-white/60 hover:text-white text-sm inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Accounts
          </Link>
          <h1 className="text-white text-2xl font-bold mt-2">
            Permissions{data ? `: ${data.account.name}` : ''}
          </h1>
          <p className="text-white/60 mt-1">
            {data ? `${ROLE_LABELS[data.account.role]} account. ` : ''}
            Each permission follows the role default unless you allow or deny it for this person. Changes apply on
            their next action; nobody is signed out.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetAll}
            disabled={saving || isLoading || overrideCount === 0}
            className="h-10 px-4 bg-surface-dark-lighter text-white/80 rounded-lg hover:text-white disabled:opacity-50"
          >
            Reset to role defaults
          </button>
          <button
            type="button"
            onClick={() => save(changes, `Saved ${changeCount} change${changeCount === 1 ? '' : 's'}.`)}
            disabled={saving || changeCount === 0}
            className="h-10 px-6 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : changeCount ? `Save ${changeCount} change${changeCount === 1 ? '' : 's'}` : 'Saved'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm">
          {notice}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-surface-dark rounded-xl border border-surface-dark-lighter animate-pulse" />
          ))}
        </div>
      ) : (
        groups.map(([area, rows]) => (
          <div key={area} className="bg-surface-dark rounded-xl border border-surface-dark-lighter overflow-x-auto">
            <div className="p-4 border-b border-surface-dark-lighter">
              <h2 className="text-white font-semibold">{area}</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/40 border-b border-surface-dark-lighter">
                  <th className="p-4 font-medium">Permission</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Role default</th>
                  <th className="p-4 font-medium">Setting</th>
                  <th className="p-4 font-medium">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-dark-lighter">
                {rows.map((p) => {
                  const choice = draft[p.key] ?? 'default';
                  const result = effectiveWith(p, choice);
                  const changed = p.grantable && choice !== choiceOf(p);
                  return (
                    <tr key={p.key} className={changed ? 'bg-primary/5' : undefined}>
                      <td className="p-4">
                        <p className="text-white">{p.label}</p>
                        <p className="text-white/40 text-xs font-mono">{p.key}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${
                            ACTION_STYLES[p.action] ?? ACTION_STYLES.view
                          }`}
                        >
                          {p.action}
                        </span>
                      </td>
                      <td className="p-4 text-white/60">{p.roleDefault ? 'On' : 'Off'}</td>
                      <td className="p-4">
                        {p.grantable ? (
                          <select
                            value={choice}
                            onChange={(e) => setDraft((d) => ({ ...d, [p.key]: e.target.value as Choice }))}
                            className="h-9 px-3 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50"
                            aria-label={`Setting for ${p.label}`}
                          >
                            <option value="default">Role default</option>
                            <option value="grant">Allow</option>
                            <option value="deny">Deny</option>
                          </select>
                        ) : (
                          <span className="text-white/40 text-xs">
                            {p.adminOnly ? 'Admins only' : 'Not available for this role'}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 text-sm font-medium ${
                            result ? 'text-emerald-400' : 'text-white/40'
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">{result ? 'check_circle' : 'block'}</span>
                          {result ? 'Allowed' : 'Not allowed'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
