'use client';

import { useState, useEffect } from 'react';
import {
  dashboardApi,
  DashboardOverview,
  RevenueBreakdown,
  MemberGrowth,
} from '@/lib/api';
import StatsCard from '@/components/admin/StatsCard';
import { useAuth } from '@/contexts/AuthContext';
import FinanceFromTag from '@/components/admin/FinanceFromTag';
import Icon from '@/components/ui/Icon';

export default function DashboardPage() {
  // Revenue and transactions are admin-only; the API refuses them to managers too.
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [revenue, setRevenue] = useState<RevenueBreakdown | null>(null);
  const [growth, setGrowth] = useState<MemberGrowth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        const [overviewData, revenueData, growthData] = await Promise.all([
          dashboardApi.getOverview(),
          isAdmin ? dashboardApi.getRevenue() : Promise.resolve(null),
          dashboardApi.getMemberGrowth(),
        ]);
        setOverview(overviewData);
        setRevenue(revenueData);
        setGrowth(growthData);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [isAdmin]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icon name="error" className="text-4xl text-red-400 mb-2" />
          <p className="text-white/60">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <p className="text-white/60 mt-1">Welcome back! Here&apos;s your gym overview.</p>
        <FinanceFromTag className="mt-2" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6 animate-pulse"
            >
              <div className="size-12 rounded-xl bg-surface-dark-lighter mb-4" />
              <div className="h-4 bg-surface-dark-lighter rounded w-1/2 mb-2" />
              <div className="h-8 bg-surface-dark-lighter rounded w-3/4" />
            </div>
          ))
        ) : (
          <>
            <StatsCard
              title="Total Members"
              value={overview?.totalMembers || 0}
              icon="group"
              color="primary"
              trend={growth ? { value: growth.monthOverMonthGrowth, isPositive: growth.monthOverMonthGrowth > 0 } : undefined}
            />
            <StatsCard
              title="Active Members"
              value={overview?.activeMembers || 0}
              icon="verified"
              color="green"
            />
            <StatsCard
              title="Today's Check-ins"
              value={overview?.attendanceToday || 0}
              icon="fact_check"
              color="blue"
            />
            {isAdmin ? (
              <StatsCard
                title="Monthly Revenue"
                value={formatCurrency(overview?.revenueThisMonth || 0)}
                icon="payments"
                color="orange"
                subtitle={`${overview?.newMembersThisMonth || 0} new this month`}
              />
            ) : (
              <StatsCard
                title="New This Month"
                value={overview?.newMembersThisMonth || 0}
                icon="person_add"
                color="orange"
              />
            )}
          </>
        )}
      </div>

      {/* Revenue Overview - full width (admins only) */}
      {isAdmin && (
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-semibold">Revenue Overview</h2>
              <p className="text-white/40 text-sm">Monthly revenue breakdown</p>
            </div>
            <div className="text-right">
              <p className="text-white text-2xl font-bold">
                {formatCurrency(revenue?.thisYear || 0)}
              </p>
              <p className="text-white/40 text-xs">Total Revenue</p>
            </div>
          </div>
          {isLoading ? (
            <div className="h-48 bg-surface-dark-lighter rounded-lg animate-pulse" />
          ) : (
            <div className="space-y-3">
              {revenue?.byMonth?.slice().reverse().map((month, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-white/60 text-sm w-16">{month.month}</span>
                  <div className="flex-1 h-6 bg-surface-dark-lighter rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (month.revenue / (revenue?.thisMonth || 1)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-white text-sm font-medium w-24 text-right">
                    {formatCurrency(month.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Quick Stats - Revenue by Category (admins only) & Member Growth */}
      <div className={`grid grid-cols-1 gap-6 ${isAdmin ? 'md:grid-cols-2' : ''}`}>
        {/* Revenue by Category */}
        {isAdmin && (
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Icon name="category" className="text-orange-400" />
            Revenue by Category
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-surface-dark-lighter rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {revenue?.byCategory && revenue.byCategory.length > 0 ? (
                revenue.byCategory
                  .sort((a, b) => b.revenue - a.revenue)
                  .slice(0, 4)
                  .map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-surface-dark-lighter last:border-0"
                    >
                      <span className="text-white/80 capitalize">{item.category}</span>
                      <span className="text-orange-400 font-medium">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  ))
              ) : (
                <p className="text-white/40 text-sm">No revenue data by category</p>
              )}
            </div>
          )}
        </div>
        )}

        {/* Member Growth */}
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Icon name="trending_up" className="text-emerald-400" />
            Growth Metrics
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-surface-dark-lighter rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Growth Rate</span>
                <span
                  className={`font-bold ${
                    (growth?.monthOverMonthGrowth || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {(growth?.monthOverMonthGrowth || 0) >= 0 ? '+' : ''}
                  {growth?.monthOverMonthGrowth?.toFixed(1) || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">New This Month</span>
                <span className="text-white font-bold">
                  {growth?.newThisMonth || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">New Last Month</span>
                <span className="text-white font-bold">
                  {growth?.newLastMonth || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Total Members</span>
                <span className="text-white font-bold">
                  {growth?.total || 0}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





