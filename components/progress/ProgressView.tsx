'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, progressApi, ProgressData, ProgressMeasurement, ProgressPhoto } from '@/lib/api';
import {
  compressImage,
  formatMeasure,
  GOAL_KEYS,
  HEADLINE_FIELDS,
  MeasureDef,
  MEASURES,
  rangeStatus,
  RangeStatus,
  shown,
  Standard,
} from '@/lib/progress';

const STATUS_STYLE: Record<RangeStatus, string> = {
  Low: 'bg-amber-400/10 text-amber-300',
  Healthy: 'bg-emerald-400/10 text-emerald-300',
  High: 'bg-amber-400/10 text-amber-300',
  Excellent: 'bg-sky-400/10 text-sky-300',
};
const STATUS_STROKE: Record<RangeStatus, string> = {
  Low: '#fbbf24',
  Healthy: '#34d399',
  High: '#fbbf24',
  Excellent: '#38bdf8',
};
const INTERVALS = [
  { days: 7, label: 'Every week' },
  { days: 14, label: 'Every 2 weeks' },
  { days: 28, label: 'Every 4 weeks' },
  { days: 30, label: 'Every month' },
];

const day = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return <div className="h-7" />;
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const points = values
    .map((v, i) => `${((i / (values.length - 1)) * 120).toFixed(1)},${(25 - ((v - min) / span) * 22).toFixed(1)}`)
    .join(' ');
  return (
    <svg className="h-7 w-full" viewBox="0 0 120 28" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** A photo the signed-in account may see, fetched with its sign-in. */
function Photo({ id, size, className, onClick }: { id: number; size: 'thumb' | 'full'; className?: string; onClick?: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let made: string | null = null;
    progressApi
      .photoUrl(id, size)
      .then((u) => {
        made = u;
        setUrl(u);
      })
      .catch(() => setUrl(null));
    return () => {
      if (made) URL.revokeObjectURL(made);
    };
  }, [id, size]);
  if (!url) return <div className={`bg-white/5 animate-pulse ${className ?? ''}`} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a private, signed-in photo, not a static asset
    <img src={url} alt="Progress photo" className={className} onClick={onClick} />
  );
}

/**
 * Progress for a member: headline measures with trends and goals, the check schedule,
 * and every measurement with its photos. Members add and share their own photos.
 */
export default function ProgressView({ memberId }: { memberId: number | 'me' }) {
  const [data, setData] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<number | null>(null);
  const isMember = memberId === 'me';

  // Bumped to load again after a change.
  const [version, setVersion] = useState(0);
  const load = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let alive = true;
    (memberId === 'me' ? progressApi.mine() : progressApi.ofMember(memberId))
      .then((d) => {
        if (!alive) return;
        setData(d);
        setError(null);
      })
      .catch((err) => alive && setError(err instanceof ApiError ? err.message : 'Could not load progress'));
    return () => {
      alive = false;
    };
  }, [memberId, version]);

  if (error) return <p className="text-red-400 text-sm">{error}</p>;
  if (!data) return <div className="h-40 rounded-xl bg-surface-dark animate-pulse" />;

  const ms = data.measurements;
  const standards = data.standards as unknown as Standard[];
  const headline = MEASURES.filter((d) => HEADLINE_FIELDS.includes(d.field) && ms.some((m) => m[d.field] != null));

  return (
    <div className="space-y-6">
      {ms.length === 0 ? (
        <p className="text-white/50 text-sm">
          No measurements yet. {isMember ? 'Ask at the front desk to get measured.' : 'They are recorded in the gym app.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {headline.map((def) => (
            <HeadlineCard
              key={def.field}
              def={def}
              measurements={ms}
              status={rangeStatus(standards, def.key, ms.at(-1)?.[def.field] ?? null, data.member.gender, data.member.age)}
              goal={data.goals.find((g) => g.metric === def.key)}
              memberId={isMember ? 'me' : data.member.id}
              onChanged={load}
            />
          ))}
        </div>
      )}

      <Schedule data={data} onChanged={load} />

      {ms.length > 0 && (
        <div className="rounded-xl border border-surface-dark-lighter overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-dark-lighter">
            <h3 className="text-white font-semibold">Measurements</h3>
            {isMember && (
              <p className="text-white/40 text-xs mt-0.5">
                Add photos to a measurement to see your change. You choose who else can see each one.
              </p>
            )}
          </div>
          <ul className="divide-y divide-surface-dark-lighter">
            {[...ms].reverse().map((m) => (
              <MeasurementRow
                key={m.id}
                m={m}
                photos={data.photos.filter((p) => p.healthMetricId === m.id)}
                isMember={isMember}
                onChanged={load}
                onView={setViewing}
              />
            ))}
          </ul>
        </div>
      )}

      {viewing != null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setViewing(null)}
          role="dialog"
          aria-label="Photo"
        >
          <Photo id={viewing} size="full" className="max-h-[90vh] max-w-full rounded-lg object-contain" />
          <button
            className="absolute top-4 right-4 size-10 rounded-full bg-white/10 text-white flex items-center justify-center"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}
    </div>
  );
}

