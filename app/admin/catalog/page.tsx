'use client';

import { useEffect, useState } from 'react';
import { recordsApi, DesktopRow, RecordEntity } from '@/lib/api';
import { desktopDate, formatDesktopDate, formatETB, humanize, num, str } from '@/lib/desktop';
import StatsCard from '@/components/admin/StatsCard';

type Tab = 'addons' | 'dropins' | 'discounts' | 'groups';

const TABS: { key: Tab; label: string }[] = [
  { key: 'addons', label: 'Add-ons' },
  { key: 'dropins', label: 'Drop-ins' },
  { key: 'discounts', label: 'Discounts' },
  { key: 'groups', label: 'Groups' },
];

/** The desktop tables each tab shows. Rows are capped: these are lists to glance at. */
const TAB_ENTITIES: Record<Tab, RecordEntity[]> = {
  addons: ['additional_service', 'additional_service_variant', 'member_additional_subscription'],
  dropins: ['usage_service', 'service_usage'],
  discounts: ['discount'],
  groups: ['member_group', 'member_group_member'],
};

function isActiveFlag(value: unknown): boolean {
  return value === 1 || value === true || value === 'active';
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${
        active
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-12 text-center text-white/60">
      {text}
    </div>
  );
}

export default function CatalogPage() {
  const [tab, setTab] = useState<Tab>('addons');
  const [rows, setRows] = useState<Partial<Record<RecordEntity, DesktopRow[]>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // "Active" is judged against when the page opened, not each render.
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const entities = TAB_ENTITIES[tab];
        const results = await Promise.all(entities.map((e) => recordsApi.list(e, { limit: 500 })));
        if (!cancelled) {
          setRows((prev) => {
            const next = { ...prev };
            entities.forEach((e, i) => (next[e] = results[i].data));
            return next;
          });
        }
      } catch (err) {
        console.error('Failed to fetch catalog:', err);
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const get = (e: RecordEntity) => rows[e] ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-white text-2xl font-bold">Catalog</h1>
        <p className="text-white/60 mt-1">Add-ons, drop-ins, discounts and groups, as set up in the desktop app</p>
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
            </button>
          ))}
        </nav>
      </div>

      {error ? (
        <Empty text={`Could not load: ${error}`} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6 animate-pulse">
              <div className="h-6 bg-surface-dark-lighter rounded w-3/4 mb-4" />
              <div className="h-4 bg-surface-dark-lighter rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : tab === 'addons' ? (
        <AddonsTab
          addons={get('additional_service')}
          variants={get('additional_service_variant')}
          subscriptions={get('member_additional_subscription')}
          now={now}
        />
      ) : tab === 'dropins' ? (
        <DropInsTab services={get('usage_service')} sales={get('service_usage')} />
      ) : tab === 'discounts' ? (
        <DiscountsTab discounts={get('discount')} />
      ) : (
        <GroupsTab groups={get('member_group')} links={get('member_group_member')} />
      )}
    </div>
  );
}

