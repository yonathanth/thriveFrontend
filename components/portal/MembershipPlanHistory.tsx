'use client';

import { useEffect, useState } from 'react';
import { ApiError, meApi, type MyHistory } from '@/lib/api';
import { Card, ErrorNote, PlanHistory } from './membership';

export default function MembershipPlanHistory() {
  const [history, setHistory] = useState<MyHistory | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    meApi.history().then((data) => {
      if (!cancelled) setHistory(data);
    }).catch((err) => {
      if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load membership history');
    });
    return () => { cancelled = true; };
  }, []);

  return <Card title="Membership history">
    {error ? <ErrorNote message={error} /> : history ? <PlanHistory rows={history.planHistory} /> : <p role="status" className="text-sm text-white/60">Loading past memberships…</p>}
  </Card>;
}
