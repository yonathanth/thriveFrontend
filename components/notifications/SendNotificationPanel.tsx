'use client';

import { useEffect, useState } from 'react';
import { MESSAGE_AUDIENCE_LABELS, MessageAudience, notificationsApi } from '@/lib/api';
import { notifyNotificationsChanged } from '@/lib/notifications';

const AUDIENCES = Object.keys(MESSAGE_AUDIENCE_LABELS) as MessageAudience[];

/**
 * Admins and managers write a message to members, trainers or staff. It appears in
 * their notifications and is pushed to their devices; each send is in the audit log.
 */
export default function SendNotificationPanel() {
  const [open, setOpen] = useState(false);
  const [audience, setAudience] = useState<MessageAudience>('active_members');
  const [count, setCount] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setCount(null);
    notificationsApi
      .audience(audience)
      .then((r) => alive && setCount(r.count))
      .catch(() => alive && setCount(null));
    return () => {
      alive = false;
    };
  }, [audience, open]);

  const send = async () => {
    if (!title.trim() || !body.trim()) return;
    const who = MESSAGE_AUDIENCE_LABELS[audience].toLowerCase();
    if (!window.confirm(`Send "${title.trim()}" to ${count ?? 'all'} ${count === 1 ? 'person' : 'people'} (${who})?`)) return;
    setSending(true);
    setResult(null);
    try {
      const r = await notificationsApi.send({ title: title.trim(), body: body.trim(), audience });
      setResult({ ok: true, text: `Sent to ${r.recipients} ${r.recipients === 1 ? 'person' : 'people'}.` });
      setTitle('');
      setBody('');
      notifyNotificationsChanged();
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : 'Sending failed' });
    } finally {
      setSending(false);
    }
  };

  const field =
    'w-full px-4 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50';

  return (
    <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary">campaign</span>
          <div>
            <h2 className="text-white font-semibold">Send a notification</h2>
            <p className="text-white/60 text-sm mt-1">
              A message to members, trainers or staff: it appears in their notifications and on their phones if they
              turned push on.
            </p>
          </div>
        </div>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="h-10 px-4 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 shrink-0"
          >
            Write a message
          </button>
        )}
      </div>

      {open && (
        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="notify-audience" className="block text-white/60 text-sm mb-2">
              Send to
            </label>
            <select
              id="notify-audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value as MessageAudience)}
              className={`${field} h-10`}
            >
              {AUDIENCES.map((a) => (
                <option key={a} value={a}>
                  {MESSAGE_AUDIENCE_LABELS[a]}
                </option>
              ))}
            </select>
            <p className="text-white/40 text-xs mt-1.5">
              {count == null ? 'Counting…' : `${count} ${count === 1 ? 'account' : 'accounts'} with a website login`}
            </p>
          </div>
          <div>
            <label htmlFor="notify-title" className="block text-white/60 text-sm mb-2">
              Title
            </label>
            <input
              id="notify-title"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Closed on Monday"
              className={`${field} h-10`}
            />
          </div>
          <div>
            <label htmlFor="notify-body" className="block text-white/60 text-sm mb-2">
              Message
            </label>
            <textarea
              id="notify-body"
              rows={4}
              value={body}
              maxLength={1000}
              onChange={(e) => setBody(e.target.value)}
              placeholder="The gym is closed on Monday for the holiday. See you on Tuesday!"
              className={`${field} py-3`}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {result ? (
              <p className={`text-sm ${result.ok ? 'text-emerald-400' : 'text-red-400'}`}>{result.text}</p>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setOpen(false);
                  setResult(null);
                }}
                className="h-10 px-4 bg-surface-dark-lighter text-white/80 rounded-lg hover:text-white"
              >
                Close
              </button>
              <button
                onClick={send}
                disabled={sending || !title.trim() || !body.trim() || count === 0}
                className="h-10 px-5 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
