interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  color?: 'primary' | 'green' | 'blue' | 'orange' | 'red';
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  green: 'bg-emerald-500/10 text-emerald-400',
  blue: 'bg-blue-500/10 text-blue-400',
  orange: 'bg-orange-500/10 text-orange-400',
  red: 'bg-red-500/10 text-red-400',
};

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  color = 'primary',
}: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden bg-surface-dark rounded-xl border border-white/5 p-6 transition-all hover:border-primary/30 hover:shadow-[0_10px_40px_-15px_rgba(59,140,255,0.45)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100"
      />
      <div className="relative flex items-start justify-between mb-4">
        <div
          className={`size-12 rounded-xl flex items-center justify-center ring-1 ring-inset ring-white/5 ${colorClasses[color]}`}
        >
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend.isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {trend.isPositive ? 'trending_up' : 'trending_down'}
            </span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="relative">
        <p className="text-white/55 text-sm mb-1">{title}</p>
        <p className="text-white text-3xl font-bold tracking-tight">{value}</p>
        {subtitle && (
          <p className="text-white/40 text-xs mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}











