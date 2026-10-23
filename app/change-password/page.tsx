'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, ArrowUpRight, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import FullScreenSpinner from '@/components/auth/FullScreenSpinner';
import AuthShell from '@/components/auth/AuthShell';
import PasswordField from '@/components/auth/PasswordField';
import { homeFor } from '@/lib/roles';

const MIN_LENGTH = 6;

/** Required after a temporary password; also supports voluntary changes. */
export default function ChangePasswordPage() {
  const { user, isAuthenticated, isLoading, changePassword, logout } = useAuth();
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login');
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !user) return <FullScreenSpinner />;
  const forced = !!user.mustChangePassword;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    setError('');
    if (next.length < MIN_LENGTH) return setError(`Use at least ${MIN_LENGTH} characters.`);
    if (next !== confirm) return setError('The new passwords do not match.');
    if (next === current) return setError('Choose a password different from the current one.');
    setIsSubmitting(true);
    try {
      const updated = await changePassword(current, next);
      router.replace(homeFor(updated.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change the password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      fullscreen
      title={<>{forced ? 'Set your' : 'Change your'} <em>password.</em></>}
      description={forced ? 'Replace your temporary password to continue to your portal.' : 'Choose a new password. Your other devices will be signed out.'}
      footer={forced ? <button type="button" onClick={() => { logout(); router.replace('/login'); }}><LogOut size={15} aria-hidden="true" />Sign out</button> : <Link href={homeFor(user.role)}><ArrowLeft size={15} aria-hidden="true" />Back to your portal</Link>}
    >
      <form onSubmit={handleSubmit} className="ta-form" aria-label="Change password" aria-busy={isSubmitting}>
        {error && <div id="password-error" className="ta-alert" role="alert"><AlertCircle size={17} aria-hidden="true" /><span>{error}</span></div>}
        <PasswordField id="current-password" name="currentPassword" label={forced ? 'Temporary password' : 'Current password'} value={current} onChange={(event) => setCurrent(event.target.value)} required autoComplete="current-password" aria-describedby={error ? 'password-error' : undefined} />
        <PasswordField id="new-password" name="newPassword" label="New password" value={next} onChange={(event) => setNext(event.target.value)} required minLength={MIN_LENGTH} autoComplete="new-password" hint={`Use at least ${MIN_LENGTH} characters, different from your current password.`} aria-describedby={error ? 'password-error' : undefined} />
        <PasswordField id="confirm-password" name="confirmPassword" label="Confirm new password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required minLength={MIN_LENGTH} autoComplete="new-password" aria-describedby={error ? 'password-error' : undefined} />
        <button type="submit" disabled={isSubmitting} className="ta-primary">{isSubmitting ? <><span className="ta-spinner" aria-hidden="true" />Saving…</> : <>Save password<ArrowUpRight size={19} aria-hidden="true" /></>}</button>
      </form>
    </AuthShell>
  );
}
