import { LucideIcon } from 'lucide-react-native';
import { TouchableOpacity, View, Text } from 'react-native';

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
        return 'border-primary/20 bg-primary-light/10';
      case 'success':
        return 'border-success/20 bg-success-light/10';
      default:
        return 'border-border bg-card';
    }
  };

  return (
    <TouchableOpacity
      onPress={onClick}
      className={`
        p-6 w-full rounded-lg border
        active:scale-95 relative
        ${getVariantClasses()}
      `}
    >
      {urgentCount && urgentCount > 0 && (
        <View className="absolute -top-2 -right-2 bg-warning text-warning-foreground text-xs font-medium px-2 py-1 rounded-full min-w-[24px] items-center justify-center">
          <Text className="text-warning-foreground text-xs font-medium">{urgentCount}</Text>
        </View>
      )}

      <View className="flex-row items-start gap-4">
        <View className={`
          p-3 rounded-lg
          ${variant === 'primary' ? 'bg-primary' :
            variant === 'success' ? 'bg-success' :
            'bg-muted'}
        `}>
          <Icon className={`w-6 h-6 ${
            variant === 'primary' ? 'text-primary-foreground' :
            variant === 'success' ? 'text-success-foreground' :
            'text-muted-foreground'}`} />
        </View>

        <View className="flex-1">
          <Text className="font-semibold text-foreground mb-1 text-base">{title}</Text>
          <Text className="text-sm text-muted-foreground leading-relaxed">{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default QuickActionCard;
