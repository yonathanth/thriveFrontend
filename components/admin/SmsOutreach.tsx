'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { smsOutreachApi, OutreachCandidate, OutreachKind } from '@/lib/api';

const DEFAULTS: Record<OutreachKind, string> = {
  absent:
    "Hi {name}, we haven't seen you at the gym for {days} days. We miss you! Come back and keep your progress going.",
  inactive:
    "Hi {name}, we miss you at the gym! It's been {days} days since your membership ended. Come back and renew, we'd love to see you again.",
};

/** Ready-made thresholds: at least this many days absent / since the membership ended. */
const PRESETS: Record<OutreachKind, { label: string; minDays: number | undefined }[]> = {
  absent: [
    { label: '3+ days', minDays: 3 },
    { label: '5+ days', minDays: 5 },
    { label: '7+ days', minDays: 7 },
    { label: '14+ days', minDays: 14 },
  ],
  inactive: [
    { label: '1+ month', minDays: 30 },
    { label: '3+ months', minDays: 90 },
    { label: 'All inactive', minDays: undefined },
  ],
};

function render(template: string, kind: OutreachKind, c: Pick<OutreachCandidate, 'fullName' | 'days' | 'serviceName'>) {
  return (template.trim() || DEFAULTS[kind])
    .replace(/\{name\}/g, c.fullName.trim())
    .replace(/\{days\}/g, String(c.days))
    .replace(/\{service\}/g, c.serviceName ?? 'your membership')
    .replace(/\{gym\}/g, 'the gym');
}

/**
 * Text members who stopped coming or whose membership ended, by hand. The gym app
 * sends these automatically on its own schedule; this is for doing it from here.
 */
