import { LucideIcon } from 'lucide-react-native';
import { View, Text } from 'react-native';

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
        return 'border-border bg-card';
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
    <View className={`flex-1 rounded-lg border p-4 ${getVariantClasses()}`}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-sm text-muted-foreground mb-1">{title}</Text>
          <Text className="text-2xl font-semibold text-foreground mb-1">{value}</Text>
          {subtitle && (
            <Text className="text-xs text-muted-foreground">{subtitle}</Text>
          )}
        </View>

        <View className={`p-2 rounded-lg bg-background`}>
          <Icon className={`w-5 h-5 ${getIconClasses()}`} />
        </View>
      </View>
    </View>
  );
};

export default StatCard;
