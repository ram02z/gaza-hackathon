import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  variant?: 'primary' | 'success' | 'secondary';
  urgentCount?: number;
}

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  variant = 'secondary',
  urgentCount
}: QuickActionCardProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'border-primary/20 bg-primary-light/10 hover:bg-primary-light/20';
      case 'success':
        return 'border-success/20 bg-success-light/10 hover:bg-success-light/20';
      default:
        return 'border-border bg-card hover:bg-muted/50';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        medical-card p-6 w-full text-left transition-all duration-200
        active:scale-95 hover:shadow-md relative
        ${getVariantClasses()}
      `}
    >
      {urgentCount && urgentCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-warning text-warning-foreground text-xs font-medium px-2 py-1 rounded-full min-w-[24px] text-center">
          {urgentCount}
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className={`
          p-3 rounded-lg
          ${variant === 'primary' ? 'bg-primary text-primary-foreground' :
            variant === 'success' ? 'bg-success text-success-foreground' :
            'bg-muted text-muted-foreground'}
        `}>
          <Icon className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default QuickActionCard;
