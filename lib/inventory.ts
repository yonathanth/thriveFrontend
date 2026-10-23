import type { AssignmentStatus, InventoryUnits } from './api';

/** "3 packs + 1 bottle", or "7 bottles" for an item sold only singly. Mirrors the desktop. */
export function describeQty(base: number, u: InventoryUnits): string {
  const plural = (n: number, word: string) => (n === 1 ? word : `${word}s`);
  const upp = u.unitsPerPack ?? 0;
  if (u.packName && upp >= 2 && base >= upp) {
    const packs = Math.floor(base / upp);
    const units = base % upp;
    const p = `${packs} ${plural(packs, u.packName)}`;
    // The total in single units, so nobody has to multiply.
    return `${units === 0 ? p : `${p} + ${units} ${plural(units, u.unitName)}`} (${base} ${plural(base, u.unitName)})`;
  }
  return `${base} ${plural(base, u.unitName)}`;
}

export const MOVEMENT_LABELS: Record<string, string> = {
  stock_in: 'Stock added',
  adjust_in: 'Adjusted up',
  adjust_out: 'Adjusted down',
  assign_out: 'Assigned',
  transfer_out: 'Transferred',
  accept: 'Accepted',
  reject_back: 'Rejected',
  cancel_back: 'Cancelled',
  return_to_store: 'Returned to store',
  sale: 'Sold',
  sale_void: 'Sale voided',
  asset_add: 'Asset added',
  asset_dispose: 'Asset disposed',
};

export const BUCKET_LABELS: Record<string, string> = {
  outside: 'Outside',
  store: 'Store',
  pending: 'Pending',
  holder: 'Holder',
  sold: 'Sold',
};

export const STATUS_STYLES: Record<AssignmentStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  accepted: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-300 ring-red-500/30',
  cancelled: 'bg-white/10 text-white/60 ring-white/20',
};

export function formatEtb(amount: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatWhen(iso: string | null): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

/** A local calendar day as YYYY-MM-DD. */
export function dayValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
