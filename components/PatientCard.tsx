import { User, Calendar, AlertCircle, Clock } from "lucide-react-native";
import { View, Text, TouchableOpacity } from "react-native";

interface PatientCardProps {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F" | "Other";
  lastVisit: string;
  urgentFlags?: number;
  condition?: string;
  onClick?: () => void;
}

const PatientCard = ({
  id,
  name,
  age,
  gender,
  lastVisit,
  urgentFlags = 0,
  condition,
  onClick,
}: PatientCardProps) => {
  const formatLastVisit = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      onPress={onClick}
      className="bg-card p-4 w-full rounded-lg border border-border active:scale-95 relative"
    >
      {urgentFlags > 0 && (
        <View className="absolute top-3 right-3 bg-warning px-2 py-1 rounded-full flex-row items-center">
          <AlertCircle className="w-3 h-3 text-warning-foreground mr-1" />
          <Text className="text-warning-foreground text-xs font-medium">
            {urgentFlags}
          </Text>
        </View>
      )}

      <View className="flex-row items-start gap-3">
        <View className="bg-muted p-2 rounded-full flex-shrink-0">
          <User className="w-5 h-5 text-muted-foreground" />
        </View>

        <View className="flex-1 min-w-0">
          <View className="flex-row items-start justify-between mb-2">
            <View>
              <Text className="font-semibold text-foreground" numberOfLines={1}>
                {name}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {age} years •{" "}
                {gender === "M" ? "Male" : gender === "F" ? "Female" : "Other"}
              </Text>
            </View>
          </View>

          {condition && (
            <View className="mb-2">
              <View className="bg-primary/10 px-2 py-1 rounded-full self-start">
                <Text className="text-xs text-primary font-medium">
                  {condition}
                </Text>
              </View>
            </View>
          )}

          <View className="flex-row items-center gap-4 text-xs text-muted-foreground mt-2">
            <View className="flex-row items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <Text className="text-xs text-muted-foreground">
                {formatLastVisit(lastVisit)}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <Text className="text-xs text-muted-foreground">
                ID: {id.slice(-6)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PatientCard;
