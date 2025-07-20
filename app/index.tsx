import { useRouter } from "expo-router";
import { Heart, Shield, Users } from "lucide-react-native";
import { View, Text } from "react-native";
import { Button } from "@/components/ui/button";

const Index = () => {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center p-4">
      <View className="w-full space-y-8 items-center max-w-md">
        <View className="space-y-4 items-center">
          <View className="p-4 bg-primary/10 rounded-full">
            <Heart className="w-12 h-12 text-primary" />
          </View>
          <Text
            className="text-3xl font-bold text-foreground text-center"
          >
            Gaza Care Connect
          </Text>
          <Text className="text-muted-foreground text-center">
            Secure, offline-first healthcare management for frontline medical
            teams.
          </Text>
        </View>

        <View className="space-y-4 w-full">
          <View className="flex-row items-center gap-3 p-4 bg-card rounded-lg border">
            <Shield className="w-5 h-5 text-primary flex-shrink-0" />
            <View>
              <Text className="font-medium text-sm">
                Offline-First
              </Text>
              <Text className="text-xs text-muted-foreground">
                Works without internet
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3 p-4 bg-card rounded-lg border">
            <Users className="w-5 h-5 text-primary flex-shrink-0" />
            <View>
              <Text className="font-medium text-sm">
                Peer-to-Peer Sync
              </Text>
              <Text className="text-xs text-muted-foreground">
                Share data via Bluetooth
              </Text>
            </View>
          </View>
        </View>

        <Button
          onPress={() => router.push("/dashboard")}
          className="w-full h-12"
        >
          <Text className="text-primary-foreground text-base">
            Enter Dashboard
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default Index;

