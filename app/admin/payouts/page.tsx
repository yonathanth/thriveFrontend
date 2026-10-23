'use client';

import { useEffect, useMemo, useState } from 'react';
import { payrollApi, type Payout } from '@/lib/api';
import RequireRole from '@/components/auth/RequireRole';
import PayoutCard, { money } from '@/components/payroll/PayoutCard';

type Tab = 'due' | 'waiting' | 'recorded' | 'building';

const TABS: { id: Tab; label: string }[] = [
  { id: 'due', label: 'Due' },
  { id: 'waiting', label: 'Approved' },
  { id: 'recorded', label: 'Paid' },
  { id: 'building', label: 'Current periods' },
];

function today(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * Staff pay calculated by the gym app. A period becomes due when it ends; an admin
 * approves it here with what was actually paid, and the gym app then records it as an
 * expense.
 */
export default function PayoutsPage() {
  const [data, setData] = useState<{ payouts: Payout[]; paymentMethods: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('due');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    payrollApi
      .payouts()
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Could not load payouts'));
    return () => {
      cancelled = true;
    };
  }, [version]);

  const groups = useMemo(() => {
    const list = data?.payouts ?? [];
    return {
      due: list.filter((p) => p.status === 'due'),
      waiting: list.filter((p) => p.status === 'approved'),
      recorded: list.filter((p) => p.status === 'recorded'),
      building: list.filter((p) => p.status === 'building'),
    };
  }, [data]);
  const shown = groups[tab];
  const dueTotal = groups.due.reduce((s, p) => s + p.calculatedAmount, 0);

  return (
    <RequireRole roles={['admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Payouts</h1>
          <p className="text-white/60 mt-1 max-w-3xl">
            Staff pay calculated by the gym app from attendance and revenue shares. When a pay period ends, approve it
            with what was actually paid; the gym app then records it as a “Salaries &amp; commissions” expense.
          </p>
        </div>

        {groups.due.length > 0 && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <span className="material-symbols-outlined text-amber-300">account_balance_wallet</span>
            <p className="text-amber-100 text-sm">
              {groups.due.length} payout{groups.due.length === 1 ? '' : 's'} waiting for approval, {money(dueTotal)}{' '}
              calculated.
            </p>
          </div>
        )}

        <div role="tablist" className="inline-flex flex-wrap gap-1 bg-surface-dark border border-surface-dark-lighter rounded-lg p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-md text-sm ${tab === t.id ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:text-white'}`}
            >
              {t.label}
              <span className="ml-1.5 text-white/40 tabular-nums">{groups[t.id].length}</span>
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {!data ? (
          !error && <p className="text-white/50">Loading…</p>
        ) : shown.length === 0 ? (
          <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-8 text-center text-white/50">
            {tab === 'due'
              ? 'Nothing waiting for approval.'
              : tab === 'waiting'
                ? 'No approvals waiting for the gym app.'
                : tab === 'recorded'
                  ? 'No payouts paid yet.'
                  : 'Nobody is on payroll yet. Pay is set up in the gym app, under Staff → Pay.'}
          </div>
        ) : (
          <div className="space-y-3">
            {shown.map((p) => (
              <PayoutCard key={p.payoutLocalId} payout={p} showName defaultOpen={tab === 'due'}>
                {(p.status === 'due' || p.status === 'approved') && (
                  <ApproveForm
                    payout={p}
                    methods={data.paymentMethods}
                    onDone={() => setVersion((v) => v + 1)}
                  />
                )}
              </PayoutCard>
            ))}
          </div>
        )}
      </div>
    </RequireRole>
  );
}

function ApproveForm({ payout, methods, onDone }: { payout: Payout; methods: string[]; onDone: () => void }) {
  const a = payout.approval;
  const [editing, setEditing] = useState(!a);
  const [amount, setAmount] = useState(String(a?.paidAmount ?? payout.calculatedAmount));
  const [date, setDate] = useState(a?.paidDate ?? today());
  const [method, setMethod] = useState(a?.paymentMethod ?? methods[0] ?? '');
  const [note, setNote] = useState(a?.note ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="flex-1 text-white/50 text-xs">
          The gym app records it the next time it is open and online. Until then you can still change it.
        </p>
        <button onClick={() => setEditing(true)} className="h-9 px-3 rounded-lg bg-surface-dark-lighter text-white/80 hover:text-white text-sm">
          Change approval
        </button>
      </div>
    );
  }

  const paid = Number(amount);
  const valid = amount !== '' && Number.isFinite(paid) && paid >= 0 && /^\d{4}-\d{2}-\d{2}$/.test(date);
  const differs = valid && Math.abs(paid - payout.calculatedAmount) >= 0.005;
  const input =
    'h-10 px-3 w-full bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50';

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await payrollApi.approve(payout.payoutLocalId, {
        paidAmount: paid,
        paidDate: date,
        paymentMethod: method || null,
        note: note.trim() || null,
      });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not approve');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) void submit();
      }}
      className="space-y-3 border-t border-surface-dark-lighter pt-3"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm text-white/60 space-y-1">
          <span>Amount paid (ETB)</span>
          <input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={input} />
        </label>
        <label className="text-sm text-white/60 space-y-1">
          <span>Paid on</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />
        </label>
        <label className="text-sm text-white/60 space-y-1">
          <span>Method</span>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className={input}>
            <option value="">Not recorded</option>
            {methods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm text-white/60 space-y-1">
        <span>Note {differs ? '(why it differs from the calculated amount)' : '(optional)'}</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={1000}
          className="w-full px-3 py-2 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50"
        />
      </label>
      {differs && (
        <p className="text-amber-300 text-xs">
          {money(paid)} instead of the calculated {money(payout.calculatedAmount)}.
        </p>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex flex-wrap gap-2 justify-end">
        {a && (
          <button type="button" onClick={() => setEditing(false)} className="h-10 px-4 rounded-lg bg-surface-dark-lighter text-white/80 hover:text-white">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={busy || !valid}
          className="h-10 px-4 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? 'Saving…' : a ? 'Save approval' : 'Approve payout'}
        </button>
      </div>
    </form>
  );
}
