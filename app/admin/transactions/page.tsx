'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import {
  transactionsApi,
  Transaction,
  TransactionType,
  TransactionStats,
  PaginatedResponse,
} from '@/lib/api';
import DataTable, { Pagination, type Column } from '@/components/admin/DataTable';
import StatsCard from '@/components/admin/StatsCard';

function sanitizeText(s: string): string {
  return s.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDateForExport(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().slice(0, 10);
}

function formatDateTimeForExport(d: Date): string {
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: 'Income',
  expense: 'Expense',
  positive_return: 'Positive Return',
  negative_return: 'Negative Return',
};

function isInflow(type: TransactionType): boolean {
  return type === 'income' || type === 'positive_return';
}

const SOURCE_LABELS: Record<NonNullable<Transaction['source']>, string> = {
  membership: 'Membership',
  addon: 'Add-on',
  drop_in: 'Drop-in',
  other: 'Other',
};

/** What the payment was for, as the desktop names it, e.g. "Add-on: Sauna". */
function sourceLabel(tx: Transaction): string {
  if (!tx.source || tx.source === 'other') return tx.category || '-';
  const kind = SOURCE_LABELS[tx.source];
  return tx.sourceName ? `${kind}: ${tx.sourceName}` : kind;
}

type ExportRangePreset = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
type FilterRangePreset = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getRangeFromPreset(preset: ExportRangePreset): { startDate?: string; endDate?: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (preset === 'daily') {
    const day = toDateInputValue(today);
    return { startDate: day, endDate: day };
  }

  if (preset === 'weekly') {
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + mondayOffset);
    return { startDate: toDateInputValue(weekStart), endDate: toDateInputValue(today) };
  }

  if (preset === 'monthly') {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return { startDate: toDateInputValue(monthStart), endDate: toDateInputValue(today) };
  }

  const yearStart = new Date(today.getFullYear(), 0, 1);
  return { startDate: toDateInputValue(yearStart), endDate: toDateInputValue(today) };
}

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<PaginatedResponse<Transaction> | null>(null);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [filteredCardTotals, setFilteredCardTotals] = useState<{
    income: number;
    outflows: number;
    net: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [startDate, setStartDate] = useState(() => getRangeFromPreset('daily').startDate ?? '');
  const [endDate, setEndDate] = useState(() => getRangeFromPreset('daily').endDate ?? '');
  const [filterRangePreset, setFilterRangePreset] = useState<FilterRangePreset>('daily');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showExportFilterModal, setShowExportFilterModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pendingExportFormat, setPendingExportFormat] = useState<'pdf' | 'excel' | null>(null);
  const [exportRangePreset, setExportRangePreset] = useState<ExportRangePreset>('monthly');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const limit = 10;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await transactionsApi.getAll({
        page,
        limit,
        transactionType: (typeFilter as TransactionType) || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, typeFilter, startDate, endDate]);

  const fetchAllTransactionsByFilter = useCallback(
    async (options?: {
      transactionType?: TransactionType;
      startDate?: string;
      endDate?: string;
    }): Promise<Transaction[]> => {
      const all: Transaction[] = [];
      const pageLimit = 100;
      let pageNum = 1;
      let hasMore = true;

      while (hasMore) {
        const res = await transactionsApi.getAll({
          page: pageNum,
          limit: pageLimit,
          transactionType: options?.transactionType,
          startDate: options?.startDate,
          endDate: options?.endDate,
        });
        all.push(...res.data);
        hasMore = res.data.length === pageLimit && pageNum * pageLimit < res.meta.total;
        pageNum++;
      }

      return all;
    },
    [],
  );

  const fetchFilteredCardTotals = useCallback(async () => {
    try {
      const allTx = await fetchAllTransactionsByFilter({
        transactionType: (typeFilter as TransactionType) || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      const totals = allTx.reduce(
        (acc, tx) => {
          if (isInflow(tx.type)) {
            acc.income += tx.amount;
          } else {
            acc.outflows += tx.amount;
          }
          return acc;
        },
        { income: 0, outflows: 0, net: 0 },
      );
      totals.net = totals.income - totals.outflows;
      setFilteredCardTotals(totals);
    } catch (err) {
      console.error('Failed to fetch filtered card totals:', err);
      setFilteredCardTotals(null);
    }
  }, [fetchAllTransactionsByFilter, typeFilter, startDate, endDate]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await transactionsApi.getStats({
        transactionType: (typeFilter as TransactionType) || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [typeFilter, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchFilteredCardTotals();
  }, [fetchFilteredCardTotals]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getTypeBadgeClass = (type: TransactionType) => {
    switch (type) {
      case 'income':
        return 'bg-emerald-500/10 text-emerald-400';
      case 'expense':
        return 'bg-red-500/10 text-red-400';
      case 'positive_return':
        return 'bg-teal-500/10 text-teal-400';
      case 'negative_return':
        return 'bg-amber-500/10 text-amber-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const columns: Column<Transaction>[] = [
    {
      key: 'type',
      header: 'Type',
      render: (transaction: Transaction) => (
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getTypeBadgeClass(
            transaction.type
          )}`}
        >
          <span className="material-symbols-outlined text-sm">
            {isInflow(transaction.type) ? 'arrow_downward' : 'arrow_upward'}
          </span>
          {TRANSACTION_TYPE_LABELS[transaction.type] ?? transaction.type}
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (transaction: Transaction) => (
        <div>
          <p className="text-white font-medium">
            {transaction.description || transaction.category}
          </p>
          {transaction.member && (
            <p className="text-white/40 text-xs">{transaction.member.fullName}</p>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (transaction: Transaction) => (
        <span className="text-white/80">{sourceLabel(transaction)}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (transaction: Transaction) => (
        <span className="text-white/80">{formatDate(transaction.transactionDate)}</span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Payment',
      render: (transaction: Transaction) => (
        <span className="text-white/60 capitalize">
          {transaction.paymentMethod || 'N/A'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (transaction: Transaction) => (
        <span
          className={`font-semibold ${
            isInflow(transaction.type) ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {isInflow(transaction.type) ? '+' : '-'}
          {formatCurrency(transaction.amount)}
          {transaction.discountAmount ? (
            <span className="block text-white/40 text-xs font-normal">
              {formatCurrency(transaction.discountAmount)} off
              {transaction.discountCode ? ` (${transaction.discountCode})` : ''}
            </span>
          ) : null}
        </span>
      ),
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

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
    fetchStats();
  };

  const handleMainRangePresetChange = (preset: FilterRangePreset) => {
    setFilterRangePreset(preset);
    if (preset === 'custom') return;
    const range = getRangeFromPreset(preset);
    setStartDate(range.startDate || '');
    setEndDate(range.endDate || '');
    setPage(1);
  };

  const fetchAllTransactionsForExport = async (
    exportDateRange?: { startDate?: string; endDate?: string },
  ): Promise<Transaction[]> => {
    return fetchAllTransactionsByFilter({
      transactionType: (typeFilter as TransactionType) || undefined,
      startDate: exportDateRange?.startDate || undefined,
      endDate: exportDateRange?.endDate || undefined,
    });
  };

  const buildFilterSummary = (exportDateRange?: { startDate?: string; endDate?: string }): string => {
    const parts: string[] = [];
    if (typeFilter) {
      parts.push(`Type: ${TRANSACTION_TYPE_LABELS[typeFilter as TransactionType] ?? typeFilter}`);
    } else {
      parts.push('Type: All');
    }
    if (exportDateRange?.startDate || exportDateRange?.endDate) {
      parts.push(`Date: ${exportDateRange.startDate || '...'} -> ${exportDateRange.endDate || '...'}`);
    }
    return parts.length ? parts.join(' | ') : 'All filters';
  };

  const handleExport = async (
    format: 'pdf' | 'excel',
    exportDateRange?: { startDate?: string; endDate?: string },
  ) => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      const allTx = await fetchAllTransactionsForExport(exportDateRange);
      const exportTotals = allTx.reduce(
        (acc, tx) => {
          if (isInflow(tx.type)) {
            acc.income += tx.amount;
          } else {
            acc.expense += tx.amount;
          }
          return acc;
        },
        { income: 0, expense: 0, net: 0 }
      );
      exportTotals.net = exportTotals.income - exportTotals.expense;
      const filterSummary = buildFilterSummary(exportDateRange);
      const now = new Date();
      const generatedAt = formatDateTimeForExport(now);
      const filenameBase = `finance-export-${now.toISOString().slice(0, 10)}`;

      if (format === 'excel') {
        const lines: string[] = [];
        lines.push(`"FINANCIAL REPORT"`);
        lines.push(`"Generated: ${generatedAt}"`);
        lines.push(`"${filterSummary}"`);
        lines.push('');
        lines.push(`"SUMMARY"`);
        lines.push(`"Total Income","${exportTotals.income.toFixed(2)} ETB"`);
        lines.push(`"Total Expenses","${exportTotals.expense.toFixed(2)} ETB"`);
        lines.push(`"Net Profit","${exportTotals.net.toFixed(2)} ETB"`);
        lines.push('');
        const header = ['Date', 'Type', 'Description', 'Member', 'Payment Method', 'Category', 'Amount (ETB)', 'Status'];
        lines.push(header.map((h) => `"${h}"`).join(','));
        allTx.forEach((tx) => {
          const typeLabel = TRANSACTION_TYPE_LABELS[tx.type] ?? tx.type;
          const rows = [
            formatDateForExport(tx.transactionDate),
            sanitizeText(typeLabel),
            sanitizeText(tx.description || tx.category || ''),
            sanitizeText(tx.member?.fullName || '-'),
            sanitizeText(tx.paymentMethod || '-'),
            sanitizeText(sourceLabel(tx)),
            (isInflow(tx.type) ? '+' : '-') + tx.amount.toFixed(2),
            '-',
          ];
          lines.push(rows.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','));
        });
        const csv = lines.join('\n') + '\n';
        const blob = new Blob([csv], { type: 'text/csv' });
        triggerDownload(blob, `${filenameBase}.csv`);
      } else {
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const pageWidth = 842;
        const pageHeight = 595;
        const margin = 50;
        const lineHeight = 14;
        const rowHeight = 20;
        const headerHeight = 25;

        let pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;

        const addLine = (
          text: string,
          bold = false,
          size = 10,
          align: 'left' | 'center' | 'right' = 'left'
        ) => {
          if (y < margin + lineHeight) {
            pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }
          let x = margin;
          if (align === 'center') {
            const textWidth = font.widthOfTextAtSize(text, size);
            x = (pageWidth - textWidth) / 2;
          } else if (align === 'right') {
            const textWidth = font.widthOfTextAtSize(text, size);
            x = pageWidth - margin - textWidth;
          }
          pdfPage.drawText(text, {
            x,
            y,
            size,
            font: bold ? fontBold : font,
            color: rgb(0, 0, 0),
          });
          y -= lineHeight + 2;
        };

        addLine(sanitizeText('Gym Management System'), true, 16, 'center');
        y -= 6;
        addLine(sanitizeText('Financial Report'), true, 20, 'center');
        y -= 6;
        addLine(sanitizeText(`Generated: ${generatedAt}`), false, 10, 'center');
        y -= 12;
        addLine(sanitizeText('Filters Applied:'), true, 12);
        y -= 6;
        addLine(sanitizeText(filterSummary), false, 10);
        y -= 12;
        addLine(sanitizeText('Summary:'), true, 12);
        y -= 6;
        addLine(sanitizeText(`Total Income: ${exportTotals.income.toFixed(2)} ETB`), false, 10);
        addLine(sanitizeText(`Total Expenses: ${exportTotals.expense.toFixed(2)} ETB`), false, 10);
        addLine(sanitizeText(`Net Profit: ${exportTotals.net.toFixed(2)} ETB`), false, 10);
        y -= 12;

        const headers = [
          { key: 'date', header: 'Date' },
          { key: 'type', header: 'Type' },
          { key: 'description', header: 'Description' },
          { key: 'member', header: 'Member' },
          { key: 'method', header: 'Payment Method' },
          { key: 'category', header: 'Category' },
          { key: 'amount', header: 'Amount (ETB)' },
          { key: 'status', header: 'Status' },
        ];
        const colWidths = [70, 65, 120, 90, 90, 80, 80, 50];

        const drawTableHeader = (startY: number) => {
          let x = margin;
          headers.forEach((h, i) => {
            pdfPage.drawRectangle({
              x,
              y: startY - headerHeight,
              width: colWidths[i],
              height: headerHeight,
              color: rgb(0.878, 0.878, 0.878),
            });
            pdfPage.drawText(sanitizeText(h.header), {
              x: x + 5,
              y: startY - headerHeight + 8,
              size: 9,
              font: fontBold,
              color: rgb(0, 0, 0),
            });
            x += colWidths[i];
          });
        };

        drawTableHeader(y);
        y -= headerHeight + 5;

        allTx.forEach((tx) => {
          if (y < margin + rowHeight) {
            pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
            drawTableHeader(y);
            y -= headerHeight + 5;
          }
          const typeLabel =
            tx.type === 'positive_return'
              ? 'Pos Return'
              : tx.type === 'negative_return'
                ? 'Neg Return'
                : tx.type === 'income'
                  ? 'Income'
                  : 'Expense';
          const vals = [
            formatDateForExport(tx.transactionDate),
            typeLabel,
            (tx.description || tx.category || '-').substring(0, 25),
            (tx.member?.fullName || '-').substring(0, 15),
            (tx.paymentMethod || '-').substring(0, 12),
            sourceLabel(tx).substring(0, 12),
            (isInflow(tx.type) ? '+' : '-') + tx.amount.toFixed(2),
            '-',
          ];
          let x = margin;
          vals.forEach((v, i) => {
            const text = sanitizeText(String(v).substring(0, 20));
            pdfPage.drawText(text, {
              x: x + 5,
              y: y - rowHeight + 5,
              size: 8,
              font,
              color: rgb(0, 0, 0),
            });
            x += colWidths[i];
          });
          y -= rowHeight;
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
        triggerDownload(blob, `${filenameBase}.pdf`);
      }
    } catch (err) {
      console.error('Export failed', err);
      window.alert(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const openExportFilterModal = (format: 'pdf' | 'excel') => {
    const defaultRange = getRangeFromPreset('monthly');
    setShowExportMenu(false);
    setPendingExportFormat(format);
    setExportRangePreset('monthly');
    setExportStartDate(defaultRange.startDate || '');
    setExportEndDate(defaultRange.endDate || '');
    setShowExportFilterModal(true);
  };

  const handleExportRangePresetChange = (preset: ExportRangePreset) => {
    setExportRangePreset(preset);
    if (preset === 'custom') return;
    const range = getRangeFromPreset(preset);
    setExportStartDate(range.startDate || '');
    setExportEndDate(range.endDate || '');
  };

  const handleConfirmExport = async () => {
    if (!pendingExportFormat) return;
    if (!exportStartDate || !exportEndDate) {
      window.alert('Please select both start and end dates for export.');
      return;
    }
    if (exportStartDate > exportEndDate) {
      window.alert('Start date cannot be after end date.');
      return;
    }
    setShowExportFilterModal(false);
    await handleExport(pendingExportFormat, {
      startDate: exportStartDate,
      endDate: exportEndDate,
    });
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">Transactions</h1>
          <p className="text-white/60 mt-1">Manage income, outflows, and returns</p>
        </div>
        <div className="relative" ref={exportMenuRef}>
          <button
            type="button"
            onClick={() => setShowExportMenu((v) => !v)}
            disabled={exporting}
            className="h-10 px-4 flex items-center gap-2 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            {exporting ? 'Exporting...' : 'Export'}
            <span className="material-symbols-outlined text-lg">expand_more</span>
          </button>
          {showExportMenu && (
            <div
              className="absolute right-0 top-full mt-1 py-1 min-w-[160px] bg-surface-dark border border-surface-dark-lighter rounded-lg shadow-xl z-20"
              role="menu"
            >
              <button
                type="button"
                onClick={() => openExportFilterModal('pdf')}
                disabled={exporting}
                className="w-full px-4 py-2 text-left text-white hover:bg-surface-dark-lighter transition-colors flex items-center gap-2 disabled:opacity-60"
                role="menuitem"
              >
                <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                PDF
              </button>
              <button
                type="button"
                onClick={() => openExportFilterModal('excel')}
                disabled={exporting}
                className="w-full px-4 py-2 text-left text-white hover:bg-surface-dark-lighter transition-colors flex items-center gap-2 disabled:opacity-60"
                role="menuitem"
              >
                <span className="material-symbols-outlined text-lg">table_chart</span>
                Excel (CSV)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-4">
        <form onSubmit={handleFilter} className="flex flex-col xl:flex-row gap-4">
          <select
            value={filterRangePreset}
            onChange={(e) => handleMainRangePresetChange(e.target.value as FilterRangePreset)}
            className="h-10 px-4 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors xl:min-w-[150px]"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-4 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors xl:min-w-[170px]"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="positive_return">Positive Return</option>
            <option value="negative_return">Negative Return</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setFilterRangePreset('custom');
              setStartDate(e.target.value);
              setPage(1);
            }}
            placeholder="From Date"
            className="h-10 px-4 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors xl:min-w-[170px]"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setFilterRangePreset('custom');
              setEndDate(e.target.value);
              setPage(1);
            }}
            placeholder="To Date"
            className="h-10 px-4 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors xl:min-w-[170px]"
          />
          {(typeFilter || startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                setTypeFilter('');
                setStartDate('');
                setEndDate('');
                setFilterRangePreset('custom');
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
            Apply Filter
          </button>
        </form>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Income"
          value={formatCurrency(filteredCardTotals?.income ?? stats?.totalIncome ?? 0)}
          icon="trending_up"
          color="green"
        />
        <StatsCard
          title="Total Outflows"
          value={formatCurrency(filteredCardTotals?.outflows ?? stats?.totalOutflows ?? 0)}
          icon="trending_down"
          color="red"
        />
        <StatsCard
          title="Net Profit"
          value={formatCurrency(filteredCardTotals?.net ?? stats?.netProfit ?? 0)}
          icon="account_balance"
          color="primary"
        />
        <StatsCard
          title="This Month"
          value={formatCurrency(stats?.thisMonthIncome || 0)}
          icon="calendar_month"
          color="blue"
          trend={
            stats
              ? {
                  value: calculateChange(
                    stats.thisMonthIncome,
                    stats.lastMonthIncome
                  ),
                  isPositive:
                    stats.thisMonthIncome >= stats.lastMonthIncome,
                }
              : undefined
          }
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* This Month Overview */}
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
          <h2 className="text-white font-semibold mb-4">This Month</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <span className="material-symbols-outlined">arrow_downward</span>
                </div>
                <span className="text-white/80">Income</span>
              </div>
              <span className="text-emerald-400 font-semibold">
                {formatCurrency(stats?.thisMonthIncome || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                  <span className="material-symbols-outlined">arrow_upward</span>
                </div>
                <span className="text-white/80">Outflows</span>
              </div>
              <span className="text-red-400 font-semibold">
                {formatCurrency(stats?.thisMonthOutflows || 0)}
              </span>
            </div>
            <div className="border-t border-surface-dark-lighter pt-4 flex items-center justify-between">
              <span className="text-white font-medium">Net</span>
              <span
                className={`font-bold text-lg ${
                  (stats?.thisMonthIncome || 0) - (stats?.thisMonthOutflows || 0) >= 0
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {formatCurrency(
                  (stats?.thisMonthIncome || 0) - (stats?.thisMonthOutflows || 0)
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Last Month Overview */}
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
          <h2 className="text-white font-semibold mb-4">Last Month</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <span className="material-symbols-outlined">arrow_downward</span>
                </div>
                <span className="text-white/80">Income</span>
              </div>
              <span className="text-emerald-400 font-semibold">
                {formatCurrency(stats?.lastMonthIncome || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                  <span className="material-symbols-outlined">arrow_upward</span>
                </div>
                <span className="text-white/80">Outflows</span>
              </div>
              <span className="text-red-400 font-semibold">
                {formatCurrency(stats?.lastMonthOutflows || 0)}
              </span>
            </div>
            <div className="border-t border-surface-dark-lighter pt-4 flex items-center justify-between">
              <span className="text-white font-medium">Net</span>
              <span
                className={`font-bold text-lg ${
                  (stats?.lastMonthIncome || 0) - (stats?.lastMonthOutflows || 0) >= 0
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {formatCurrency(
                  (stats?.lastMonthIncome || 0) - (stats?.lastMonthOutflows || 0)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div>
        <DataTable<Transaction>
          columns={columns}
          data={transactions?.data || []}
          keyExtractor={(transaction) => transaction.id}
          onRowClick={(transaction) => router.push(`/admin/transactions/${transaction.id}`)}
          isLoading={isLoading}
          emptyMessage="No transactions found"
        />
        {transactions && (
          <Pagination
            currentPage={transactions.meta.page}
            totalPages={transactions.meta.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      {showExportFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg bg-surface-dark border border-surface-dark-lighter rounded-xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-white text-lg font-semibold">Export Date Range</h3>
                <p className="text-white/60 text-sm mt-1">
                  Choose a date filter for the {pendingExportFormat === 'pdf' ? 'PDF' : 'CSV'} export.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExportFilterModal(false)}
                className="text-white/60 hover:text-white"
                aria-label="Close export filter modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['daily', 'weekly', 'monthly', 'yearly', 'custom'] as ExportRangePreset[]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleExportRangePresetChange(preset)}
                  className={`h-10 rounded-lg border text-sm font-medium capitalize transition-colors ${
                    exportRangePreset === preset
                      ? 'bg-primary text-black border-primary'
                      : 'bg-surface-dark-lighter text-white border-surface-dark-lighter hover:border-primary/50'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-white/70 text-sm">Start Date</label>
                <input
                  type="date"
                  value={exportStartDate}
                  onChange={(e) => {
                    setExportRangePreset('custom');
                    setExportStartDate(e.target.value);
                  }}
                  className="w-full h-10 px-4 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-white/70 text-sm">End Date</label>
                <input
                  type="date"
                  value={exportEndDate}
                  onChange={(e) => {
                    setExportRangePreset('custom');
                    setExportEndDate(e.target.value);
                  }}
                  className="w-full h-10 px-4 bg-surface-dark-lighter border border-surface-dark-lighter rounded-lg text-white focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExportFilterModal(false)}
                className="h-10 px-4 rounded-lg bg-surface-dark-lighter text-white/80 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmExport}
                disabled={exporting}
                className="h-10 px-5 rounded-lg bg-primary text-black font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {exporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





