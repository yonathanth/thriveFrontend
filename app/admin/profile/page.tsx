'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@/lib/roles';
import { Card, Detail } from '@/components/portal/membership';

const inputClass =
  'w-full h-10 px-3 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors';

export default function AdminProfilePage() {
  const { user, updateProfile, logout } = useAuth();

  const canEditEmail = user?.role === 'admin';
  const roleLabel = user ? ROLE_LABELS[user.role] : 'Administrator';

  const [email, setEmail] = useState(user?.email ?? '');
  const [contactEmail, setContactEmail] = useState(user?.contactEmail ?? '');
  const [telegram, setTelegram] = useState(user?.telegramUsername ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email ?? '');
      setContactEmail(user.contactEmail ?? '');
      setTelegram(user.telegramUsername ?? '');
    }
  }, [user]);

  const emailChanged = canEditEmail && email.trim() !== (user?.email ?? '');

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (emailChanged && !currentPassword) {
      setMessage({ ok: false, text: 'Current password is required to change your primary sign-in email.' });
      setSaving(false);
      return;
    }

    try {
      await updateProfile({
        email: canEditEmail ? email.trim() || undefined : undefined,
        contactEmail: contactEmail.trim(),
        telegramUsername: telegram.trim(),
        currentPassword: emailChanged ? currentPassword : undefined,
      });
      setCurrentPassword('');
      setMessage({ ok: true, text: 'Profile updated successfully.' });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'Could not save changes' });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Profile</h1>
        <p className="text-white/60 mt-1">Your sign-in and contact details.</p>
      </div>

      {/* Account Overview */}
      <Card title="From the gym's records">
        <div className="grid sm:grid-cols-3 gap-6">
          <Detail label="Name" value={user?.name} />
          <Detail
            label={user?.role === 'manager' ? 'Sign-in phone' : 'Sign-in email'}
            value={user?.role === 'manager' ? user.phone : user?.email}
          />
          <Detail
            label="Role"
            value={
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {roleLabel}
              </span>
            }
          />
        </div>
        <p className="mt-4 text-white/40 text-sm">To change these, please ask at the front desk.</p>
      </Card>

      {/* Profile & Contact Details */}
      <Card title="Contact details">
        <form onSubmit={save} className="space-y-4 max-w-md">
          {canEditEmail ? (
            <label className="block">
              <span className="block text-white/60 text-xs mb-1">Sign-in Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@thrive.et"
                required
                className={inputClass}
              />
            </label>
          ) : (
            <div>
              <span className="block text-white/60 text-xs mb-1">Sign-in Phone</span>
              <input
                type="text"
                value={user?.phone ?? ''}
                disabled
                className={`${inputClass} opacity-60 cursor-not-allowed`}
              />
              <p className="text-white/40 text-xs mt-1">Manager sign-in phones are updated by the system administrator.</p>
            </div>
          )}

          <label className="block">
            <span className="block text-white/60 text-xs mb-1">Contact Email (optional)</span>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="block text-white/60 text-xs mb-1">Telegram username (optional)</span>
            <input
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="@username"
              maxLength={100}
              className={inputClass}
            />
          </label>

          {emailChanged && (
            <label className="block p-3 rounded-lg border border-primary/20 bg-primary/5">
              <span className="block text-white/80 text-xs mb-1 font-medium">Confirm Current Password</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                required
                className={inputClass}
              />
              <span className="block text-white/40 text-xs mt-1">Required to change your sign-in email.</span>
            </label>
          )}

          {message && (
            <p className={`text-sm ${message.ok ? 'text-emerald-400' : 'text-red-400'}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="h-10 px-5 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </Card>

      {/* Password Management */}
      <Card title="Password">
        <p className="text-white/60 text-sm mb-4">
          Changing your password will sign you out of all other active sessions and devices.
        </p>
        <Link
          href="/change-password"
          className="inline-flex h-10 px-4 items-center gap-2 bg-surface-dark-lighter text-white/90 rounded-lg hover:text-white hover:bg-surface-dark-lighter/80 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">key</span>
          Change password
        </Link>
      </Card>

      {/* Session Management */}
      <Card title="Session">
        <p className="text-white/60 text-sm mb-4">
          End your session on this device.
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex h-10 px-4 items-center gap-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Sign out of panel
        </button>
      </Card>
    </div>
  );
}
