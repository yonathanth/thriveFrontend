'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  payrollApi,
  type PaySetup,
  type PayTargets,
  type RevenueShare,
  type ShareScope,
  type ShareTarget,
  type StaffPay,
} from '@/lib/api';
import { formatDay, money } from './PayoutCard';

const SCOPES: { value: ShareScope; label: string; hint: string; target: ShareTarget | null }[] = [
  { value: 'assigned_members', label: 'Members assigned to them', hint: 'Plan payments from members whose trainer they are when they pay', target: 'plan' },
  { value: 'addon_trainer', label: 'Add-ons they train', hint: 'Add-on payments (e.g. personal training) where they are the trainer', target: 'addon' },
  { value: 'drop_in_instructor', label: 'Drop-ins they run', hint: 'Drop-in payments where they were the instructor', target: 'drop_in' },
  { value: 'service', label: 'Everything paid for one service', hint: 'Every payment for one plan, add-on or drop-in, whoever the member is', target: null },
];

const TARGET_LABEL: Record<ShareTarget, { one: string; every: string }> = {
  plan: { one: 'Plan', every: 'Every plan' },
  addon: { one: 'Add-on', every: 'Every add-on' },
  drop_in: { one: 'Drop-in', every: 'Every drop-in' },
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const field =
  'h-10 px-3 w-full bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50';
const labelCls = 'text-sm text-white/60 space-y-1 block';

function today(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const blankSetup = (): PaySetup => ({
  baseType: 'monthly',
  baseAmount: 0,
  cycle: 'monthly',
  cycleDays: 30,
  cycleStart: today(),
  deductAbsence: false,
  workDays: [1, 2, 3, 4, 5, 6],
  active: true,
});

/** A pay setup in one line, e.g. "5,000 ETB a month · 2 revenue shares". */
function summary(p: StaffPay): string {
  const s = p.setup;
  if (!s) return 'Not set up';
  if (!s.active) return 'Off payroll';
  const cycle = s.cycle === 'monthly' ? 'a month' : `every ${s.cycleDays} days`;
  const base =
    s.baseType === 'monthly'
      ? `${money(s.baseAmount)} ${cycle}`
      : s.baseType === 'daily'
        ? `${money(s.baseAmount)} per day worked, paid ${s.cycle === 'monthly' ? 'monthly' : cycle}`
        : `No base, paid ${s.cycle === 'monthly' ? 'monthly' : cycle}`;
  const shares = p.shares.length ? ` · ${p.shares.length} revenue share${p.shares.length === 1 ? '' : 's'}` : '';
  return base + shares;
}

/** What a share row means, in words, from the form (the server's wording once saved). */
function shareWords(s: RevenueShare, targets: PayTargets): string {
  const rate = s.rateType === 'percent' ? `${s.rate || 0}%` : `${money(Number(s.rate) || 0)} per payment`;
  const name = s.targetKind && s.targetLocalId != null ? targets[s.targetKind].find((t) => t.id === s.targetLocalId)?.name : null;
  switch (s.scope) {
    case 'assigned_members':
      return `${rate} of ${name ?? 'membership'} payments from members assigned to them`;
    case 'addon_trainer':
      return `${rate} of ${name ? `${name} ` : ''}add-on payments they train`;
    case 'drop_in_instructor':
      return `${rate} of ${name ? `${name} ` : ''}drop-ins they ran`;
    default:
      return name ? `${rate} of every ${name} payment` : `${rate} of every payment for …`;
  }
}

function shareProblem(s: RevenueShare): string | null {
  if (!Number.isFinite(Number(s.rate)) || Number(s.rate) < 0) return 'Enter a rate of 0 or more';
  if (s.rateType === 'percent' && Number(s.rate) > 100) return 'A percentage is 0 to 100';
  if (s.scope === 'service' && (s.targetKind == null || s.targetLocalId == null)) return 'Choose which service';
  return null;
}

/**
 * Each member of staff's pay: base, cycle, absences and revenue shares, edited in one
 * form with one Save. Unsaved changes are never dropped silently.
 */
export default function PaySetupPanel() {
  const [data, setData] = useState<{ staff: StaffPay[]; targets: PayTargets } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    payrollApi
      .staff()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load staff pay'));
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const open = (id: number | null) => {
    if (dirty && !window.confirm('You have unsaved pay changes. Discard them?')) return;
    setDirty(false);
    setSaved(null);
    setOpenId(id);
  };

  if (error) return <p className="text-red-400 text-sm">{error}</p>;
  if (!data) return <p className="text-white/50">Loading…</p>;
  if (data.staff.length === 0)
    return (
      <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-8 text-center text-white/50">
        No staff yet. Staff are added in the gym app and appear here once it syncs.
      </div>
    );

  return (
    <div className="space-y-3">
      {saved && <p className="text-emerald-300 text-sm">{saved}</p>}
      {data.staff.map((p) => {
        const isOpen = openId === p.staffLocalId;
        return (
          <div key={p.staffLocalId} className="bg-surface-dark rounded-xl border border-surface-dark-lighter">
            <button
              type="button"
              onClick={() => open(isOpen ? null : p.staffLocalId)}
              aria-expanded={isOpen}
              className="w-full flex flex-wrap items-center gap-3 p-4 text-left"
            >
              <span className="material-symbols-outlined text-white/40 text-xl">{isOpen ? 'expand_less' : 'expand_more'}</span>
              <div className="flex-1 min-w-[12rem]">
                <div className="text-white font-semibold">
                  {p.name}
                  {p.role && <span className="ml-2 text-white/40 text-sm font-normal">{p.role}</span>}
                </div>
                <div className={`text-sm ${p.setup?.active ? 'text-white/60' : 'text-white/40'}`}>{summary(p)}</div>
              </div>
              {p.due.count > 0 && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/30">
                  {money(p.due.amount)} due
                </span>
              )}
              {p.current && (
                <div className="text-right min-w-[8rem]">
                  <div className="text-white font-semibold tabular-nums">{money(p.current.amount)}</div>
                  <div className="text-white/40 text-xs">so far, to {formatDay(p.current.periodLast)}</div>
                </div>
              )}
            </button>
            {isOpen && (
              <PayEditor
                person={p}
                targets={data.targets}
                onDirty={setDirty}
                onSaved={(updated) => {
                  setData((d) =>
                    d && { ...d, staff: d.staff.map((s) => (s.staffLocalId === updated.staffLocalId ? updated : s)) },
                  );
                  setDirty(false);
                  setSaved(`Saved ${updated.name}'s pay.`);
                  setOpenId(null);
                }}
                onCancel={() => open(null)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PayEditor({
  person,
  targets,
  onDirty,
  onSaved,
  onCancel,
}: {
  person: StaffPay;
  targets: PayTargets;
  onDirty: (dirty: boolean) => void;
  onSaved: (p: StaffPay) => void;
  onCancel: () => void;
}) {
  const initial = useMemo(
    () => ({
      setup: person.setup ? { ...person.setup } : blankSetup(),
      shares: person.shares.map((s) => ({ ...s })),
    }),
    [person],
  );
  const [setup, setSetup] = useState<PaySetup>(initial.setup);
  const [shares, setShares] = useState<RevenueShare[]>(initial.shares);
  const [sharesOpen, setSharesOpen] = useState(initial.shares.length > 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty =
    JSON.stringify({ setup, shares }) !==
    JSON.stringify({ setup: initial.setup, shares: initial.shares });
  useEffect(() => onDirty(isDirty), [isDirty, onDirty]);

  const set = <K extends keyof PaySetup>(k: K, v: PaySetup[K]) => setSetup((s) => ({ ...s, [k]: v }));
  const setShare = (i: number, patch: Partial<RevenueShare>) =>
    setShares((list) => list.map((s, j) => (j === i ? { ...s, ...patch, description: undefined } : s)));

  const needsDays = setup.baseType === 'daily' || (setup.baseType === 'monthly' && setup.deductAbsence);
  const problems = [
    setup.baseType !== 'none' && !(Number(setup.baseAmount) >= 0) ? 'Enter the base amount' : null,
    setup.cycle === 'days' && !(setup.cycleDays >= 7 && setup.cycleDays <= 62) ? 'A pay period is 7 to 62 days' : null,
    !/^\d{4}-\d{2}-\d{2}$/.test(setup.cycleStart) ? 'Choose the day the first period starts' : null,
    needsDays && setup.workDays.length === 0 ? 'Choose the days they are expected at work' : null,
    ...shares.map((s, i) => {
      const p = shareProblem(s);
      return p ? `Revenue share ${i + 1}: ${p}` : null;
    }),
  ].filter(Boolean) as string[];

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const updated = await payrollApi.save(person.staffLocalId, {
        setup: {
          ...setup,
          baseAmount: Number(setup.baseAmount) || 0,
          cycleDays: setup.cycle === 'days' ? Number(setup.cycleDays) : 30,
          deductAbsence: setup.baseType === 'monthly' && setup.deductAbsence,
        },
        shares: shares.map((s) => ({ ...s, rate: Number(s.rate) })),
      });
      onSaved(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!problems.length) void save();
      }}
      className="border-t border-surface-dark-lighter p-4 space-y-5"
    >
      <label className="flex items-center gap-3 text-white">
        <input
          type="checkbox"
          checked={setup.active}
          onChange={(e) => set('active', e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        <span>
          On payroll
          <span className="block text-white/40 text-xs">
            Off payroll stops new pay periods; finished ones stay due until paid.
          </span>
        </span>
      </label>

      <section className="space-y-3">
        <h3 className="text-white font-semibold">Base pay</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={labelCls}>
            <span>How the base works</span>
            <select value={setup.baseType} onChange={(e) => set('baseType', e.target.value as PaySetup['baseType'])} className={field}>
              <option value="monthly">Fixed amount per pay period</option>
              <option value="daily">Daily rate, per day they check in</option>
              <option value="none">No base (revenue shares only)</option>
            </select>
          </label>
          {setup.baseType !== 'none' && (
            <label className={labelCls}>
              <span>{setup.baseType === 'daily' ? 'Amount per day (ETB)' : 'Amount per period (ETB)'}</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={setup.baseAmount}
                onChange={(e) => set('baseAmount', e.target.value === '' ? ('' as unknown as number) : Number(e.target.value))}
                className={field}
              />
            </label>
          )}
          <label className={labelCls}>
            <span>Pay cycle</span>
            <select value={setup.cycle} onChange={(e) => set('cycle', e.target.value as PaySetup['cycle'])} className={field}>
              <option value="monthly">Monthly, on the start day</option>
              <option value="days">Every set number of days</option>
            </select>
          </label>
          {setup.cycle === 'days' && (
            <label className={labelCls}>
              <span>Days per period (7–62)</span>
              <input
                type="number"
                min={7}
                max={62}
                value={setup.cycleDays}
                onChange={(e) => set('cycleDays', Number(e.target.value))}
                className={field}
              />
            </label>
          )}
          <label className={labelCls}>
            <span>First period starts</span>
            <input type="date" value={setup.cycleStart} onChange={(e) => set('cycleStart', e.target.value)} className={field} />
          </label>
        </div>
        {setup.baseType === 'monthly' && (
          <label className="flex items-center gap-3 text-white/80 text-sm">
            <input
              type="checkbox"
              checked={setup.deductAbsence}
              onChange={(e) => set('deductAbsence', e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Deduct work days they did not check in
          </label>
        )}
        {needsDays && (
          <div className="space-y-1">
            <span className="text-sm text-white/60">
              {setup.baseType === 'daily' ? 'Days they normally work' : 'Days they are expected at work'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((d, i) => {
                const n = i + 1;
                const on = setup.workDays.includes(n);
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      set('workDays', on ? setup.workDays.filter((x) => x !== n) : [...setup.workDays, n].sort())
                    }
                    className={`h-8 px-3 rounded-lg text-sm border ${on ? 'bg-primary/15 border-primary/40 text-white' : 'border-surface-dark-lighter text-white/50 hover:text-white'}`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-surface-dark-lighter">
        <button
          type="button"
          onClick={() => setSharesOpen((o) => !o)}
          aria-expanded={sharesOpen}
          className="w-full flex items-center gap-3 p-3 text-left"
        >
          <span className="material-symbols-outlined text-white/40 text-xl">{sharesOpen ? 'expand_less' : 'expand_more'}</span>
          <span className="flex-1">
            <span className="text-white font-semibold">Revenue shares</span>
            <span className="ml-2 text-white/40 text-sm">{shares.length || 'none'}</span>
            <span className="block text-white/40 text-xs">
              On top of base pay. Counted when the member pays, for whoever was assigned then; refunds and cancelled payments are left out.
            </span>
          </span>
        </button>
        {sharesOpen && (
          <div className="border-t border-surface-dark-lighter p-3 space-y-3">
            {shares.length === 0 && <p className="text-white/40 text-sm">No revenue shares.</p>}
            {shares.map((s, i) => (
              <ShareRow
                key={s.id ?? `new-${i}`}
                share={s}
                targets={targets}
                onChange={(patch) => setShare(i, patch)}
                onRemove={() => setShares((list) => list.filter((_, j) => j !== i))}
              />
            ))}
            {shares.length < 20 && (
              <button
                type="button"
                onClick={() =>
                  setShares((list) => [
                    ...list,
                    { id: null, scope: 'assigned_members', targetKind: null, targetLocalId: null, rateType: 'percent', rate: 0 },
                  ])
                }
                className="h-9 px-3 rounded-lg bg-surface-dark-lighter text-white/80 hover:text-white text-sm inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Add revenue share
              </button>
            )}
          </div>
        )}
      </section>

      {problems.length > 0 && isDirty && <p className="text-amber-300 text-sm">{problems[0]}</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex flex-wrap items-center gap-2 justify-end">
        {isDirty && <span className="mr-auto text-amber-300/80 text-xs">Unsaved changes</span>}
        {!isDirty && person.setup?.updatedByName && (
          <span className="mr-auto text-white/40 text-xs">
            Last changed by {person.setup.updatedByName} on{' '}
            {new Date(person.setup.updatedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
          </span>
        )}
        <button type="button" onClick={onCancel} className="h-10 px-4 rounded-lg bg-surface-dark-lighter text-white/80 hover:text-white">
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy || problems.length > 0 || (!isDirty && !!person.setup)}
          className="h-10 px-4 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? 'Saving…' : person.setup ? 'Save pay' : 'Put on payroll'}
        </button>
      </div>
    </form>
  );
}

function ShareRow({
  share,
  targets,
  onChange,
  onRemove,
}: {
  share: RevenueShare;
  targets: PayTargets;
  onChange: (patch: Partial<RevenueShare>) => void;
  onRemove: () => void;
}) {
  const meta = SCOPES.find((s) => s.value === share.scope)!;
  const kind: ShareTarget = meta.target ?? share.targetKind ?? 'plan';
  const options = targets[kind];
  const problem = shareProblem(share);

  return (
    <div className="rounded-lg bg-surface-dark-lighter/40 p-3 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelCls}>
          <span>Share of</span>
          <select
            value={share.scope}
            onChange={(e) => {
              const scope = e.target.value as ShareScope;
              onChange({ scope, targetKind: scope === 'service' ? 'plan' : null, targetLocalId: null });
            }}
            className={field}
          >
            {SCOPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        {meta.target ? (
          <label className={labelCls}>
            <span>For</span>
            <select
              value={share.targetLocalId ?? ''}
              onChange={(e) =>
                onChange(
                  e.target.value === ''
                    ? { targetKind: null, targetLocalId: null }
                    : { targetKind: meta.target, targetLocalId: Number(e.target.value) },
                )
              }
              className={field}
            >
              <option value="">{TARGET_LABEL[meta.target].every}</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  Only {o.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="grid grid-cols-[8rem_1fr] gap-2">
            <label className={labelCls}>
              <span>Kind</span>
              <select
                value={kind}
                onChange={(e) => onChange({ targetKind: e.target.value as ShareTarget, targetLocalId: null })}
                className={field}
              >
                {(Object.keys(TARGET_LABEL) as ShareTarget[]).map((k) => (
                  <option key={k} value={k}>
                    {TARGET_LABEL[k].one}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              <span>Which</span>
              <select
                value={share.targetLocalId ?? ''}
                onChange={(e) =>
                  onChange({ targetKind: kind, targetLocalId: e.target.value === '' ? null : Number(e.target.value) })
                }
                className={field}
              >
                <option value="">Choose…</option>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        <label className={labelCls}>
          <span>Rate</span>
          <select
            value={share.rateType}
            onChange={(e) => onChange({ rateType: e.target.value as RevenueShare['rateType'] })}
            className={field}
          >
            <option value="percent">Percentage of each payment</option>
            <option value="fixed">Fixed amount per payment</option>
          </select>
        </label>
        <label className={labelCls}>
          <span>{share.rateType === 'percent' ? 'Percent (0–100)' : 'Amount per payment (ETB)'}</span>
          <input
            type="number"
            min={0}
            max={share.rateType === 'percent' ? 100 : undefined}
            step="0.01"
            value={share.rate}
            onChange={(e) => onChange({ rate: e.target.value === '' ? ('' as unknown as number) : Number(e.target.value) })}
            className={field}
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <p className={`flex-1 text-sm ${problem ? 'text-amber-300' : 'text-emerald-300/90'}`}>
          {problem ?? share.description ?? shareWords(share, targets)}
        </p>
        <span className="text-white/40 text-xs hidden sm:block">{meta.hint}</span>
        <button type="button" onClick={onRemove} className="h-8 px-3 rounded-lg text-red-300 hover:bg-red-500/10 text-sm">
          Remove
        </button>
      </div>
    </div>
  );
}
