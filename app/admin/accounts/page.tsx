'use client';

import { useCallback, useEffect, useState, FormEvent } from 'react';
import DataTable, { Column, Pagination } from '@/components/admin/DataTable';
import { useAuth } from '@/contexts/AuthContext';
import { accountsApi, Account, AccountLinkConflict, ApiError } from '@/lib/api';
import { ROLE_LABELS, Role } from '@/lib/roles';

const CONFLICT_TEXT: Record<AccountLinkConflict['kind'], string> = {
  shared_phone: 'Several members share this phone',
  admin_phone: 'Phone belongs to a website admin',
  phone_taken: 'Phone already used by another login',
  invalid_phone: 'No usable mobile number',
};

const inputClass =
  'h-10 px-3 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors';

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function errorText(err: unknown, fallback: string) {
  return err instanceof ApiError || err instanceof Error ? err.message : fallback;
}

export default function AccountsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [tab, setTab] = useState<'accounts' | 'conflicts'>('accounts');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [role, setRole] = useState<Role | ''>('');
  const [status, setStatus] = useState<'' | 'active' | 'inactive'>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<Account | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const roleOptions: Role[] = isAdmin ? ['admin', 'manager', 'trainer', 'member'] : ['manager', 'trainer', 'member'];

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await accountsApi.list({
        page,
        limit: 20,
        role: role || undefined,
        status: status || undefined,
        search: search || undefined,
      });
      setAccounts(res.data);
      setTotal(res.total);
      setTotalPages(Math.max(1, res.totalPages));
    } catch (err) {
      setError(errorText(err, 'Failed to load accounts'));
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, role, status, search]);

  useEffect(() => {
    if (tab === 'accounts') fetchAccounts();
  }, [fetchAccounts, tab]);

  const replace = (updated: Account) => setAccounts((list) => list.map((a) => (a.id === updated.id ? updated : a)));

  const doReset = async (account: Account) => {
    setBusyId(account.id);
    setError(null);
    try {
      replace(await accountsApi.resetPassword(account.id));
      setNotice(
        `${account.name}'s password was reset to the temporary password. They must choose a new one when they sign in.`,
      );
    } catch (err) {
      setError(errorText(err, 'Reset failed'));
    } finally {
      setBusyId(null);
      setConfirmReset(null);
    }
  };

  const toggleStatus = async (account: Account) => {
    setBusyId(account.id);
    setError(null);
    try {
      replace(await accountsApi.setStatus(account.id, !account.isActive));
    } catch (err) {
      setError(errorText(err, 'Could not change status'));
    } finally {
      setBusyId(null);
    }
  };

  const columns: Column<Account>[] = [
    {
      key: 'name',
      header: 'Account',
      render: (a) => (
        <div>
          <p className="text-white font-medium">{a.name}</p>
          <p className="text-white/40 text-xs">{[a.phone, a.email].filter(Boolean).join(' · ') || '—'}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (a) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {ROLE_LABELS[a.role]}
        </span>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      render: (a) => (
        <span className="text-white/60 text-sm">
          {a.source === 'desktop_sync'
            ? `Desktop ${a.staffLocalId != null ? `staff #${a.staffLocalId}` : ''}${
                a.staffLocalId != null && a.memberLocalId != null ? ', ' : ''
              }${a.memberLocalId != null ? `member #${a.memberLocalId}` : ''}`
            : 'Website'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => (
        <div className="flex flex-col gap-1">
          <span className={`text-sm ${a.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
            {a.isActive ? 'Active' : a.deactivatedReason ? 'Off (desktop)' : 'Deactivated'}
          </span>
          {a.mustChangePassword && <span className="text-xs text-orange-400">Temporary password</span>}
          {a.lockedUntil && <span className="text-xs text-red-400">Locked until {formatDate(a.lockedUntil)}</span>}
        </div>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last sign-in',
      render: (a) => <span className="text-white/60 text-sm">{formatDate(a.lastLoginAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (a) => (
        <div className="flex justify-end gap-3">
          {a.canResetPassword && (
            <button
              type="button"
              disabled={busyId === a.id}
              onClick={() => setConfirmReset(a)}
              className="text-primary hover:text-primary/80 text-sm font-medium disabled:opacity-50"
            >
              Reset password
            </button>
          )}
          {a.canSetStatus && (
            <button
              type="button"
              disabled={busyId === a.id}
              onClick={() => toggleStatus(a)}
              className={`text-sm font-medium disabled:opacity-50 ${
                a.isActive ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              {a.isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">Accounts</h1>
          <p className="text-white/60 mt-1">
            {isAdmin
              ? 'Website logins. Managers, trainers and members get theirs automatically from desktop sync.'
              : 'Manager, trainer and member logins. Reset a password when someone forgets theirs.'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="h-10 px-4 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            New admin
          </button>
        )}
      </div>

      {(
        <div className="flex gap-1 border-b border-surface-dark-lighter">
          {(['accounts', 'conflicts'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 border-b-2 text-sm font-medium transition-colors ${
                tab === t ? 'border-primary text-primary' : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              {t === 'accounts' ? 'Accounts' : 'Needs attention'}
            </button>
          ))}
        </div>
      )}

      {notice && (
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-emerald-300/70 hover:text-emerald-200">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm" role="alert">
          {error}
        </div>
      )}

      {tab === 'accounts' ? (
        <>
          <div className="flex flex-col md:flex-row gap-3">
            <form
              className="flex-1 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setPage(1);
                setSearch(searchInput.trim());
              }}
            >
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name, phone or email"
                className={`${inputClass} flex-1`}
              />
              <button type="submit" className="h-10 px-4 bg-surface-dark-lighter text-white/80 rounded-lg hover:text-white">
                Search
              </button>
            </form>
            <select
              value={role}
              onChange={(e) => {
                setPage(1);
                setRole(e.target.value as Role | '');
              }}
              className={inputClass}
            >
              <option value="">All roles</option>
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value as '' | 'active' | 'inactive');
              }}
              className={inputClass}
            >
              <option value="">Any status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <DataTable
            columns={columns}
            data={accounts}
            keyExtractor={(a) => a.id}
            isLoading={isLoading}
            emptyMessage="No accounts match"
          />
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-sm">{total} accounts</p>
            {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
          </div>
        </>
      ) : (
        <ConflictsPanel />
      )}

      {confirmReset && (
        <Modal onClose={() => setConfirmReset(null)} title="Reset password?">
          <p className="text-white/70 text-sm">
            <span className="text-white font-medium">{confirmReset.name}</span>&apos;s password goes back to the
            temporary password, they are signed out everywhere, and they must choose a new password at their next
            sign-in. Tell them the temporary password in person.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setConfirmReset(null)}
              className="h-10 px-4 bg-surface-dark-lighter text-white/60 rounded-lg hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => doReset(confirmReset)}
              disabled={busyId === confirmReset.id}
              className="h-10 px-4 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {busyId === confirmReset.id ? 'Resetting…' : 'Reset password'}
            </button>
          </div>
        </Modal>
      )}

      {showCreate && (
        <CreateAdminModal
          onClose={() => setShowCreate(false)}
          onCreated={(a) => {
            setShowCreate(false);
            setNotice(`${a.name} can now sign in with ${a.phone}. They will be asked to choose their own password.`);
            fetchAccounts();
          }}
        />
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-surface-dark rounded-xl border border-surface-dark-lighter p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-white text-lg font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function CreateAdminModal({ onClose, onCreated }: { onClose: () => void; onCreated: (a: Account) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      onCreated(
        await accountsApi.createAdmin({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          password: form.password,
        }),
      );
    } catch (err) {
      setError(errorText(err, 'Could not create the admin'));
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof form, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className="block">
      <span className="block text-white/60 text-xs mb-1">{label}</span>
      <input
        {...props}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={`${inputClass} w-full`}
      />
    </label>
  );

  return (
    <Modal title="New website admin" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <p className="text-white/50 text-xs">
          Website admins are separate from the desktop app. They sign in with this phone number and must change the
          password you set here on their first sign-in.
        </p>
        {field('name', 'Full name', { required: true, maxLength: 255 })}
        {field('phone', 'Phone number', { required: true, placeholder: '09XX XXX XXX', inputMode: 'tel' })}
        {field('email', 'Email (optional)', { type: 'email' })}
        {field('password', 'Initial password', { type: 'password', required: true, minLength: 6, autoComplete: 'new-password' })}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-10 px-4 bg-surface-dark-lighter text-white/60 rounded-lg hover:text-white">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-4 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create admin'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ConflictsPanel() {
  const [rows, setRows] = useState<AccountLinkConflict[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setRows((await accountsApi.conflicts('open')).data);
    } catch (err) {
      setError(errorText(err, 'Failed to load'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reconcile = async () => {
    setRunning(true);
    setMessage(null);
    try {
      const s = await accountsApi.reconcile();
      setMessage(`Done: ${s.created} logins created, ${s.updated} updated, ${s.conflicts} need attention.`);
      await load();
    } catch (err) {
      setError(errorText(err, 'Reconciliation failed'));
    } finally {
      setRunning(false);
    }
  };

  const resolve = async (id: number) => {
    try {
      await accountsApi.resolveConflict(id);
      setRows((list) => list.filter((r) => r.id !== id));
    } catch (err) {
      setError(errorText(err, 'Could not update'));
    }
  };

  const columns: Column<AccountLinkConflict>[] = [
    {
      key: 'record',
      header: 'Desktop record',
      render: (c) => (
        <div>
          <p className="text-white font-medium">
            {c.sourceType === 'member' ? 'Member' : 'Staff'} #{c.sourceLocalId}
          </p>
          <p className="text-white/40 text-xs">{c.phone || 'No phone'}</p>
        </div>
      ),
    },
    {
      key: 'problem',
      header: 'Problem',
      render: (c) => (
        <div>
          <p className="text-white/80 text-sm">{CONFLICT_TEXT[c.kind]}</p>
          {c.detail && <p className="text-white/40 text-xs">{c.detail}</p>}
        </div>
      ),
    },
    {
      key: 'since',
      header: 'Since',
      render: (c) => <span className="text-white/60 text-sm">{formatDate(c.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (c) => (
        <button onClick={() => resolve(c.id)} className="text-primary hover:text-primary/80 text-sm font-medium">
          Mark handled
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-white/60 text-sm">
          These desktop records did not get a login automatically. Fix the phone number on the desktop and sync again,
          or re-run provisioning.
        </p>
        <button
          onClick={reconcile}
          disabled={running}
          className="h-10 px-4 bg-surface-dark-lighter text-white/80 rounded-lg hover:text-white disabled:opacity-50 inline-flex items-center gap-2 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-lg">sync</span>
          {running ? 'Running…' : 'Re-run provisioning'}
        </button>
      </div>
      {message && <p className="text-emerald-400 text-sm">{message}</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <DataTable
        columns={columns}
        data={rows}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        emptyMessage="Nothing needs attention"
      />
    </div>
  );
}
