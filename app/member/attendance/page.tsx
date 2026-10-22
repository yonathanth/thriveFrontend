'use client';

import { useEffect, useState } from 'react';
import { Pagination } from '@/components/admin/DataTable';
import { meApi, CheckIn, ApiError } from '@/lib/api';
import { Card, ErrorNote } from '@/components/portal/membership';

export default function MemberAttendancePage() {
  const [rows, setRows] = useState<CheckIn[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    meApi
      .attendance(page, 30)
      .then((res) => {
        if (cancelled) return;
        setRows(res.data);
        setTotal(res.total);
        setTotalPages(Math.max(1, res.totalPages));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load attendance');
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Attendance</h1>
        <p className="text-white/60 mt-1">{total} check-ins in total.</p>
      </div>
      {error && <ErrorNote message={error} />}
      <Card>
        {rows === null ? (
          <div className="h-24 animate-pulse" />
        ) : rows.length === 0 ? (
          <p className="text-white/40 text-sm">No check-ins yet.</p>
        ) : (
          <ul className="divide-y divide-surface-dark-lighter">
            {rows.map((r) => (
              <li key={r.id} className="py-3 flex justify-between text-white">
                <span>
                  {new Date(r.date).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-white/60">
                  {new Date(r.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </li>
            ))}
          </ul>
        )}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
}
