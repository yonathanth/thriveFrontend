'use client';

import { useEffect, useState } from 'react';
import { ApiError, meApi, type MyMembership } from '@/lib/api';

export function useMemberMembership() {
  const [membership, setMembership] = useState<MyMembership | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    meApi.membership().then((data) => {
      if (!cancelled) setMembership(data);
    }).catch((err) => {
      if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load your membership');
    });
    return () => { cancelled = true; };
  }, []);

  return { membership, error };
}
