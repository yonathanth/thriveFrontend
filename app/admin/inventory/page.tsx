'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  inventoryApi,
  ApiError,
  type AssignmentStatus,
  type InventoryAssignment,
  type InventoryHolding,
  type InventoryItem,
  type InventoryMovement,
  type PaginatedResponse,
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import DataTable, { Pagination, type Column } from '@/components/admin/DataTable';
import StatsCard from '@/components/admin/StatsCard';
import {
  BUCKET_LABELS,
  MOVEMENT_LABELS,
  STATUS_STYLES,
  describeQty,
  formatEtb,
  formatWhen,
} from '@/lib/inventory';
import Icon from '@/components/ui/Icon';

type Tab = 'stock' | 'holders' | 'handovers' | 'assets' | 'history';

const TABS: { key: Tab; label: string }[] = [
  { key: 'stock', label: 'Stock' },
  { key: 'holders', label: 'With staff' },
  { key: 'handovers', label: 'Hand-overs' },
  { key: 'assets', label: 'Assets' },
  { key: 'history', label: 'History' },
];

const PAGE_SIZE = 20;

const selectClass =
  'h-10 px-4 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors';

function errorText(err: unknown): string {
  if (err instanceof ApiError && err.status === 403) return 'You do not have access to this.';
  return err instanceof Error ? err.message : 'Failed to load';
}

