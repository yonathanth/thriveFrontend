'use client';

import { useEffect, useMemo, useState } from 'react';
import { recordsApi, staffApi, DesktopRow } from '@/lib/api';
import { num, str } from '@/lib/desktop';

/** The desktop numbers days 1 = Monday … 7 = Sunday. */
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<DesktopRow[]>([]);
  const [items, setItems] = useState<DesktopRow[]>([]);
  const [staffNames, setStaffNames] = useState<Map<number, string>>(new Map());
  const [selected, setSelected] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [s, i, staff] = await Promise.all([
          recordsApi.list('schedule', { limit: 100 }),
          recordsApi.list('schedule_item', { limit: 500 }),
          // Trainer names only; the timetable still shows without them.
          staffApi.getAll({ limit: 100 }).catch(() => null),
        ]);
        setSchedules(s.data);
        setItems(i.data);
        if (staff) setStaffNames(new Map(staff.data.map((m) => [m.localId, m.fullName])));
        const main = s.data.find((x) => num(x.is_main)) ?? s.data[0];
        setSelected(main ? main.id : null);
      } catch (err) {
        console.error('Failed to fetch schedule:', err);
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const byDay = useMemo(() => {
    const own = items.filter((i) => num(i.schedule_id) === selected);
    return DAYS.map((_, idx) =>
      own
        .filter((i) => num(i.day_of_week) === idx + 1)
        .sort((a, b) => String(a.start_time ?? '').localeCompare(String(b.start_time ?? '')))
    );
  }, [items, selected]);

  const trainerOf = (i: DesktopRow) =>
    str(i.custom_trainer_name) ?? (num(i.staff_id) != null ? staffNames.get(num(i.staff_id)!) : undefined);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-white text-2xl font-bold">Schedule</h1>
        <p className="text-white/60 mt-1">The weekly class timetable, as set up in the desktop app</p>
      </div>

      {schedules.length > 1 && (
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-4">
          <select
            value={selected ?? ''}
            onChange={(e) => setSelected(Number(e.target.value))}
            className="h-10 px-4 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50"
          >
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>
                {str(s.name)}
                {num(s.is_main) ? ' (main)' : ''}
                {num(s.is_active) === 0 ? ' — inactive' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {error ? (
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-12 text-center text-white/60">
          Could not load: {error}
        </div>
      ) : isLoading ? (
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-12 animate-pulse" />
      ) : selected == null ? (
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-12 text-center text-white/60">
          No schedule yet
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4">
          {DAYS.map((day, idx) => (
            <div key={day} className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-4">
              <h2 className="text-white font-semibold mb-3">{day}</h2>
              {byDay[idx].length === 0 ? (
                <p className="text-white/30 text-sm">No classes</p>
              ) : (
                <div className="space-y-2">
                  {byDay[idx].map((i) => (
                    <div
                      key={i.id}
                      className="rounded-lg p-3 bg-surface-dark-lighter/40 border-l-4"
                      style={{ borderLeftColor: str(i.color) ?? '#3b82f6' }}
                    >
                      <p className="text-white text-sm font-medium">{str(i.title)}</p>
                      <p className="text-white/60 text-xs">
                        {str(i.start_time)} – {str(i.end_time)}
                      </p>
                      {(trainerOf(i) || str(i.room)) && (
                        <p className="text-white/40 text-xs mt-1">
                          {[trainerOf(i), str(i.room)].filter(Boolean).join(' • ')}
                        </p>
                      )}
                      {num(i.capacity) != null && (
                        <p className="text-white/40 text-xs">Capacity {num(i.capacity)}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
