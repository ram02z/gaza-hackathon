import { Wifi, WifiOff, Bluetooth, BluetoothOff } from "lucide-react-native";
import { Text, View } from "react-native";

interface MedicalHeaderProps {
  isOnline?: boolean;
  bluetoothConnected?: boolean;
  connectedDevices?: number;
}

const MedicalHeader = ({
  isOnline = false,
  bluetoothConnected = true,
  connectedDevices = 2,
}: MedicalHeaderProps) => {
  return (
    <View className="medical-card p-4 mb-6">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-xl font-semibold text-foreground">MedConnect</Text>
          <Text className="text-sm text-muted-foreground">
            Frontline Medical Care
          </Text>
        </View>

        <View className="flex-row items-center gap-4">
          {/* Internet Status */}
          <View className="items-center gap-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-success" />
            ) : (
              <WifiOff className="w-5 h-5 text-muted-foreground" />
            )}
            <Text className="text-xs text-muted-foreground">
              {isOnline ? "Online" : "Offline"}
            </Text>
          </View>

          {/* Bluetooth Status */}
          <View className="items-center gap-2">
            {bluetoothConnected ? (
              <Bluetooth className="w-5 h-5 text-primary" />
            ) : (
              <BluetoothOff className="w-5 h-5 text-muted-foreground" />
            )}
            <Text className="text-xs text-muted-foreground">
              {bluetoothConnected
                ? `${connectedDevices} devices`
                : "No devices"}
            </Text>
          </View>

          {/* Sync Status Indicator */}
          <View className="items-center gap-2">
            <View
              className={`w-2 h-2 rounded-full ${
                bluetoothConnected ? "bg-success" : "bg-warning"
              }`}
            />
            <Text className="text-xs text-muted-foreground">
              {bluetoothConnected ? "Synced" : "Pending"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MedicalHeader;
