import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning';
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = 'neutral',
  variant = 'default'
}: StatCardProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'border-success/20 bg-success-light/5';
      case 'warning':
        return 'border-warning/20 bg-warning-light/5';
      default:
        return 'border-border';
    }
  };

  const getIconClasses = () => {
    switch (variant) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className={`medical-card p-4 ${getVariantClasses()}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-semibold text-foreground mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className={`p-2 rounded-lg bg-background ${getIconClasses()}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
