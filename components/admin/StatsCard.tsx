import Icon from '@/components/ui/Icon';
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
    <div className="portal-stat relative overflow-hidden bg-surface-dark rounded-xl p-5 sm:p-6">
      <div className="relative flex items-start justify-between mb-4">
        <div
          className={`size-12 rounded-xl flex items-center justify-center ring-1 ring-inset ring-white/5 ${colorClasses[color]}`}
        >
          <Icon name={icon} className="text-2xl" />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend.isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            <Icon name={trend.isPositive ? 'trending_up' : 'trending_down'} className="text-lg" />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="relative">
        <p className="text-white/55 text-sm mb-1">{title}</p>
        <p className="text-white text-2xl sm:text-3xl font-semibold tracking-tight break-words tabular-nums">{value}</p>
        {subtitle && (
          <p className="text-white/40 text-xs mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}











