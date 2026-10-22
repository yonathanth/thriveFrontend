'use client';

import { useState, useEffect } from 'react';
import { smsApi, SmsBalance } from '@/lib/api';

export default function SmsBalanceCard() {
  const [balance, setBalance] = useState<SmsBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await smsApi.getBalance();
      setBalance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">Account Balance</h3>
        <button
          onClick={fetchBalance}
          disabled={isLoading}
          className="text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh balance"
        >
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </div>

      {isLoading && !balance ? (
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-surface-dark-lighter rounded w-1/2" />
          <div className="h-4 bg-surface-dark-lighter rounded w-1/3" />
        </div>
      ) : error ? (
        <div className="text-red-400 text-sm">{error}</div>
      ) : balance ? (
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {parseFloat(balance.balance).toFixed(2)}
            </span>
            <span className="text-white/60 text-sm">ETB</span>
          </div>
          <div className="text-white/60 text-sm">
            ~{balance.estimatedMessages.toLocaleString()} messages available
          </div>
        </div>
      ) : null}
    </div>
  );
}







