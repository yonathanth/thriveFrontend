'use client';

import { useEffect, useState } from 'react';
import { trainerApi, TrainerSession, ApiError } from '@/lib/api';
import { DAY_NAMES, formatTime } from '@/lib/catalog';
import { Card, ErrorNote } from '@/components/portal/membership';

export default function TrainerSchedulePage() {
  const [sessions, setSessions] = useState<TrainerSession[] | null>(null);
  const [onlyMine, setOnlyMine] = useState(true);
  const [myCheckIns, setMyCheckIns] = useState<{ id: number; scannedAt: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([trainerApi.schedule(), trainerApi.myAttendance()])
      .then(([s, a]) => {
        setSessions(s.sessions);
        setMyCheckIns(a);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load the schedule'));
  }, []);

  const shown = (sessions ?? []).filter((s) => !onlyMine || s.isMine);
  const days = [1, 2, 3, 4, 5, 6, 7].map((d) => ({ day: d, items: shown.filter((s) => s.dayOfWeek === d) }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">Schedule</h1>
          <p className="text-white/60 mt-1">The weekly timetable from the desktop app.</p>
        </div>
        <label className="inline-flex items-center gap-2 text-white/70 text-sm">
          <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
          Only my sessions
        </label>
      </div>

      {error && <ErrorNote message={error} />}

      {sessions === null && !error ? (
        <div className="h-40 bg-surface-dark rounded-xl border border-surface-dark-lighter animate-pulse" />
      ) : shown.length === 0 ? (
        <Card>
          <p className="text-white/40 text-sm">
            {onlyMine ? 'You have no sessions on the timetable.' : 'No timetable has been set up yet.'}
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {days
            .filter((d) => d.items.length > 0)
            .map((d) => (
              <Card key={d.day} title={DAY_NAMES[d.day - 1]}>
                <ul className="space-y-3">
                  {d.items.map((s) => (
                    <li
                      key={s.id}
                      className={`p-3 rounded-lg border ${
                        s.isMine ? 'border-primary/40 bg-primary/5' : 'border-surface-dark-lighter'
                      }`}
                    >
                      <p className="text-white font-medium">{s.title ?? 'Session'}</p>
                      <p className="text-white/60 text-sm">
                        {s.startTime ? formatTime(s.startTime) : '—'} – {s.endTime ? formatTime(s.endTime) : '—'}
                        {s.room ? ` · ${s.room}` : ''}
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
        </div>
      )}

      <Card title="My check-ins (last 60 days)">
        {myCheckIns.length === 0 ? (
          <p className="text-white/40 text-sm">No check-ins recorded.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-white/80 text-sm">
            {myCheckIns.map((c) => (
              <li key={c.id}>
                {new Date(c.scannedAt).toLocaleString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
