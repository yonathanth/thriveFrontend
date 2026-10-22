'use client';

import { useState, useEffect, useCallback } from 'react';
import { potentialCustomersApi, type PotentialCustomer } from '@/lib/api';
import DataTable, { type Column } from '@/components/admin/DataTable';

export default function PotentialCustomersPage() {
  const [customers, setCustomers] = useState<PotentialCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'converted' | 'ignored' | ''>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await potentialCustomersApi.getPotentialCustomers(
        statusFilter || undefined,
        limit,
        (page - 1) * limit
      );
      setCustomers(response.data);
      setTotal(response.total);
    } catch (err) {
      console.error('Failed to fetch potential customers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      converted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      ignored: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles] || styles.pending
        }`}
      >
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const columns: Column<PotentialCustomer>[] = [
    {
      key: 'fullName',
      header: 'Name',
      render: (customer: PotentialCustomer) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-lg">person</span>
          </div>
          <div>
            <p className="text-white font-medium">{customer.fullName}</p>
            <p className="text-white/40 text-xs">{customer.phoneNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (customer: PotentialCustomer) => (
        <span className="text-white/80">{customer.email || '-'}</span>
      ),
    },
    {
      key: 'serviceId',
      header: 'Service',
      render: (customer: PotentialCustomer) => (
        <span className="text-white/80">{customer.serviceId ? `Service #${customer.serviceId}` : '-'}</span>
      ),
    },
    {
      key: 'registeredAt',
      header: 'Registered',
      render: (customer: PotentialCustomer) => (
        <span className="text-white/80">{formatDate(customer.registeredAt)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (customer: PotentialCustomer) => getStatusBadge(customer.status),
    },
  ];

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white text-3xl font-bold mb-2">Potential Customers</h1>
          <p className="text-white/60">View and manage potential customers who registered via the web app</p>
        </div>

        {/* Filters */}
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-dark-lighter border border-surface-dark-lighter text-white placeholder-white/40 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as typeof statusFilter);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg bg-surface-dark-lighter border border-surface-dark-lighter text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="converted">Converted</option>
              <option value="ignored">Ignored</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-primary text-black font-medium hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-white/60">Loading...</div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center text-white/60">No potential customers found</div>
          ) : (
            <>
              <DataTable 
                data={customers} 
                columns={columns} 
                keyExtractor={(customer) => customer.id}
              />
              <div className="p-4 border-t border-surface-dark-lighter flex items-center justify-between">
                <p className="text-white/60 text-sm">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} customers
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-surface-dark-lighter border border-surface-dark-lighter text-white hover:bg-surface-dark-lighter/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * limit >= total}
                    className="px-4 py-2 rounded-lg bg-surface-dark-lighter border border-surface-dark-lighter text-white hover:bg-surface-dark-lighter/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

