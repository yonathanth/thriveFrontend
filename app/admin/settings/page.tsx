'use client';

import { useEffect, useState } from 'react';
import { siteSettingsApi } from '@/lib/api';
import RequireRole from '@/components/auth/RequireRole';
import { formatFinanceDate, notifyFinanceStartChanged } from '@/components/admin/FinanceFromTag';
import Icon from '@/components/ui/Icon';

/** Website settings (admins). The desktop app keeps its own, separate settings. */
export default function SettingsPage() {
  return (
    <RequireRole roles={['admin']}>
      <div className="space-y-8">
        <div>
          <h1 className="text-white text-2xl font-bold">Settings</h1>
          <p className="text-white/60 mt-1">Website settings. The gym app has its own, set in the app.</p>
        </div>
        <FinanceStartCard />
      </div>
    </RequireRole>
  );
}

function FinanceStartCard() {
  const [saved, setSaved] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    siteSettingsApi
      .financeStart()
      .then((r) => {
        setSaved(r.date);
        setValue(r.date ?? '');
      })
      .catch(() => undefined);
  }, []);

  const save = async (date: string | null) => {
    setBusy(true);
    setMessage(null);
    try {
      const r = await siteSettingsApi.setFinanceStart(date);
      setSaved(r.date);
      setValue(r.date ?? '');
      notifyFinanceStartChanged();
      setMessage({
        ok: true,
        text: r.date ? `Finances are now counted from ${formatFinanceDate(r.date)}.` : 'Every record counts again.',
      });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Could not save' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
      <div className="flex items-start gap-3">
        <Icon name="event" className="text-primary" />
        <div className="flex-1">
          <h2 className="text-white font-semibold">Count finances from</h2>
          <p className="text-white/60 text-sm mt-1 max-w-2xl">
            For example the day the gym app really started being used. Payments and expenses before this date are left
            out of the dashboard, transactions, inventory sales and payment histories on this website. Nothing is deleted:
            clear the date to see everything again. The gym app has its own setting.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label htmlFor="finance-start" className="sr-only">
              Start date
            </label>
            <input
              id="finance-start"
              type="date"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-10 px-3 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50"
            />
            <button
              onClick={() => save(value)}
              disabled={busy || !value || value === saved}
              className="h-10 px-4 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
            {saved && (
              <button
                onClick={() => save(null)}
                disabled={busy}
                className="h-10 px-4 bg-surface-dark-lighter text-white/80 rounded-lg hover:text-white disabled:opacity-50"
              >
                Clear (count everything)
              </button>
            )}
          </div>
          <p className={`mt-2 text-sm ${message ? (message.ok ? 'text-emerald-400' : 'text-red-400') : 'text-white/40'}`}>
            {message?.text ?? (saved ? `Now counting from ${formatFinanceDate(saved)}` : 'Now counting every record')}
          </p>
        </div>
      </div>
    </div>
  );
}