function HeadlineCard({
  def,
  measurements,
  status,
  goal,
  memberId,
  onChanged,
}: {
  def: MeasureDef;
  measurements: ProgressMeasurement[];
  status: RangeStatus | null;
  goal?: { target: number; setByName: string | null };
  memberId: number | 'me';
  onChanged: () => void;
}) {
  const series = measurements.map((m) => shown(def, m[def.field])).filter((v): v is number => v != null);
  const current = series.at(-1) ?? null;
  const [editing, setEditing] = useState(false);
  const [target, setTarget] = useState(goal ? String(goal.target) : '');
  const change = (from: number | undefined) => {
    if (from == null || current == null) return null;
    const d = Math.round((current - from) * 10 ** def.decimals) / 10 ** def.decimals;
    return `${d > 0 ? '+' : d < 0 ? '−' : '±'}${formatMeasure(def, Math.abs(d))}`;
  };
  // Progress toward the goal, from where the member started.
  const start = series[0];
  const pct =
    goal && current != null && start != null && start !== goal.target
      ? Math.max(0, Math.min(100, ((start - current) / (start - goal.target)) * 100))
      : null;
  const saveGoal = async (value: number | null) => {
    await progressApi.setGoal(memberId, def.key, value);
    setEditing(false);
    onChanged();
  };

  return (
    <div className="rounded-xl border border-surface-dark-lighter bg-surface-dark p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-white/60 text-sm font-medium">{def.label}</span>
        {status && <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}>{status}</span>}
      </div>
      <div className="text-white text-2xl font-bold">{formatMeasure(def, current)}</div>
      <Sparkline values={series} color={status ? STATUS_STROKE[status] : '#94a3b8'} />
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
        {change(series.at(-2)) && (
          <span>
            Since last <strong className="text-white/80 font-semibold">{change(series.at(-2))}</strong>
          </span>
        )}
        {series.length > 2 && (
          <span>
            Since start <strong className="text-white/80 font-semibold">{change(series[0])}</strong>
          </span>
        )}
      </div>
      {GOAL_KEYS.includes(def.key) &&
        (editing ? (
          <div className="flex gap-2 pt-1">
            <input
              type="number"
              step="0.1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              aria-label={`${def.label} goal`}
              placeholder={def.unit ? `Goal (${def.unit})` : 'Goal'}
              className="w-24 h-8 px-2 rounded-md bg-surface-dark-lighter border border-surface-dark-lighter text-white text-sm"
            />
            <button
              onClick={() => target.trim() && saveGoal(Number(target))}
              className="h-8 px-3 rounded-md bg-primary text-black text-sm font-medium"
            >
              Save
            </button>
            {goal && (
              <button onClick={() => saveGoal(null)} className="h-8 px-2 rounded-md text-white/60 text-sm">
                Remove
              </button>
            )}
          </div>
        ) : goal ? (
          <button onClick={() => setEditing(true)} className="w-full text-left pt-1" title="Change the goal">
            <div className="flex justify-between text-xs text-white/50">
              <span>Goal {formatMeasure(def, goal.target)}</span>
              {pct != null && <span>{Math.round(pct)}%</span>}
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${pct ?? 0}%` }} />
            </div>
          </button>
        ) : (
          <button onClick={() => setEditing(true)} className="text-xs text-primary pt-1">
            + Set a goal
          </button>
        ))}
    </div>
  );
}

function Schedule({ data, onChanged }: { data: ProgressData; onChanged: () => void }) {
  const s = data.schedule;
  const overdue = s?.nextDue ? new Date(s.nextDue) <= new Date() : false;
  const text = s
    ? `${INTERVALS.find((i) => i.days === s.intervalDays)?.label ?? `Every ${s.intervalDays} days`}${
        s.nextDue ? ` · next ${overdue ? 'was due' : 'due'} ${day(s.nextDue)}` : ''
      }${s.setByName ? ` · set by ${s.setByName}` : ''}`
    : 'No regular checks set';
  return (
    <div className="rounded-xl border border-surface-dark-lighter bg-surface-dark p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-primary">event_repeat</span>
        <div>
          <p className="text-white font-medium">Progress checks</p>
          <p className={`text-sm ${overdue ? 'text-amber-300' : 'text-white/50'}`}>{text}</p>
        </div>
      </div>
      {data.canSetSchedule && (
        <select
          aria-label="How often to check progress"
          value={s?.intervalDays ?? ''}
          onChange={async (e) => {
            await progressApi.setSchedule(data.member.id, e.target.value ? Number(e.target.value) : null);
            onChanged();
          }}
          className="h-10 px-3 rounded-lg bg-surface-dark-lighter border border-surface-dark-lighter text-white text-sm"
        >
          <option value="">No reminders</option>
          {INTERVALS.map((i) => (
            <option key={i.days} value={i.days}>
              {i.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function MeasurementRow({
  m,
  photos,
  isMember,
  onChanged,
  onView,
}: {
  m: ProgressMeasurement;
  photos: ProgressPhoto[];
  isMember: boolean;
  onChanged: () => void;
  onView: (id: number) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [share, setShare] = useState({ trainer: false, staff: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const values = useMemo(
    () =>
      MEASURES.filter((d) => m[d.field] != null)
        .slice(0, 5)
        .map((d) => `${d.label} ${formatMeasure(d, shown(d, m[d.field]))}`),
    [m],
  );

  const upload = async (f: File) => {
    setBusy(true);
    setError(null);
    try {
      const [image, thumb] = await Promise.all([compressImage(f, 1600), compressImage(f, 400, 0.75)]);
      await progressApi.addPhoto({
        healthMetricId: m.id,
        image,
        thumb,
        visibleToTrainer: share.trainer,
        visibleToStaff: share.staff,
      });
      setAdding(false);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-white font-medium">{day(m.measuredAt)}</p>
          <p className="text-white/50 text-sm">{values.join(' · ')}</p>
        </div>
        {isMember && photos.length < 5 && !adding && (
          <button onClick={() => setAdding(true)} className="self-start h-9 px-3 rounded-lg bg-surface-dark-lighter text-white/80 text-sm hover:text-white">
            <span className="material-symbols-outlined text-base align-middle mr-1">add_a_photo</span>
            Add photo
          </button>
        )}
      </div>

      {adding && (
        <div className="rounded-lg bg-surface-dark-lighter/50 p-3 space-y-3">
          <p className="text-white/70 text-sm">Who else can see it? (You always can.)</p>
          <div className="flex flex-wrap gap-4 text-sm text-white/80">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-primary size-4" checked={share.trainer} onChange={(e) => setShare({ ...share, trainer: e.target.checked })} />
              My trainer
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-primary size-4" checked={share.staff} onChange={(e) => setShare({ ...share, staff: e.target.checked })} />
              Gym staff (admins and managers)
            </label>
          </div>
          <input
            ref={file}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
          <div className="flex gap-2">
            <button disabled={busy} onClick={() => file.current?.click()} className="h-9 px-4 rounded-lg bg-primary text-black text-sm font-medium disabled:opacity-50">
              {busy ? 'Uploading…' : 'Choose photo'}
            </button>
            <button disabled={busy} onClick={() => setAdding(false)} className="h-9 px-3 rounded-lg text-white/60 text-sm">
              Cancel
            </button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      )}

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {photos.map((p) => (
            <div key={p.id} className="w-28 space-y-1">
              <Photo id={p.id} size="thumb" className="h-28 w-28 rounded-lg object-cover cursor-zoom-in" onClick={() => onView(p.id)} />
              {isMember && <PhotoSharing photo={p} onChanged={onChanged} />}
            </div>
          ))}
        </div>
      )}
    </li>
  );
}

/** The member's choice of who else sees a photo, and removing it. */
function PhotoSharing({ photo, onChanged }: { photo: ProgressPhoto; onChanged: () => void }) {
  const set = async (trainer: boolean, staff: boolean) => {
    await progressApi.setVisibility(photo.id, trainer, staff);
    onChanged();
  };
  return (
    <div className="text-[11px] text-white/60 space-y-0.5">
      <label className="flex items-center gap-1">
        <input type="checkbox" className="accent-primary size-3" checked={!!photo.visibleToTrainer} onChange={(e) => set(e.target.checked, !!photo.visibleToStaff)} />
        Trainer
      </label>
      <label className="flex items-center gap-1">
        <input type="checkbox" className="accent-primary size-3" checked={!!photo.visibleToStaff} onChange={(e) => set(!!photo.visibleToTrainer, e.target.checked)} />
        Staff
      </label>
      <button
        onClick={async () => {
          if (!window.confirm('Delete this photo?')) return;
          await progressApi.deletePhoto(photo.id);
          onChanged();
        }}
        className="text-red-300 hover:text-red-200"
      >
        Delete
      </button>
    </div>
  );
}
