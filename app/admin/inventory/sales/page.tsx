'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  inventoryApi,
  type InventoryReport,
  type InventorySale,
  type PaginatedResponse,
  type ReportGranularity,
} from '@/lib/api';
import DataTable, { Pagination, type Column } from '@/components/admin/DataTable';
import StatsCard from '@/components/admin/StatsCard';
import { dayValue, describeQty, formatEtb, formatWhen } from '@/lib/inventory';
import FinanceFromTag from '@/components/admin/FinanceFromTag';
import Icon from '@/components/ui/Icon';

type Preset = 'today' | 'month' | 'year' | 'custom';

const selectClass =
  'h-10 px-4 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors';

function rangeFor(preset: Exclude<Preset, 'custom'>): { startDate: string; endDate: string; granularity: ReportGranularity } {
  const today = new Date();
  if (preset === 'today') return { startDate: dayValue(today), endDate: dayValue(today), granularity: 'day' };
  if (preset === 'month') {
    return { startDate: dayValue(new Date(today.getFullYear(), today.getMonth(), 1)), endDate: dayValue(today), granularity: 'day' };
  }
  return { startDate: dayValue(new Date(today.getFullYear(), 0, 1)), endDate: dayValue(today), granularity: 'month' };
}

function periodLabel(period: string, granularity: ReportGranularity): string {
  if (granularity === 'year') return period;
  const [y, m, d] = period.split('-').map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return granularity === 'month'
    ? date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export default function InventorySalesPage() {
  const initial = rangeFor('month');
  const [preset, setPreset] = useState<Preset>('month');
  const [startDate, setStartDate] = useState(initial.startDate);
  const [endDate, setEndDate] = useState(initial.endDate);
  const [granularity, setGranularity] = useState<ReportGranularity>(initial.granularity);
  const [report, setReport] = useState<InventoryReport | null>(null);
  const [sales, setSales] = useState<PaginatedResponse<InventorySale> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const choosePreset = (p: Preset) => {
    setPreset(p);
    setPage(1);
    if (p === 'custom') return;
    const r = rangeFor(p);
    setStartDate(r.startDate);
    setEndDate(r.endDate);
    setGranularity(r.granularity);
  };

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(await inventoryApi.report({ granularity, startDate: startDate || undefined, endDate: endDate || undefined }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [granularity, startDate, endDate]);

  const loadSales = useCallback(async () => {
    setSalesLoading(true);
    try {
      setSales(await inventoryApi.sales({ page, limit: 20, startDate: startDate || undefined, endDate: endDate || undefined }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setSalesLoading(false);
    }
  }, [page, startDate, endDate]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const totals = report?.totals;
  const periodColumns: Column<InventoryReport['periods'][number]>[] = useMemo(
    () => [
      { key: 'period', header: 'Period', render: (p) => <span className="text-white">{periodLabel(p.period, granularity)}</span> },
      { key: 'qty', header: 'Units sold', render: (p) => <span className="text-white/80">{p.soldQty}</span> },
      { key: 'revenue', header: 'Revenue', render: (p) => <span className="text-white">{formatEtb(p.revenue)}</span> },
      {
        key: 'refunded',
        header: 'Voided',
        render: (p) => <span className={p.refunded > 0 ? 'text-red-300' : 'text-white/30'}>{p.refunded > 0 ? formatEtb(p.refunded) : '-'}</span>,
      },
      { key: 'net', header: 'Net', render: (p) => <span className="text-emerald-400 font-medium">{formatEtb(p.net)}</span> },
    ],
    [granularity],
  );

  const itemColumns: Column<InventoryReport['byItem'][number]>[] = [
    { key: 'item', header: 'Product', render: (r) => <span className="text-white font-medium">{r.itemName}</span> },
    { key: 'qty', header: 'Sold', render: (r) => <span className="text-white/80">{describeQty(r.soldQty, r)}</span> },
    { key: 'amount', header: 'Amount', render: (r) => <span className="text-white">{formatEtb(r.amount)}</span> },
    { key: 'reports', header: 'Reports', render: (r) => <span className="text-white/60">{r.reports}</span> },
  ];

  const holderColumns: Column<InventoryReport['byHolder'][number]>[] = [
    { key: 'holder', header: 'Sold by', render: (r) => <span className="text-white font-medium">{r.holderName ?? `Account #${r.holderUserLocalId}`}</span> },
    { key: 'qty', header: 'Units sold', render: (r) => <span className="text-white/80">{r.soldQty}</span> },
    { key: 'amount', header: 'Amount', render: (r) => <span className="text-white">{formatEtb(r.amount)}</span> },
    { key: 'reports', header: 'Reports', render: (r) => <span className="text-white/60">{r.reports}</span> },
  ];

  const saleColumns: Column<InventorySale>[] = [
    { key: 'when', header: 'Reported', render: (s) => <span className="text-white/70 whitespace-nowrap">{formatWhen(s.reportedAt)}</span> },
    { key: 'item', header: 'Product', render: (s) => <span className="text-white font-medium">{s.itemName}</span> },
    { key: 'holder', header: 'By', render: (s) => <span className="text-white/80">{s.holderName ?? '-'}</span> },
    { key: 'had', header: 'Had', render: (s) => <span className="text-white/60">{describeQty(s.expectedQtyBase, s)}</span> },
    { key: 'left', header: 'Left', render: (s) => <span className="text-white/60">{describeQty(s.remainingQtyBase, s)}</span> },
    { key: 'sold', header: 'Sold', render: (s) => <span className="text-white">{describeQty(s.soldQtyBase, s)}</span> },
    {
      key: 'amount',
      header: 'Amount',
      render: (s) => (
        <span className={s.voidedAt ? 'text-white/40 line-through' : 'text-white'}>{formatEtb(s.amount)}</span>
      ),
    },
    { key: 'method', header: 'Payment', render: (s) => <span className="text-white/60">{s.paymentMethod ?? '-'}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (s) =>
        s.voidedAt ? (
          <span className="text-red-300 text-sm" title={s.voidReason ?? undefined}>
            Voided{s.voidReason ? `: ${s.voidReason}` : ''}
          </span>
        ) : (
          <span className="text-emerald-400 text-sm">Booked</span>
        ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <Link href="/admin/inventory" className="text-white/50 hover:text-white text-sm inline-flex items-center gap-1">
            <Icon name="arrow_back" className="text-base" />
            Inventory
          </Link>
          <h1 className="text-white text-2xl font-bold mt-1">Inventory sales</h1>
          <p className="text-white/60 mt-1">
            Sales booked from staff stock reports. They are part of the income on the Transactions page, shown here on
            their own.
          </p>
          <FinanceFromTag className="mt-2" />
        </div>
      </div>

      <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-4 flex flex-col lg:flex-row gap-3">
        <select value={preset} onChange={(e) => choosePreset(e.target.value as Preset)} className={selectClass} aria-label="Range">
          <option value="today">Today</option>
          <option value="month">This month</option>
          <option value="year">This year</option>
          <option value="custom">Custom</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setPreset('custom');
            setStartDate(e.target.value);
            setPage(1);
          }}
          className={selectClass}
          aria-label="From"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setPreset('custom');
            setEndDate(e.target.value);
            setPage(1);
          }}
          className={selectClass}
          aria-label="To"
        />
        <select
          value={granularity}
          onChange={(e) => setGranularity(e.target.value as ReportGranularity)}
          className={selectClass}
          aria-label="Group by"
        >
          <option value="day">By day</option>
          <option value="month">By month</option>
          <option value="year">By year</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">Could not load: {error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Inventory revenue" value={totals ? formatEtb(totals.net) : '-'} icon="point_of_sale" color="green" subtitle={totals && totals.refunded > 0 ? `${formatEtb(totals.refunded)} voided` : undefined} />
        <StatsCard title="Units sold" value={totals ? totals.soldQty : '-'} icon="local_drink" color="primary" subtitle="All products, in single units" />
        <StatsCard title="Stock reports" value={totals ? totals.reports : '-'} icon="fact_check" color="blue" />
        <StatsCard
          title="Share of all revenue"
          value={totals ? `${totals.share}%` : '-'}
          icon="pie_chart"
          color="orange"
          subtitle={totals ? `of ${formatEtb(totals.allRevenue)} total` : undefined}
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-white font-semibold">By {granularity}</h2>
        <DataTable
          columns={periodColumns}
          data={report?.periods ?? []}
          keyExtractor={(p) => p.period}
          isLoading={loading}
          emptyMessage="No inventory sales in this range."
        />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="space-y-3">
          <h2 className="text-white font-semibold">By product</h2>
          <DataTable columns={itemColumns} data={report?.byItem ?? []} keyExtractor={(r) => r.itemLocalId} isLoading={loading} emptyMessage="Nothing sold." />
        </section>
        <section className="space-y-3">
          <h2 className="text-white font-semibold">By staff member</h2>
          <DataTable
            columns={holderColumns}
            data={report?.byHolder ?? []}
            keyExtractor={(r) => r.holderUserLocalId}
            isLoading={loading}
            emptyMessage="Nothing sold."
          />
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="text-white font-semibold">Stock reports</h2>
        <DataTable
          columns={saleColumns}
          data={sales?.data ?? []}
          keyExtractor={(s) => s.localId}
          isLoading={salesLoading}
          emptyMessage="No stock reports in this range."
        />
        <Pagination currentPage={page} totalPages={sales?.meta.totalPages ?? 1} onPageChange={setPage} />
      </section>
    </div>
  );
}
