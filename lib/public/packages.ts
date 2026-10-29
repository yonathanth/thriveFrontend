/**
 * How the synced plans are laid out on the pricing and join pages. Prices, names and
 * lengths come from the gym app; this file only decides sections, labels and which
 * plans are for internal use and stay off the website.
 */
import { formatPeriod, titleCase, type CatalogPlan } from '@/lib/catalog';

/** Desktop categories, in the order and with the names the website uses. */
export const SECTIONS: ReadonlyArray<{ category: string; id: string; label: string; intro: string }> = [
  { category: 'body building', id: 'memberships', label: 'Gym memberships', intro: 'Full access to the floor. Pick a package, then how long.' },
  { category: 'others', id: 'classes', label: 'Classes & martial arts', intro: 'Coached sessions, paid by the month.' },
];

/** Shown for any category not listed above. */
const OTHER_INTRO = 'Pick a package, then how long.';

/**
 * Plans with one of these names are not offered on the website: complimentary, sponsor
 * and retired plans the desk uses. Plans priced at 0 are always left off.
 */
const HIDDEN_NAMES: readonly RegExp[] = [/\bsponsor/i, /\bgift\b/i, /\bcollab/i, /^old\b/i, /^discount\b/i];

/** Words that say how long a plan runs, removed to find the package a plan belongs to. */
const LENGTH_WORDS =
  /[-–(),]*\s*\b(?:monthly|yearly|annual(?:ly)?|weekly|(?:\d+|one|two|three|four|five|six|nine|twelve)\s*(?:-\s*)?(?:months?|weeks?|days?|years?))\b\s*[)]?/gi;

export interface Package {
  /** Stable id for anchors and links, e.g. "full-package" */
  id: string;
  name: string;
  /** Group or couple plans: registered and paid at the front desk */
  group: boolean;
  /** How many people a group plan covers, when the gym app says */
  groupSize: number | null;
  benefits: string[];
  plans: CatalogPlan[];
}

export interface PricingSection {
  id: string;
  label: string;
  intro: string;
  packages: Package[];
}

const slug = (s: string) =>
  s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'plans';

/** Desktop names are often typed in capitals: "FULL PACKAGE" → "Full Package". */
export function displayName(raw: string): string {
  const clean = raw.replace(/\s+/g, ' ').trim();
  return clean === clean.toUpperCase() ? titleCase(clean.toLowerCase()) : clean;
}

/** "COUPLE FULL PACKAGE SIX MONTH" → "Couple Full Package" */
export function packageName(planName: string): string {
  const base = planName.replace(LENGTH_WORDS, ' ').replace(/[-–]\s*$/, '').replace(/\s+/g, ' ').trim();
  return displayName(base || planName);
}

export function isListed(plan: CatalogPlan): boolean {
  return plan.price > 0 && !HIDDEN_NAMES.some((re) => re.test(plan.name));
}

/** What a plan includes: its benefit list, else its description split on commas. */
function benefitsOf(plan: CatalogPlan): string[] {
  if (plan.benefits?.length) return plan.benefits;
  if (!plan.description) return [];
  const parts = plan.description.split(/\s*[,;\n]\s*/).map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts.map(displayName) : [plan.description];
}

/** The plans the website offers, arranged into sections and packages. */
export function arrangePlans(all: CatalogPlan[]): PricingSection[] {
  const listed = all.filter(isListed);
  const byCategory = new Map<string, CatalogPlan[]>();
  for (const p of listed) {
    const key = (p.category ?? '').trim().toLowerCase() || 'membership';
    byCategory.set(key, [...(byCategory.get(key) ?? []), p]);
  }
  const known = SECTIONS.map((s) => s.category);
  const order = [...byCategory.keys()].sort((a, b) => {
    const ia = known.indexOf(a);
    const ib = known.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return order.map((category) => {
    const config = SECTIONS.find((s) => s.category === category);
    const packages = new Map<string, CatalogPlan[]>();
    for (const p of byCategory.get(category)!) {
      const name = packageName(p.name);
      packages.set(name, [...(packages.get(name) ?? []), p]);
    }
    return {
      id: config?.id ?? slug(category),
      label: config?.label ?? titleCase(category),
      intro: config?.intro ?? OTHER_INTRO,
      packages: [...packages.entries()]
        .map(([name, plans]): Package => {
          const sorted = [...plans].sort((a, b) => a.periodDays - b.periodDays || a.price - b.price);
          const sizes = sorted.map((p) => p.groupSize).filter((n): n is number => n != null && n > 1);
          return {
            id: slug(name),
            name,
            // One plan in the package marked for a group makes the whole package one.
            group: sizes.length > 0,
            groupSize: sizes[0] ?? null,
            benefits: sorted.map(benefitsOf).find((b) => b.length > 0) ?? [],
            plans: sorted,
          };
        })
        .sort((a, b) => Number(a.group) - Number(b.group) || a.plans[0].price - b.plans[0].price),
    };
  });
}

/** Every package across sections, for finding a plan by id. */
export function findPlan(sections: PricingSection[], planId: number) {
  for (const section of sections)
    for (const pkg of section.packages) {
      const plan = pkg.plans.find((p) => p.id === planId);
      if (plan) return { section, pkg, plan };
    }
  return null;
}

export function formatBirr(amount: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount);
}

/** "≈ 12,667 birr a month" for plans longer than a month. */
export function perMonth(plan: CatalogPlan): string | null {
  const months = plan.periodDays / 30;
  if (months < 1.9) return null;
  return `≈ ${formatBirr(plan.price / months)} birr a month`;
}

export { formatPeriod };
