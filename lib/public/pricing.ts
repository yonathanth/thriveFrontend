// Prices, schedules, and non-Duressa coach names below are design placeholders.
export const classPricing = [
  { slug: 'muay-thai', price: 6000, unit: 'per month', days: 'Mon · Wed · Fri', time: '18:00–19:00 EAT', starts: '02 Nov 2026', coach: 'Duressa' },
  { slug: 'kickboxing', price: 5000, unit: 'per month', days: 'Tue · Thu · Sat', time: '17:30–18:30 EAT', starts: '03 Nov 2026', coach: 'Sami (sample)' },
  { slug: 'kids-karate', price: 4500, unit: 'per month', days: 'Sat · Sun', time: '09:00–10:00 EAT', starts: '07 Nov 2026', coach: 'Hana (sample)' },
  { slug: 'personal-training', price: 1500, unit: 'per session', days: 'By appointment', time: '60-minute session', starts: '02 Nov 2026', coach: 'Elias (sample)' },
] as const;

export function formatBirr(amount: number) {
  return new Intl.NumberFormat('en-US').format(amount);
}
