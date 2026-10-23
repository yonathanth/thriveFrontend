'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { smsApi, smsOutreachApi, OutreachCandidate, OutreachKind } from '@/lib/api';
import { smsCount } from '@/lib/sms';

/** Ready-made ranges for each list; `days` means something different per list. */
const LISTS: {
  kind: OutreachKind;
  label: string;
  hint: string;
  column: string;
  presets: { label: string; minDays?: number; maxDays?: number }[];
}[] = [
  { kind: 'all', label: 'All members', hint: 'Every member with a phone number.', column: 'Days left', presets: [] },
  { kind: 'active', label: 'Active', hint: 'Members whose membership is active.', column: 'Days left', presets: [] },
  {
    kind: 'expiring',
    label: 'Expiring soon',
    hint: 'Active members whose membership ends within:',
    column: 'Days left',
    presets: [
      { label: '3 days', minDays: 0, maxDays: 3 },
      { label: '7 days', minDays: 0, maxDays: 7 },
      { label: '14 days', minDays: 0, maxDays: 14 },
    ],
  },
  {
    kind: 'absent',
    label: 'Absent',
    hint: 'Active members who have not come in for at least:',
    column: 'Days since visit',
    presets: [
      { label: '3+ days', minDays: 3 },
      { label: '7+ days', minDays: 7 },
      { label: '14+ days', minDays: 14 },
    ],
  },
  {
    kind: 'inactive',
    label: 'Inactive',
    hint: 'Members whose membership ended at least:',
    column: 'Days inactive',
    presets: [
      { label: '1+ month', minDays: 30 },
      { label: '3+ months', minDays: 90 },
      { label: 'All', minDays: undefined },
    ],
  },
];

const TAGS = ['{name}', '{service}', '{expiry_date}', '{days_left}', '{days}'];

type Recipient = Pick<OutreachCandidate, 'fullName' | 'days' | 'daysLeft' | 'expiryDate' | 'serviceName'>;

const SAMPLE: Recipient = { fullName: 'Abebe', days: 8, daysLeft: 3, expiryDate: '2026-10-26', serviceName: 'Monthly' };

function fill(template: string, c: Recipient): string {
  return template
    .replace(/\{name\}/g, c.fullName.trim())
    .replace(/\{days\}/g, String(c.days))
    .replace(/\{days_left\}/g, c.daysLeft == null ? '' : String(Math.max(c.daysLeft, 0)))
    .replace(/\{expiry_date\}/g, c.expiryDate ?? '')
    .replace(/\{service\}/g, c.serviceName ?? 'your membership')
    .replace(/\{gym\}/g, 'the gym');
}

/**
 * Text many people at once, by hand: pick a member list (or type numbers), choose who
 * gets it, and send either the same message to all or a personalized one with each
 * member's details filled in.
 */