export default function SmsOutreach() {
  const [kind, setKind] = useState<OutreachKind>('absent');
  const [preset, setPreset] = useState<number>(0); // index into PRESETS, or -1 for custom
  const [customMin, setCustomMin] = useState('3');
  const [customMax, setCustomMax] = useState('90');
  const [template, setTemplate] = useState('');
  const [list, setList] = useState<OutreachCandidate[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const minDays = useMemo(() => {
    if (preset >= 0) return PRESETS[kind][preset]?.minDays;
    const n = parseInt(customMin, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [kind, preset, customMin]);
  /** Only a custom range has an upper end; blank means none. */
  const maxDays = useMemo(() => {
    if (preset >= 0) return undefined;
    const n = parseInt(customMax, 10);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  }, [preset, customMax]);
  const rangeError = maxDays != null && minDays != null && maxDays < minDays;

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const rows = await smsOutreachApi.candidates(kind, minDays, maxDays);
      setList(rows);
      setSelected(new Set(rows.map((r) => r.id)));
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Failed to load members' });
    } finally {
      setLoading(false);
    }
  }, [kind, minDays, maxDays]);

  useEffect(() => {
    if (rangeError) return;
    const id = setTimeout(load, 300);
    return () => clearTimeout(id);
  }, [load, rangeError]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? list.filter((c) => c.fullName.toLowerCase().includes(q) || c.phoneNumber.includes(q)) : list;
  }, [list, search]);

  const chosen = list.filter((c) => selected.has(c.id));

  const send = async () => {
    if (chosen.length === 0) return;
    if (!window.confirm(`Send an SMS to ${chosen.length} member(s) now? This uses SMS credit.`)) return;
    setSending(true);
    setMessage(null);
    try {
      const r = await smsOutreachApi.send(kind, chosen.map((c) => c.id), minDays, template, maxDays);
      setMessage({
        ok: true,
        text: `Sent ${r.sent} message(s)${r.skipped ? `; ${r.skipped} skipped as they are no longer on the list` : ''}.`,
      });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Sending failed' });
    } finally {
      setSending(false);
    }
  };

  const chip = (active: boolean) =>
    `px-4 h-9 rounded-lg text-sm transition-colors ${
      active ? 'bg-primary text-black font-medium' : 'bg-surface-dark-lighter text-white/70 hover:text-white'
    }`;

  return (
    <div className="space-y-6">
      <div className="flex rounded-lg bg-surface-dark-lighter p-1 w-fit">
        {(['absent', 'inactive'] as const).map((k) => (
          <button
            key={k}
            onClick={() => {
              setKind(k);
              setPreset(0);
            }}
            className={`px-4 h-9 rounded-md text-sm transition-colors ${
              kind === k ? 'bg-primary text-black font-medium' : 'text-white/60 hover:text-white'
            }`}
          >
            {k === 'absent' ? 'Absent members' : 'Inactive members'}
          </button>
        ))}
      </div>

      <div>
        <p className="text-white/60 text-sm mb-3">
          {kind === 'absent'
            ? 'Active members who have not come in for at least:'
            : 'Members whose membership ended at least:'}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS[kind].map((p, i) => (
            <button key={p.label} onClick={() => setPreset(i)} className={chip(preset === i)}>
              {p.label}
            </button>
          ))}
          <button onClick={() => setPreset(-1)} className={chip(preset === -1)}>
            Custom
          </button>
          {preset === -1 && (
            <span className="flex items-center gap-2">
              <span className="text-white/60 text-sm">from</span>
              <input
                type="number"
                min={0}
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                className="w-20 h-9 px-3 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50"
              />
              <span className="text-white/60 text-sm">to</span>
              <input
                type="number"
                min={0}
                value={customMax}
                placeholder="any"
                onChange={(e) => setCustomMax(e.target.value)}
                className="w-20 h-9 px-3 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
              />
              <span className="text-white/60 text-sm">days</span>
            </span>
          )}
        </div>
        {preset === -1 && (
          <p className={`text-xs mt-2 ${rangeError ? 'text-red-400' : 'text-white/40'}`}>
            {rangeError ? 'The second number must not be smaller than the first.' : 'Leave "to" empty for no upper limit.'}
          </p>
        )}
      </div>

      <div>
        <label className="block text-white/60 text-sm mb-2">Message</label>
        <textarea
          rows={3}
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          placeholder={DEFAULTS[kind]}
          className="w-full px-4 py-3 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
        />
        <p className="text-white/40 text-xs mt-2">
          Placeholders: {'{name}'}, {'{days}'}, {'{service}'}. Leave empty for the default. Each member gets their own message.
        </p>
        <p className="text-white/70 text-sm mt-2">
          <span className="text-white/40">Preview: </span>
          {render(template, kind, list[0] ?? { fullName: 'Abebe', days: 8, serviceName: 'Monthly' })}
        </p>
      </div>

      <div className="rounded-xl border border-surface-dark-lighter overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-surface-dark-lighter">
          <p className="text-white font-medium">
            {loading ? 'Loading…' : `${list.length} member${list.length === 1 ? '' : 's'}`}
            <span className="text-white/40 font-normal text-sm"> · members without a phone number are left out</span>
          </p>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="h-9 px-3 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50"
          />
        </div>
        {filtered.length === 0 && !loading ? (
          <div className="p-10 text-center text-white/40">Nobody matches right now.</div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-dark">
                <tr className="text-white/50 text-left">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      className="accent-primary size-4"
                      checked={filtered.length > 0 && filtered.every((c) => selected.has(c.id))}
                      onChange={(e) => {
                        const next = new Set(selected);
                        filtered.forEach((c) => (e.target.checked ? next.add(c.id) : next.delete(c.id)));
                        setSelected(next);
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">{kind === 'absent' ? 'Days since visit' : 'Days inactive'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-dark-lighter">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-dark-lighter/40">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="accent-primary size-4"
                        checked={selected.has(c.id)}
                        onChange={() => {
                          const next = new Set(selected);
                          if (next.has(c.id)) next.delete(c.id);
                          else next.add(c.id);
                          setSelected(next);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-white">{c.fullName}</td>
                    <td className="px-4 py-3 text-white/70 font-mono">{c.phoneNumber}</td>
                    <td className="px-4 py-3 text-white/60">{c.serviceName ?? '—'}</td>
                    <td className="px-4 py-3 text-amber-300 font-medium">{c.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-white/60 text-sm">{chosen.length} selected</p>
          {message && <p className={`text-sm mt-1 ${message.ok ? 'text-emerald-400' : 'text-red-400'}`}>{message.text}</p>}
        </div>
        <button
          onClick={send}
          disabled={sending || chosen.length === 0}
          className="px-6 py-3 bg-primary text-black rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50"
        >
          {sending ? 'Sending…' : `Send to ${chosen.length} member${chosen.length === 1 ? '' : 's'}`}
        </button>
      </div>
    </div>
  );
}
