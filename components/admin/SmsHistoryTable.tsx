'use client';

import { useState, useEffect, useCallback } from 'react';
import { smsApi, SmsHistory, PaginatedResponse } from '@/lib/api';
import DataTable from './DataTable';

export default function SmsHistoryTable() {
  const [history, setHistory] = useState<PaginatedResponse<SmsHistory> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [days, setDays] = useState(30);
  const limit = 20;

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await smsApi.getHistory({ page, limit, days });
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch SMS history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, days]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    const styles: Record<string, string> = {
      queued: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    const style = styles[statusLower] || styles.queued;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
      >
        {status}
      </span>
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns = [
    {
      key: 'phoneNumber',
      header: 'Phone Number',
      render: (item: SmsHistory) => (
        <span className="font-mono text-sm">{item.phoneNumber}</span>
      ),
    },
    {
      key: 'message',
      header: 'Message',
      render: (item: SmsHistory) => (
        <div className="max-w-md">
          <p className="text-white text-sm truncate">{item.message}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: SmsHistory) => getStatusBadge(item.status),
    },
    {
      key: 'sentAt',
      header: 'Sent At',
      render: (item: SmsHistory) => (
        <span className="text-white/60 text-sm">{formatDate(item.sentAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <label className="text-white/80 text-sm">Show last:</label>
        <select
          value={days}
          onChange={(e) => {
            setDays(Number(e.target.value));
            setPage(1);
          }}
          className="px-3 py-1.5 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white text-sm focus:outline-none focus:border-primary"
        >
          <option value={1}>Today</option>
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={60}>60 days</option>
          <option value={90}>90 days</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={history?.data || []}
        keyExtractor={(item) => item.id.toString()}
        isLoading={isLoading}
        emptyMessage="No SMS history found"
      />

      {/* Pagination */}
      {history && history.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-white/60 text-sm">
            Showing {((history.meta.page - 1) * history.meta.limit) + 1} to{' '}
            {Math.min(history.meta.page * history.meta.limit, history.meta.total)} of{' '}
            {history.meta.total} messages
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={history.meta.page <= 1 || isLoading}
              className="px-3 py-1.5 bg-surface-dark-lighter text-white rounded-lg hover:bg-surface-dark-lighter/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={history.meta.page >= history.meta.totalPages || isLoading}
              className="px-3 py-1.5 bg-surface-dark-lighter text-white rounded-lg hover:bg-surface-dark-lighter/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


