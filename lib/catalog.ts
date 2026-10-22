/**
 * The public catalog (plans, add-ons, weekly classes) as synced from the desktop app.
 * Read on the server and cached for a minute, so a price changed at the desk shows on
 * the site shortly after the next sync, with no deploy.
 */
import { API_URL } from "@/lib/api";

export interface CatalogPlan {
  /** Desktop service id; sent back as serviceId when someone registers for it. */
  id: number;
  name: string;
  category: string;
  description: string | null;
  /** What's included, e.g. ["Full access", "Shower", "Locker"]. Older APIs leave it out. */
  benefits?: string[];
  price: number;
  periodDays: number;
  groupSize: number | null;
  maxUsageCount: number | null;
}

export interface CatalogAddon {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  isFree: boolean;
  price: number;
  variants: { name: string; periodDays: number; price: number }[];
}

export interface CatalogClass {
  id: number;
  /** 1 = Monday ... 7 = Sunday */
  dayOfWeek: number;
  title: string;
  startTime: string;
  endTime: string;
  trainer: string | null;
  room: string | null;
  color: string | null;
}

export interface Catalog {
  plans: CatalogPlan[];
  addons: CatalogAddon[];
  classes: CatalogClass[];
}

const EMPTY: Catalog = { plans: [], addons: [], classes: [] };

/** Never throws: if the API is down the pages render their empty states. */
export async function getCatalog(): Promise<Catalog> {
  try {
    const res = await fetch(`${API_URL}/api/site/catalog`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as Partial<Catalog>;
    return {
      plans: data.plans ?? [],
      addons: data.addons ?? [],
      classes: data.classes ?? [],
    };
  } catch (err) {
    console.error("Could not load the catalog:", err);
    return EMPTY;
  }
}

export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** "30 days" → "1 month", "365" → "1 year", the way people say it. */
export function formatPeriod(days: number): string {
  if (days >= 360 && days % 365 <= 10) {
    const y = Math.max(1, Math.round(days / 365));
    return y === 1 ? "1 year" : `${y} years`;
  }
  if (days >= 28) {
    const m = Math.max(1, Math.round(days / 30));
    return m === 1 ? "1 month" : `${m} months`;
  }
  if (days % 7 === 0 && days >= 7) {
    const w = days / 7;
    return w === 1 ? "1 week" : `${w} weeks`;
  }
  return days === 1 ? "1 day" : `${days} days`;
}

export function formatPrice(amount: number, currency = "ETB"): string {
  return `${currency} ${Math.round(amount).toLocaleString("en-US")}`;
}

/** "06:00" → "6:00 AM" */
export function formatTime(hhmm: string): string {
  const m = /^(\d{1,2}):(\d{2})/.exec(hhmm);
  if (!m) return hhmm;
  const h = Number(m[1]);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m[2]} ${suffix}`;
}

/** Plans grouped by their desktop category, in first-seen order. */
export function groupPlans(plans: CatalogPlan[]): { category: string; plans: CatalogPlan[] }[] {
  const groups = new Map<string, CatalogPlan[]>();
  for (const p of plans) {
    const key = p.category?.trim() || "Membership";
    const list = groups.get(key) ?? [];
    list.push(p);
    groups.set(key, list);
  }
  return [...groups.entries()].map(([category, list]) => ({
    category,
    plans: [...list].sort((a, b) => a.periodDays - b.periodDays || a.price - b.price),
  }));
}

/** "body building" → "Body Building": desktop names are often typed in lowercase. */
export function titleCase(s: string): string {
  return s.trim().replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

/** Catch-all category names that are not a service worth advertising. */
export function isCatchAllCategory(name: string): boolean {
  return /^(others?|misc(ellaneous)?|general|uncategori[sz]ed|n\/a|-)$/i.test(name.trim());
}

/** Distinct class titles, most frequent first, for the home page. */
export function distinctClasses(classes: CatalogClass[]): { title: string; sessions: number; days: number[] }[] {
  const byTitle = new Map<string, { title: string; sessions: number; days: Set<number> }>();
  for (const c of classes) {
    const key = c.title.trim().toLowerCase();
    const entry = byTitle.get(key) ?? { title: c.title.trim(), sessions: 0, days: new Set<number>() };
    entry.sessions += 1;
    entry.days.add(c.dayOfWeek);
    byTitle.set(key, entry);
  }
  return [...byTitle.values()]
    .map(e => ({ title: e.title, sessions: e.sessions, days: [...e.days].sort() }))
    .sort((a, b) => b.sessions - a.sessions || a.title.localeCompare(b.title));
}
