'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  attendanceApi,
  Attendance,
  AttendanceStats,
  TodayAttendance,
  PaginatedResponse,
} from '@/lib/api';
import DataTable, { Pagination, type Column } from '@/components/admin/DataTable';
import StatsCard from '@/components/admin/StatsCard';

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<PaginatedResponse<Attendance> | null>(null);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [today, setToday] = useState<TodayAttendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('');
  const limit = 10;

  const fetchAttendance = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await attendanceApi.getAll({
        page,
        limit,
        startDate: dateFilter || undefined,
        endDate: dateFilter || undefined,
      });
      setAttendance(data);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, dateFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const [statsData, todayData] = await Promise.all([
        attendanceApi.getStats(),
        attendanceApi.getToday(),
      ]);
      setStats(statsData);
      setToday(todayData);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatTime = (date: string | null | undefined) => {
    if (!date) return 'Invalid Date';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return dateObj.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Invalid Date';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return dateObj.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const columns: Column<Attendance>[] = [
    {
      key: 'member',
      header: 'Member',
      render: (record: Attendance) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
            <span className="material-symbols-outlined text-lg">person</span>
          </div>
          <div>
            <p className="text-white font-medium">
              {record.member?.fullName || 'Unknown'}
            </p>
            <p className="text-white/40 text-xs">
              {record.member?.memberId || '-'}
            </p>
            <p className="text-white/50 text-xs">
              Service: {record.member?.service?.name || record.member?.serviceType || '-'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (record: Attendance) => (
        <span className="text-white/80">{formatDate(record.date)}</span>
      ),
    },
    {
      key: 'checkIn',
      header: 'Check-in',
      render: (record: Attendance) => (
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400 text-lg">
            login
          </span>
          <span className="text-white">{formatTime(record.date)}</span>
        </div>
      ),
    },
    {
      key: 'checkOut',
      header: 'Check-out',
      render: () => (
        <span className="text-white/40">-</span>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      render: () => <span className="text-emerald-400">In gym</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12 text-right',
      render: () => (
        <span className="material-symbols-outlined text-white/40">
          chevron_right
        </span>
      ),
    },
  ];

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAttendance();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">Attendance</h1>
          <p className="text-white/60 mt-1">Track member check-ins and attendance patterns</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Check-ins"
          value={stats?.today || 0}
          icon="today"
          color="blue"
        />
        <StatsCard
          title="This Week"
          value={stats?.thisWeek || 0}
          icon="date_range"
          color="green"
        />
        <StatsCard
          title="This Month"
          value={stats?.thisMonth || 0}
          icon="calendar_month"
          color="orange"
        />
        <StatsCard
          title="Daily Average"
          value={stats?.averageDaily?.toFixed(1) || '0'}
          icon="analytics"
          color="primary"
        />
      </div>

      {/* Today's Activity */}
      <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold">Today&apos;s Activity</h2>
            <p className="text-white/40 text-sm">{today?.count || 0} members checked in today</p>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm">Live</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {today?.checkIns && today.checkIns.length > 0 ? (
            <>
              {today.checkIns.slice(0, 10).map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="flex items-center gap-2 px-3 py-2 bg-surface-dark-lighter rounded-lg"
                >
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-sm">person</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {checkIn.memberName || 'Unknown'}
                    </p>
                    <p className="text-white/40 text-xs">{formatTime(checkIn.checkInTime)}</p>
                  </div>
                </div>
              ))}
              {(today.count || 0) > 10 && (
                <div className="flex items-center px-3 py-2 bg-surface-dark-lighter rounded-lg text-white/60">
                  +{(today.count || 0) - 10} more
                </div>
              )}
            </>
          ) : (
            <p className="text-white/40 text-sm">No check-ins yet today</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-4">
        <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              calendar_today
            </span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by date..."
              className="w-full h-10 pl-10 pr-4 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          {dateFilter && (
            <button
              type="button"
              onClick={() => {
                setDateFilter('');
                setPage(1);
              }}
              className="h-10 px-4 bg-surface-dark-lighter text-white/60 rounded-lg hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="h-10 px-6 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Attendance Table */}
      <div>
        <DataTable<Attendance>
          columns={columns}
          data={attendance?.data || []}
          keyExtractor={(record) => record.id}
          isLoading={isLoading}
          emptyMessage="No attendance records found"
        />
        {attendance && (
          <Pagination
            currentPage={attendance.meta.page}
            totalPages={attendance.meta.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}

