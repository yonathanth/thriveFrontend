'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { membersApi, Member, MemberStats, PaginatedResponse } from '@/lib/api';
import DataTable, { Pagination, type Column } from '@/components/admin/DataTable';
import StatsCard from '@/components/admin/StatsCard';

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<PaginatedResponse<Member> | null>(null);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await membersApi.getAll({
        page,
        limit,
        search: search || undefined,
        status: (statusFilter as 'active' | 'inactive' | 'frozen' | 'pending' | 'expired') || undefined,
      });
      setMembers(data);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await membersApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMembers();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      frozen: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      expired: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
          styles[status] || styles.inactive
        }`}
      >
        {status}
      </span>
    );
  };

  const columns: Column<Member>[] = [
    {
      key: 'fullName',
      header: 'Member',
      render: (member: Member) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-lg">person</span>
          </div>
          <div>
            <p className="text-white font-medium">{member.fullName}</p>
            <p className="text-white/40 text-xs">{member.memberId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (member: Member) => member.phone || '-',
    },
    {
      key: 'serviceType',
      header: 'Service',
      render: (member: Member) => (
        <span className="text-white/80">{member.serviceType || '-'}</span>
      ),
    },
    {
      key: 'membershipTier',
      header: 'Tier',
      render: (member: Member) => {
        if (!member.membershipTier) return <span className="text-white/40">-</span>;
        const tierColors: Record<string, string> = {
          silver: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
          gold: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
          platinum: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          bright: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        };
        const tierKey = member.membershipTier.toLowerCase();
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${
              tierColors[tierKey] || tierColors.silver
            }`}
          >
            {member.membershipTier}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (member: Member) => getStatusBadge(member.status),
    },
    {
      key: 'endDate',
      header: 'Expires',
      render: (member: Member) =>
        member.endDate
          ? new Date(member.endDate).toLocaleDateString('en-GB')
          : '-',
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: () => (
        <span className="material-symbols-outlined text-white/40">
          chevron_right
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">Members</h1>
          <p className="text-white/60 mt-1">
            Manage your gym members and their subscriptions
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Members"
          value={stats?.totalMembers || 0}
          icon="group"
          color="primary"
        />
        <StatsCard
          title="Active"
          value={stats?.activeMembers || 0}
          icon="verified"
          color="green"
        />
        <StatsCard
          title="Inactive"
          value={stats?.inactiveMembers || 0}
          icon="event_busy"
          color="red"
        />
        <StatsCard
          title="Frozen"
          value={stats?.frozenMembers || 0}
          icon="ac_unit"
          color="orange"
        />
        <StatsCard
          title="Pending"
          value={stats?.pendingMembers || 0}
          icon="schedule"
          color="blue"
        />
      </div>

      {/* Filters */}
      <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or member ID..."
              className="w-full h-10 pl-10 pr-4 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-4 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="frozen">Frozen</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>
          <button
            type="submit"
            className="h-10 px-6 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Members Table */}
      <div>
        <DataTable<Member>
          columns={columns}
          data={members?.data || []}
          keyExtractor={(member) => member.id}
          isLoading={isLoading}
          emptyMessage="No members found"
          onRowClick={(member) => router.push(`/admin/members/${member.id}`)}
        />
        {members && (
          <Pagination
            currentPage={members.meta.page}
            totalPages={members.meta.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}






