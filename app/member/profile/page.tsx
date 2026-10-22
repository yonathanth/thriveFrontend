'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Card, Detail } from '@/components/portal/membership';

const inputClass =
  'w-full h-10 px-3 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors';

/**
 * Members edit only what the website keeps for itself. Name, phone and plan come from
 * the desktop app and are changed at the front desk.
 */
export default function MemberProfilePage() {
  const { user, updateProfile } = useAuth();
  const [contactEmail, setContactEmail] = useState(user?.contactEmail ?? '');
  const [telegram, setTelegram] = useState(user?.telegramUsername ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile({ contactEmail: contactEmail.trim(), telegramUsername: telegram.trim() });
      setMessage({ ok: true, text: 'Saved.' });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Could not save' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Profile</h1>
        <p className="text-white/60 mt-1">Your sign-in and contact details.</p>
      </div>

      <Card title="From the gym's records">
        <div className="grid sm:grid-cols-2 gap-6">
          <Detail label="Name" value={user?.name} />
          <Detail label="Sign-in phone" value={user?.phone} />
        </div>
        <p className="mt-4 text-white/40 text-sm">To change these, please ask at the front desk.</p>
      </Card>

      <Card title="Contact details">
        <form onSubmit={save} className="space-y-4 max-w-md">
          <label className="block">
            <span className="block text-white/60 text-xs mb-1">Email</span>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="block text-white/60 text-xs mb-1">Telegram username</span>
            <input
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="@username"
              maxLength={100}
              className={inputClass}
            />
          </label>
          {message && <p className={`text-sm ${message.ok ? 'text-emerald-400' : 'text-red-400'}`}>{message.text}</p>}
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-4 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </Card>

      <Card title="Password">
        <p className="text-white/60 text-sm mb-4">Changing your password signs you out on other devices.</p>
        <Link
          href="/change-password"
          className="inline-flex h-10 px-4 items-center bg-surface-dark-lighter text-white/80 rounded-lg hover:text-white"
        >
          Change password
        </Link>
      </Card>
    </div>
  );
}