export default function SmsGroupSend({ personalized }: { personalized: boolean }) {
  const [kind, setKind] = useState<OutreachKind | 'typed'>(personalized ? 'expiring' : 'active');
  const [preset, setPreset] = useState(1); // index into the list's presets, or -1 for custom
  const [customMin, setCustomMin] = useState('0');
  const [customMax, setCustomMax] = useState('');
  const [typed, setTyped] = useState('');
  const [text, setText] = useState('');
  const [list, setList] = useState<OutreachCandidate[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const def = LISTS.find((l) => l.kind === kind);
  const presets = useMemo(() => def?.presets ?? [], [def]);

  const { minDays, maxDays } = useMemo(() => {
    if (!presets.length) return { minDays: undefined, maxDays: undefined };
    if (preset >= 0) return presets[Math.min(preset, presets.length - 1)];
    const num = (v: string) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) && n >= 0 ? n : undefined;
    };
    return { minDays: num(customMin) ?? 0, maxDays: num(customMax) };
  }, [presets, preset, customMin, customMax]);
  const rangeError = maxDays != null && minDays != null && maxDays < minDays;

  const load = useCallback(async () => {
    if (kind === 'typed') return;
    setLoading(true);
    setResult(null);
    try {
      const rows = await smsOutreachApi.candidates(kind, minDays, maxDays);
      setList(rows);
      setSelected(new Set(rows.map((r) => r.id)));
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : 'Failed to load members' });
    } finally {
      setLoading(false);
    }
  }, [kind, minDays, maxDays]);

  useEffect(() => {
    if (rangeError || kind === 'typed') return;
    const id = setTimeout(load, 300);
    return () => clearTimeout(id);
  }, [load, rangeError, kind]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? list.filter((c) => c.fullName.toLowerCase().includes(q) || c.phoneNumber.includes(q)) : list;
  }, [list, search]);

  const chosen = kind === 'typed' ? [] : list.filter((c) => selected.has(c.id));
  const typedNumbers = useMemo(
    () => [...new Set(typed.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean))],
    [typed],
  );
  const count = kind === 'typed' ? typedNumbers.length : chosen.length;
  const preview = personalized ? fill(text, chosen[0] ?? SAMPLE) : text;
  const sms = smsCount(preview);

  const send = async () => {
    if (count === 0 || !text.trim()) return;
    if (!window.confirm(`Send an SMS to ${count} ${count === 1 ? 'person' : 'people'} now? This uses SMS credit.`)) return;
    setSending(true);
    setResult(null);
    try {
      const r =
        kind === 'typed'
          ? { ...(await smsApi.sendBulk(typedNumbers, text.trim())), skipped: 0 }
          : personalized
            ? await smsOutreachApi.send(kind, chosen.map((c) => c.id), minDays, text.trim(), maxDays)
            : {
                ...(await smsApi.sendPersonalized(
                  chosen.map((c) => ({ phone: c.phoneNumber, message: text.trim(), memberId: c.id })),
                )),
                skipped: 0,
              };
      const parts = [`Sent ${r.sent}`];
      if (r.failed) parts.push(`failed ${r.failed}${r.firstError ? ` (${r.firstError})` : ''}`);
      if (r.skipped) parts.push(`${r.skipped} skipped as no longer on the list`);
      setResult({
        ok: r.failed === 0,
        text: `${parts.join(', ')}.${r.failed ? ' Each reason is in History.' : ''}`,
      });
      if (r.failed === 0) setText('');
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : 'Sending failed' });
    } finally {
      setSending(false);
    }
  };

  const chip = (active: boolean) =>
    `px-4 h-9 rounded-lg text-sm transition-colors ${
      active ? 'bg-primary text-black font-medium' : 'bg-surface-dark-lighter text-white/70 hover:text-white'
    }`;
  const input =
    'h-9 px-3 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50';

  return (
    <div className="space-y-6">
      {/* Who */}
      <div>
        <p className="text-white/60 text-sm mb-2">Send to</p>
        <div className="flex flex-wrap gap-2">
          {LISTS.map((l) => (
            <button
              key={l.kind}
              onClick={() => {
                setKind(l.kind);
                setPreset(l.presets.length > 1 ? 1 : 0);
              }}
              className={chip(kind === l.kind)}
            >
              {l.label}
            </button>
          ))}
          {!personalized && (
            <button onClick={() => setKind('typed')} className={chip(kind === 'typed')}>
              Type numbers
            </button>
          )}
        </div>
      </div>

      {kind !== 'typed' && def && (
        <div>
          <p className="text-white/60 text-sm mb-3">{def.hint}</p>
          {presets.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {presets.map((p, i) => (
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
                  <input type="number" min={0} value={customMin} onChange={(e) => setCustomMin(e.target.value)} className={`w-20 ${input}`} />
                  <span className="text-white/60 text-sm">to</span>
                  <input
                    type="number"
                    min={0}
                    value={customMax}
                    placeholder="any"
                    onChange={(e) => setCustomMax(e.target.value)}
                    className={`w-20 ${input}`}
                  />
                  <span className="text-white/60 text-sm">days</span>
                </span>
              )}
            </div>
          )}
          {rangeError && <p className="text-xs mt-2 text-red-400">The second number must not be smaller than the first.</p>}
        </div>
      )}

      {kind === 'typed' ? (
        <div>
          <label className="block text-white/60 text-sm mb-2">Phone numbers</label>
          <textarea
            rows={4}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="0911234567, 0922345678 (one per line or separated by commas)"
            className="w-full px-4 py-3 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 font-mono text-sm"
          />
          <p className="text-white/40 text-xs mt-2">
            {typedNumbers.length} number{typedNumbers.length === 1 ? '' : 's'}. Ethio Telecom numbers only (09…); Safaricom
            numbers (07…) are skipped.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-surface-dark-lighter overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-surface-dark-lighter">
            <p className="text-white font-medium">
              {loading ? 'Loading…' : `${list.length} member${list.length === 1 ? '' : 's'}`}
              <span className="text-white/40 font-normal text-sm"> · members without a phone number are left out</span>
            </p>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className={input} />
          </div>
          {filtered.length === 0 && !loading ? (
            <div className="p-10 text-center text-white/40">Nobody matches right now.</div>
          ) : (
            <div className="max-h-[420px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-surface-dark">
                  <tr className="text-white/50 text-left">
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        aria-label="Select all"
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
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Plan</th>
                    <th className="px-4 py-3 font-medium">{def?.column}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-dark-lighter">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-dark-lighter/40">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${c.fullName}`}
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
                      <td className="px-4 py-3 text-white/60 hidden sm:table-cell">{c.serviceName ?? '—'}</td>
                      <td className="px-4 py-3 text-amber-300 font-medium">{c.days}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Message */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <label className="text-white/60 text-sm">Message</label>
          {personalized &&
            TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setText((t) => `${t}${t && !t.endsWith(' ') ? ' ' : ''}${tag}`)}
                className="px-2 h-7 rounded-md text-xs bg-surface-dark-lighter text-white/70 hover:text-white"
              >
                +{tag}
              </button>
            ))}
        </div>
        <textarea
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          placeholder={personalized ? 'Hi {name}, your {service} membership ends on {expiry_date}…' : 'Write the message everyone will get…'}
          className="w-full px-4 py-3 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
        />
        <p className={`text-xs mt-2 ${sms.parts > 1 || sms.unicode ? 'text-amber-300' : 'text-white/40'}`}>
          About {sms.chars} characters, {sms.parts} SMS per person
          {sms.unicode ? ' (Amharic, emoji or special characters: 70 characters per SMS)' : ''}.
        </p>
        {personalized && text.trim() && (
          <p className="text-white/70 text-sm mt-2">
            <span className="text-white/40">Preview{chosen[0] ? ` for ${chosen[0].fullName.trim()}` : ''}: </span>
            {preview}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-white/60 text-sm">{count} selected</p>
          {result && <p className={`text-sm mt-1 ${result.ok ? 'text-emerald-400' : 'text-red-400'}`}>{result.text}</p>}
        </div>
        <button
          onClick={send}
          disabled={sending || count === 0 || !text.trim() || rangeError}
          className="px-6 py-3 bg-primary text-black rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50"
        >
          {sending ? 'Sending…' : `Send to ${count} ${count === 1 ? 'person' : 'people'}`}
        </button>
      </div>
    </div>
  );
}