function StatusBadge({ status }: { status: AssignmentStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset capitalize ${STATUS_STYLES[status]}`}>
      {status === 'pending' && <Icon name="schedule" className="text-[14px] mr-1" />}
      {status}
    </span>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-8 text-center text-white/60">{text}</div>
  );
}

export default function InventoryPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [tab, setTab] = useState<Tab>('stock');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [mismatches, setMismatches] = useState<{ itemName: string; ledger: number; balances: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [all, pending, integrity] = await Promise.all([
          inventoryApi.items(),
          inventoryApi.assignments({ status: 'pending', limit: 1 }),
          inventoryApi.integrity().catch(() => []),
        ]);
        if (cancelled) return;
        setItems(all);
        setPendingCount(pending.meta.total);
        setMismatches(integrity);
      } catch (err) {
        if (!cancelled) setError(errorText(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sellable = items.filter((i) => i.kind === 'sellable');
  const assets = items.filter((i) => i.kind === 'asset');
  const lowStock = sellable.filter((i) => i.isActive && i.storeQty === 0).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">Inventory</h1>
          <p className="text-white/60 mt-1">
            Stock, hand-overs and assets as last synced from the desktop app. Stock is managed there.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/admin/inventory/sales"
            className="h-10 px-4 inline-flex items-center gap-2 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Icon name="point_of_sale" className="text-lg" />
            Sales & reports
          </Link>
        )}
      </div>

      {mismatches.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200 text-sm">
          <p className="font-medium">Some stock figures do not add up yet</p>
          <p className="text-amber-200/80 mt-1">
            {mismatches.map((m) => m.itemName).join(', ')}: the synced balances differ from the synced history. This is
            normal while a sync is in progress; if it persists, sync the desktop app again.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Products" value={loading ? '-' : sellable.length} icon="local_drink" color="primary" />
        <StatsCard
          title="Awaiting acceptance"
          value={loading ? '-' : pendingCount}
          icon="pending_actions"
          color="orange"
          subtitle="Hand-overs not yet accepted"
        />
        <StatsCard title="Out of stock in store" value={loading ? '-' : lowStock} icon="production_quantity_limits" color="red" />
        <StatsCard title="Assets" value={loading ? '-' : assets.length} icon="fitness_center" color="blue" />
      </div>

      <div className="border-b border-surface-dark-lighter">
        <nav className="flex gap-6 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                tab === t.key ? 'text-primary border-primary' : 'text-white/60 border-transparent hover:text-white'
              }`}
            >
              {t.label}
              {t.key === 'handovers' && pendingCount > 0 && (
                <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {error ? (
        <Notice text={`Could not load inventory: ${error}`} />
      ) : tab === 'stock' ? (
        <StockTab items={sellable} loading={loading} />
      ) : tab === 'holders' ? (
        <HoldersTab />
      ) : tab === 'handovers' ? (
        <HandoversTab />
      ) : tab === 'assets' ? (
        <AssetsTab items={assets} loading={loading} />
      ) : (
        <HistoryTab items={items} showMoney={isAdmin} />
      )}
    </div>
  );
}

function StockTab({ items, loading }: { items: InventoryItem[]; loading: boolean }) {
  const columns: Column<InventoryItem>[] = [
    {
      key: 'name',
      header: 'Product',
      render: (i) => (
        <div>
          <p className="text-white font-medium">{i.name}</p>
          <p className="text-white/40 text-xs">
            {i.packName && i.unitsPerPack ? `1 ${i.packName} = ${i.unitsPerPack} ${i.unitName}s` : `Sold per ${i.unitName}`}
            {i.sku ? ` · ${i.sku}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (i) => (
        <div className="text-white/80">
          <p>
            {formatEtb(i.unitPrice)} / {i.unitName}
          </p>
          {i.packPrice != null && i.packName && (
            <p className="text-white/50 text-xs">
              {formatEtb(i.packPrice)} / {i.packName}
            </p>
          )}
        </div>
      ),
    },
    { key: 'store', header: 'In store', render: (i) => <span className="text-white">{describeQty(i.storeQty, i)}</span> },
    { key: 'held', header: 'With staff', render: (i) => <span className="text-white/80">{describeQty(i.heldQty, i)}</span> },
    {
      key: 'pending',
      header: 'Pending',
      render: (i) =>
        i.pendingQty > 0 ? (
          <span className="text-amber-300">{describeQty(i.pendingQty, i)}</span>
        ) : (
          <span className="text-white/30">-</span>
        ),
    },
    { key: 'sold', header: 'Sold to date', render: (i) => <span className="text-white/80">{describeQty(i.soldQty, i)}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (i) =>
        i.isActive ? <span className="text-emerald-400 text-sm">Active</span> : <span className="text-white/40 text-sm">Inactive</span>,
    },
  ];
  return (
    <DataTable
      columns={columns}
      data={items}
      keyExtractor={(i) => i.localId}
      isLoading={loading}
      emptyMessage="No products yet. Add them in the desktop app's Inventory page."
    />
  );
}

function HoldersTab() {
  const [rows, setRows] = useState<InventoryHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inventoryApi
      .holdings()
      .then(setRows)
      .catch((err) => setError(errorText(err)))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <Notice text={`Could not load: ${error}`} />;
  const columns: Column<InventoryHolding>[] = [
    { key: 'holder', header: 'Held by', render: (h) => <span className="text-white font-medium">{h.holderName ?? `Account #${h.holderUserLocalId}`}</span> },
    { key: 'item', header: 'Product', render: (h) => <span className="text-white/80">{h.itemName}</span> },
    { key: 'qty', header: 'Quantity', render: (h) => <span className="text-white">{describeQty(h.qtyBase, h)}</span> },
    { key: 'updated', header: 'Last change', render: (h) => <span className="text-white/60">{formatWhen(h.updatedAt)}</span> },
  ];
  return (
    <DataTable
      columns={columns}
      data={rows}
      keyExtractor={(h) => `${h.holderUserLocalId}-${h.itemLocalId}`}
      isLoading={loading}
      emptyMessage="Nobody holds any stock right now."
    />
  );
}

function HandoversTab() {
  const [status, setStatus] = useState<'' | AssignmentStatus>('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<InventoryAssignment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await inventoryApi.assignments({ page, limit: PAGE_SIZE, status: status || undefined }));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: Column<InventoryAssignment>[] = [
    { key: 'when', header: 'When', render: (a) => <span className="text-white/70">{formatWhen(a.createdAt)}</span> },
    { key: 'item', header: 'Product', render: (a) => <span className="text-white font-medium">{a.itemName}</span> },
    { key: 'qty', header: 'Quantity', render: (a) => <span className="text-white">{describeQty(a.qtyBase, a)}</span> },
    {
      key: 'from',
      header: 'From',
      render: (a) => <span className="text-white/80">{a.kind === 'assign' ? 'Store' : (a.fromName ?? '-')}</span>,
    },
    { key: 'to', header: 'To', render: (a) => <span className="text-white/80">{a.toName ?? '-'}</span> },
    { key: 'by', header: 'Handed over by', render: (a) => <span className="text-white/60">{a.createdByName ?? '-'}</span> },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    {
      key: 'responded',
      header: 'Answered',
      render: (a) => <span className="text-white/60">{a.status === 'pending' ? 'Waiting' : formatWhen(a.respondedAt)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as '' | AssignmentStatus);
            setPage(1);
          }}
          className={selectClass}
          aria-label="Status"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {error ? (
        <Notice text={`Could not load: ${error}`} />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            keyExtractor={(a) => a.localId}
            isLoading={loading}
            emptyMessage="No hand-overs match."
          />
          <Pagination currentPage={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

function AssetsTab({ items, loading }: { items: InventoryItem[]; loading: boolean }) {
  const columns: Column<InventoryItem>[] = [
    {
      key: 'name',
      header: 'Asset',
      render: (i) => (
        <div>
          <p className="text-white font-medium">{i.name}</p>
          {i.assetSerial && <p className="text-white/40 text-xs">Serial {i.assetSerial}</p>}
        </div>
      ),
    },
    { key: 'qty', header: 'Quantity', render: (i) => <span className="text-white">{describeQty(i.storeQty, i)}</span> },
    { key: 'location', header: 'Location', render: (i) => <span className="text-white/80">{i.assetLocation ?? '-'}</span> },
    { key: 'condition', header: 'Condition', render: (i) => <span className="text-white/80">{i.assetCondition ?? '-'}</span> },
    { key: 'notes', header: 'Notes', render: (i) => <span className="text-white/60">{i.notes ?? '-'}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (i) =>
        i.isActive ? <span className="text-emerald-400 text-sm">In use</span> : <span className="text-white/40 text-sm">Retired</span>,
    },
  ];
  return (
    <DataTable
      columns={columns}
      data={items}
      keyExtractor={(i) => i.localId}
      isLoading={loading}
      emptyMessage="No assets recorded yet."
    />
  );
}

function HistoryTab({ items, showMoney }: { items: InventoryItem[]; showMoney: boolean }) {
  const [itemId, setItemId] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse<InventoryMovement> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(
        await inventoryApi.movements({
          page,
          limit: PAGE_SIZE,
          itemId: itemId ? Number(itemId) : undefined,
          type: type || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      );
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [page, itemId, type, startDate, endDate]);

  useEffect(() => {
    load();
  }, [load]);

  const place = (bucket: string, name: string | null) =>
    bucket === 'holder' || (bucket === 'pending' && name) ? `${BUCKET_LABELS[bucket]}${name ? ` (${name})` : ''}` : BUCKET_LABELS[bucket] ?? bucket;

  const columns: Column<InventoryMovement>[] = [
    { key: 'when', header: 'When', render: (m) => <span className="text-white/70 whitespace-nowrap">{formatWhen(m.createdAt)}</span> },
    { key: 'item', header: 'Item', render: (m) => <span className="text-white font-medium">{m.itemName}</span> },
    { key: 'type', header: 'What', render: (m) => <span className="text-white/80">{MOVEMENT_LABELS[m.type] ?? m.type}</span> },
    { key: 'qty', header: 'Quantity', render: (m) => <span className="text-white">{describeQty(m.qtyBase, m)}</span> },
    {
      key: 'route',
      header: 'From → To',
      render: (m) => (
        <span className="text-white/70 text-sm">
          {place(m.fromBucket, m.fromName)} → {place(m.toBucket, m.toName)}
        </span>
      ),
    },
    { key: 'by', header: 'By', render: (m) => <span className="text-white/70">{m.actorUsername ?? '-'}</span> },
    { key: 'reason', header: 'Note', render: (m) => <span className="text-white/50 text-sm">{m.reason ?? ''}</span> },
    ...(showMoney
      ? [
          {
            key: 'amount',
            header: 'Amount',
            render: (m: InventoryMovement) => <span className="text-white/80">{m.amount != null ? formatEtb(m.amount) : ''}</span>,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <select value={itemId} onChange={(e) => { setItemId(e.target.value); setPage(1); }} className={selectClass} aria-label="Item">
          <option value="">All items</option>
          {items.map((i) => (
            <option key={i.localId} value={i.localId}>
              {i.name}
            </option>
          ))}
        </select>
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className={selectClass} aria-label="Movement">
          <option value="">All movements</option>
          {Object.entries(MOVEMENT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className={selectClass} aria-label="From" />
        <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className={selectClass} aria-label="To" />
      </div>
      {error ? (
        <Notice text={`Could not load: ${error}`} />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            keyExtractor={(m) => m.localId}
            isLoading={loading}
            emptyMessage="No stock movements match."
          />
          <Pagination currentPage={page} totalPages={data?.meta.totalPages ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
