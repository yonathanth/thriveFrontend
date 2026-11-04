'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthShell from './AuthShell';
import PasswordField from './PasswordField';

/** Sign-in for every role: phone number (anyone) or email (admins). */
export default function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      // Signing in updates the shared session; the login page then takes the user on.
      // Navigating from here too raced that redirect and could leave both cancelled.
      await login(identifier, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell fullscreen title={<>Welcome <em>back.</em></>} description="Sign in to your Thrive account.">
      <form className="ta-form" onSubmit={handleSubmit} aria-label="Sign in" aria-busy={isSubmitting}>
        {error && <div id="login-error" className="ta-alert" role="alert"><AlertCircle size={17} aria-hidden="true" /><span>{error}</span></div>}
        <div className="ta-field">
          <label htmlFor="identifier">Phone number or email</label>
          <input id="identifier" name="identifier" type="text" value={identifier} onChange={(event) => setIdentifier(event.target.value)} required autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="Your phone number or email" aria-describedby={error ? 'login-error' : undefined} />
        </div>
        <PasswordField id="password" name="password" label="Password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" placeholder="Enter your password" aria-describedby={error ? 'login-error' : undefined} />
        <Link className="ta-forgot" href="/forgot-password">Forgot password?</Link>
        <button type="submit" disabled={isSubmitting} className="ta-primary">
          {isSubmitting ? <><span className="ta-spinner" aria-hidden="true" />Signing in…</> : <>Sign in<ArrowUpRight size={19} aria-hidden="true" /></>}
        </button>
      </form>
      <div className="ta-join"><span>Not a member yet?</span><Link href="/join" className="ta-secondary">Join now<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    </AuthShell>
  );
}
