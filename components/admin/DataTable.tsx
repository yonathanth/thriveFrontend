'use client';

import { ReactNode } from 'react';
import Icon from '@/components/ui/Icon';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export default function DataTable<T extends object>({
  columns,
  data,
  keyExtractor,
  isLoading,
  emptyMessage = 'No data available',
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-surface-dark-lighter" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-t border-surface-dark-lighter">
              <div className="flex items-center gap-4 p-4">
                <div className="h-4 bg-surface-dark-lighter rounded w-1/4" />
                <div className="h-4 bg-surface-dark-lighter rounded w-1/3" />
                <div className="h-4 bg-surface-dark-lighter rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-dark rounded-xl border border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="portal-table w-full">
          <thead>
            <tr className="bg-white/2 border-b border-white/5">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-[0.7rem] font-semibold text-white/45 uppercase tracking-[0.1em] ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-white/40"
                >
                  <Icon name="inbox" className="text-4xl mb-2 block opacity-50" />
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={`transition-colors ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-primary/5'
                      : ''
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-4 text-sm text-white/80 ${column.className || ''}`}
                    >
                      {column.render
                        ? column.render(item)
                        : String((item as Record<string, unknown>)[column.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Pagination component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-surface-dark-lighter">
      <div className="text-sm text-white/40">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-white/60 hover:bg-surface-dark-lighter disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="chevron_left" className="text-xl" />
        </button>
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1 rounded-lg text-sm text-white/60 hover:bg-surface-dark-lighter transition-colors"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-2 text-white/40">...</span>
            )}
          </>
        )}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              page === currentPage
                ? 'bg-primary text-black font-medium'
                : 'text-white/60 hover:bg-surface-dark-lighter'
            }`}
          >
            {page}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-2 text-white/40">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1 rounded-lg text-sm text-white/60 hover:bg-surface-dark-lighter transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-white/60 hover:bg-surface-dark-lighter disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="chevron_right" className="text-xl" />
        </button>
      </div>
    </div>
  );
}








