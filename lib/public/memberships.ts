// Sample prices for design review. Confirm all rates and access times before publishing.
export const membershipPeriods = [
  { name: 'Monthly', months: '01', description: '1 month', prices: { standard: 15000, happyHour: 10000 } },
  { name: 'Three months', months: '03', description: '3 months', prices: { standard: 42000, happyHour: 27000 } },
  { name: 'Six months', months: '06', description: '6 months', prices: { standard: 78000, happyHour: 51000 } },
  { name: 'Yearly', months: '12', description: '12 months', prices: { standard: 144000, happyHour: 96000 } },
] as const;

export const membershipTypes = {
  standard: { label: 'Standard', description: '24/7 access. Train whenever it works for you.', access: '24/7 gym access', note: 'Sample prices in birr. Coaching and class inclusions to be confirmed.' },
  happyHour: { label: 'Happy Hour', description: 'A quieter gym. Access during off-peak hours.', access: 'Off-peak gym access', note: 'Sample window: Mon–Fri, 10:00–16:00 EAT. Prices and access times are placeholders.' },
} as const;