function AddonsTab({
  addons,
  variants,
  subscriptions,
  now,
}: {
  addons: DesktopRow[];
  variants: DesktopRow[];
  subscriptions: DesktopRow[];
  now: number;
}) {
  if (addons.length === 0) return <Empty text="No add-ons yet" />;
  const activeCount = (addonId: number) =>
    subscriptions.filter(
      (s) =>
        num(s.additional_service_id) === addonId &&
        str(s.status) === 'active' &&
        !num(s.frozen) &&
        (desktopDate(s.end_date)?.getTime() ?? 0) > now
    ).length;
  const totalActive = addons.reduce((sum, a) => sum + activeCount(a.id), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Add-ons" value={addons.length} icon="add_circle" color="primary" />
        <StatsCard title="Active subscriptions" value={totalActive} icon="check_circle" color="green" />
        <StatsCard
          title="Frozen subscriptions"
          value={subscriptions.filter((s) => num(s.frozen)).length}
          icon="ac_unit"
          color="blue"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addons.map((a) => {
          const own = variants.filter((v) => num(v.additional_service_id) === a.id);
          return (
            <div key={a.id} className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-white text-lg font-semibold">{str(a.name)}</h3>
                <StatusBadge active={isActiveFlag(a.status)} />
              </div>
              <span className="inline-flex px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium mb-4">
                {humanize(a.category)}
              </span>
              {own.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {own.map((v) => (
                    <div key={v.id} className="flex justify-between text-sm">
                      <span className="text-white/70">
                        {str(v.name)} <span className="text-white/40">• {num(v.period_days)} days</span>
                      </span>
                      <span className="text-white">{formatETB(num(v.price) ?? 0)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-primary text-2xl font-bold mb-4">
                  {num(a.is_free) ? 'Free' : formatETB(num(a.price) ?? 0)}
                </p>
              )}
              <p className="text-white/60 text-sm pt-4 border-t border-surface-dark-lighter">
                {activeCount(a.id)} active subscriptions
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DropInsTab({ services, sales }: { services: DesktopRow[]; sales: DesktopRow[] }) {
  if (services.length === 0) return <Empty text="No drop-in services yet" />;
  const names = new Map(services.map((s) => [s.id, str(s.name)]));
  const recent = [...sales]
    .sort((a, b) => String(b.usage_date ?? '').localeCompare(String(a.usage_date ?? '')))
    .slice(0, 50);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((s) => (
          <div key={s.id} className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-white font-semibold">{str(s.name)}</p>
              <StatusBadge active={isActiveFlag(s.status)} />
            </div>
            <p className="text-white/40 text-xs mt-1">{humanize(s.category)}</p>
            <p className="text-primary text-xl font-bold mt-3">{formatETB(num(s.price) ?? 0)}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter overflow-hidden">
        <div className="p-4 border-b border-surface-dark-lighter">
          <h2 className="text-white font-semibold">Recent drop-in visits</h2>
          <p className="text-white/40 text-sm">Latest {recent.length}</p>
        </div>
        {recent.length === 0 ? (
          <div className="p-8 text-center text-white/40">No visits yet</div>
        ) : (
          <div className="divide-y divide-surface-dark-lighter">
            {recent.map((v) => (
              <div key={v.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-white">
                    {str(v.customer_name) ?? 'Walk-in'}
                    <span className="text-white/40 text-sm">
                      {' '}
                      • {names.get(num(v.usage_service_id) ?? -1) ?? 'Drop-in'}
                      {(num(v.quantity) ?? 1) > 1 ? ` × ${num(v.quantity)}` : ''}
                    </span>
                  </p>
                  <p className="text-white/40 text-sm">
                    {formatDesktopDate(v.usage_date)} • {humanize(v.customer_type)}
                    {str(v.trainer_name) ? ` • ${str(v.trainer_name)}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white">{formatETB(num(v.total_amount) ?? 0)}</p>
                  <p className="text-white/40 text-xs capitalize">{str(v.payment_status)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DiscountsTab({ discounts }: { discounts: DesktopRow[] }) {
  if (discounts.length === 0) return <Empty text="No discounts yet" />;
  return (
    <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-white/40 border-b border-surface-dark-lighter">
            <th className="p-4 font-medium">Code</th>
            <th className="p-4 font-medium">Name</th>
            <th className="p-4 font-medium">Value</th>
            <th className="p-4 font-medium">Valid</th>
            <th className="p-4 font-medium">Used</th>
            <th className="p-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-dark-lighter">
          {discounts.map((d) => {
            const value = num(d.value) ?? 0;
            const maxUses = num(d.max_uses);
            return (
              <tr key={d.id}>
                <td className="p-4 text-primary font-mono">{str(d.code)}</td>
                <td className="p-4 text-white">{str(d.name)}</td>
                <td className="p-4 text-white">
                  {str(d.discount_type) === 'percentage' ? `${value}%` : formatETB(value)}
                </td>
                <td className="p-4 text-white/60">
                  {d.start_date || d.end_date
                    ? `${d.start_date ? formatDesktopDate(d.start_date) : '…'} – ${
                        d.end_date ? formatDesktopDate(d.end_date) : '…'
                      }`
                    : 'Always'}
                </td>
                <td className="p-4 text-white/60">
                  {num(d.times_used) ?? 0}
                  {maxUses != null ? ` / ${maxUses}` : ''}
                </td>
                <td className="p-4">
                  <StatusBadge active={isActiveFlag(d.is_active)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GroupsTab({ groups, links }: { groups: DesktopRow[]; links: DesktopRow[] }) {
  if (groups.length === 0) return <Empty text="No groups yet" />;
  const current = (groupId: number) =>
    links.filter((l) => num(l.group_id) === groupId && l.left_at == null).length;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((g) => (
        <div key={g.id} className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
          <h3 className="text-white text-lg font-semibold">{str(g.name)}</h3>
          {str(g.notes) && <p className="text-white/60 text-sm mt-1">{str(g.notes)}</p>}
          <p className="text-white/60 text-sm mt-4 pt-4 border-t border-surface-dark-lighter">
            {current(g.id)} current members
          </p>
        </div>
      ))}
    </div>
  );
}
