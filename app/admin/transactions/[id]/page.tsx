'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { transactionsApi, Transaction } from '@/lib/api';
import { formatDateTime, humanize } from '@/lib/audit';

interface Props {
  params: Promise<{ id: string }>;
}

const SOURCE_LABELS: Record<NonNullable<Transaction['source']>, string> = {
  membership: 'Membership',
  addon: 'Add-on',
  drop_in: 'Drop-in',
  other: 'Other',
};

const money = (amount: number | undefined) =>
  amount == null
    ? '—'
    : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB', maximumFractionDigits: 2 }).format(amount);

export default function TransactionDetailPage({ params }: Props) {
  const { id } = use(params);
  const [tx, setTx] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    transactionsApi
      .getOne(Number(id))
      .then(setTx)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load the payment'));
  }, [id]);

  const back = (
    <Link href="/admin/transactions" className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm">
      <span className="material-symbols-outlined text-base">arrow_back</span>
      Transactions
    </Link>
  );

  if (error) {
    return (
      <div className="space-y-6">
        {back}
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-12 text-center text-white/60">
          {error}
        </div>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="flex justify-center py-24">
        <div className="size-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isIncome = tx.type === 'income' || tx.type === 'positive_return';
  const forWhat =
    tx.source && tx.source !== 'other'
      ? `${SOURCE_LABELS[tx.source]}${tx.sourceName ? `: ${tx.sourceName}` : ''}`
      : tx.category || '—';
  const discounted = (tx.discountAmount ?? 0) > 0;

  const facts: [string, React.ReactNode][] = [
    [
      'Member',
      tx.member ? (
        <Link href={`/admin/members/${tx.member.id}`} className="text-primary hover:underline">
          {tx.member.fullName} →
        </Link>
      ) : (
        'Walk-in / none'
      ),
    ],
    ['For', forWhat],
    ['Date', formatDateTime(tx.transactionDate)],
    ['Payment method', tx.paymentMethod || '—'],
    ['Status', humanize(tx.paymentStatus) || '—'],
    ['Type', humanize(tx.type)],
    [
      'Recorded by',
      tx.recordedBy ? (
        tx.recordedBy.auditId != null ? (
          <Link href={`/admin/audit-log/${tx.recordedBy.auditId}`} className="text-primary hover:underline">
            {tx.recordedBy.username}
            {tx.recordedBy.role ? ` (${tx.recordedBy.role})` : ''} →
          </Link>
        ) : (
          `${tx.recordedBy.username}${tx.recordedBy.role ? ` (${tx.recordedBy.role})` : ''}`
        )
      ) : (
        'Not recorded'
      ),
    ],
  ];

  return (
    <div className="space-y-6">
      {back}

      <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span
              className={`size-12 shrink-0 rounded-full flex items-center justify-center ${
                isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}
            >
              <span className="material-symbols-outlined">{isIncome ? 'south_west' : 'north_east'}</span>
            </span>
            <div>
              <p className="text-white/50 text-sm">Payment #{tx.id}</p>
              <h1 className="text-white text-xl font-bold mt-1">{tx.description || forWhat}</h1>
            </div>
          </div>
          <div className="sm:text-right">
            <p className={`text-3xl font-bold ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>{money(tx.amount)}</p>
            {discounted && (
              <p className="text-white/50 text-sm mt-1">
                <span className="line-through">{money(tx.originalAmount)}</span> · {money(tx.discountAmount)} off
                {tx.discountCode ? ` (${tx.discountCode})` : ''}
              </p>
            )}
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {facts.map(([label, value]) => (
            <div key={label} className="bg-surface-dark-lighter/40 rounded-lg p-4">
              <dt className="text-white/50 text-xs uppercase tracking-wider">{label}</dt>
              <dd className="text-white mt-1 break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
