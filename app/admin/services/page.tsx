'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  servicesApi,
  Service,
  ServiceStats,
  PaginatedResponse,
} from '@/lib/api';
import StatsCard from '@/components/admin/StatsCard';

export default function ServicesPage() {
  const [services, setServices] = useState<PaginatedResponse<Service> | null>(null);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const parseBenefits = (description?: string): string[] => {
    if (!description) return [];
    try {
      const parsed = JSON.parse(description);
      return parsed.benefits || [];
    } catch {
      return [];
    }
  };

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await servicesApi.getAll({
        category: categoryFilter || undefined,
      });
      setServices(data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await servicesApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatDuration = (duration: number, unit: string) => {
    if (!unit) return `${duration} period`;
    if (duration === 1) {
      return `1 ${unit.slice(0, -1)}`;
    }
    return `${duration} ${unit}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold">Services</h1>
        <p className="text-white/60 mt-1">Manage gym membership plans and services</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Services"
          value={stats?.total || 0}
          icon="category"
          color="primary"
        />
        <StatsCard
          title="Active Services"
          value={stats?.active || 0}
          icon="check_circle"
          color="green"
        />
        <StatsCard
          title="Inactive Services"
          value={stats?.inactive || 0}
          icon="cancel"
          color="red"
        />
        <StatsCard
          title="Categories"
          value={stats?.categories || 0}
          icon="label"
          color="orange"
        />
      </div>

      {/* Filters */}
      <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-4 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
          >
            <option value="">All Categories</option>
            {stats?.byCategory.map((cat) => (
              <option key={cat.category} value={cat.category}>
                {cat.category} ({cat.count})
              </option>
            ))}
          </select>
          {categoryFilter && (
            <button
              onClick={() => setCategoryFilter('')}
              className="h-10 px-4 bg-surface-dark-lighter text-white/60 rounded-lg hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6 animate-pulse"
            >
              <div className="h-6 bg-surface-dark-lighter rounded w-3/4 mb-4" />
              <div className="h-4 bg-surface-dark-lighter rounded w-1/2 mb-6" />
              <div className="h-10 bg-surface-dark-lighter rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : services?.data.length === 0 ? (
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-white/40 mb-2">
            category
          </span>
          <p className="text-white/60">No services found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.data.map((service) => {
            const benefits = parseBenefits(service.description);
            return (
              <div
                key={service.id}
                className="bg-surface-dark rounded-xl border border-surface-dark-lighter transition-colors hover:border-primary/50"
              >
                <div className="p-6">
                  <div className="flex items-start mb-4">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-2xl">
                        fitness_center
                      </span>
                    </div>
                  </div>

                  <h3 className="text-white text-lg font-semibold mb-3">
                    {service.name}
                  </h3>
                  {service.category && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium mb-3">
                      {service.category}
                    </span>
                  )}
                  {benefits.length > 0 && (
                    <div className="mb-4">
                      <p className="text-white/40 text-xs mb-2">Benefits:</p>
                      <div className="flex flex-wrap gap-2">
                        {benefits.map((benefit, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                    <span>{formatDuration(service.duration, service.durationUnit)}</span>
                  </div>

                  <div className="pt-4 border-t border-surface-dark-lighter">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-white/40 text-xs mb-1">Price</p>
                        <p className="text-primary text-2xl font-bold">
                          {formatCurrency(service.price)}
                        </p>
                      </div>
                      <p className="text-white/40 text-xs">
                        per {service.durationUnit ? service.durationUnit.slice(0, -1) : 'period'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


