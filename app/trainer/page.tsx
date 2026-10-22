'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { Column, Pagination } from '@/components/admin/DataTable';
import StatsCard from '@/components/admin/StatsCard';
import { trainerApi, MembershipSummary, TrainerStats, ApiError } from '@/lib/api';
import { ErrorNote, MembershipBadge, formatDate } from '@/components/portal/membership';

export default function TrainerHomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [today, setToday] = useState<{ memberId: number; memberName: string; checkInTime: string }[]>([]);
  const [members, setMembers] = useState<MembershipSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([trainerApi.stats(), trainerApi.today()])
      .then(([s, t]) => {
        setStats(s);
        setToday(t);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load'));
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await trainerApi.members({ page, limit: 20, search: search || undefined });
      setMembers(res.data);
      setTotalPages(Math.max(1, res.totalPages));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: Column<MembershipSummary>[] = [
    {
      key: 'name',
      header: 'Member',
      render: (m) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
            {m.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.profileImageUrl} alt="" className="size-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-lg">person</span>
            )}
          </div>
          <div>
            <p className="text-white font-medium">{m.fullName}</p>
            <p className="text-white/40 text-xs">{m.plan ?? 'No plan'}</p>
          </div>
        </div>
      ),
    },
    { key: 'state', header: 'Membership', render: (m) => <MembershipBadge m={m} /> },
    { key: 'days', header: 'Days left', render: (m) => <span className="text-white">{m.daysRemaining}</span> },
    {
      key: 'end',
      header: 'Ends',
      render: (m) => <span className="text-white/60 text-sm">{formatDate(m.endDate)}</span>,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-white text-2xl font-bold">My members</h1>
        <p className="text-white/60 mt-1">Members assigned to you in the desktop app.</p>
      </div>

      {error && <ErrorNote message={error} />}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Assigned" value={stats.assigned} icon="group" />
          <StatsCard title="Active" value={stats.active} icon="check_circle" color="green" />
          <StatsCard title="Ending in 7 days" value={stats.expiringIn7Days} icon="schedule" color="orange" />
          <StatsCard title="Checked in today" value={stats.checkedInToday} icon="fact_check" color="blue" />
        </div>
      )}

      {today.length > 0 && (
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-4">
          <p className="text-white/60 text-sm mb-2">In today</p>
          <div className="flex flex-wrap gap-2">
            {today.map((c) => (
              <button
                key={`${c.memberId}-${c.checkInTime}`}
                onClick={() => router.push(`/trainer/members/${c.memberId}`)}
                className="px-3 py-1.5 rounded-full bg-surface-dark-lighter text-white text-sm hover:text-primary"
              >
                {c.memberName} ·{' '}
                {new Date(c.checkInTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSearch(searchInput.trim());
        }}
      >
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name"
          className="flex-1 h-10 px-3 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-primary/50"
        />
        <button type="submit" className="h-10 px-4 bg-surface-dark-lighter text-white/80 rounded-lg hover:text-white">
          Search
        </button>
      </form>

      <DataTable
        columns={columns}
        data={members}
        keyExtractor={(m) => m.id}
        isLoading={isLoading}
        emptyMessage="No members are assigned to you yet"
        onRowClick={(m) => router.push(`/trainer/members/${m.id}`)}
      />
      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}
