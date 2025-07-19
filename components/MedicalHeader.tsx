import { Wifi, WifiOff, Bluetooth, BluetoothOff } from "lucide-react";

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
    <header className="medical-card p-4 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-foreground">MedConnect</h1>
          <p className="text-sm text-muted-foreground">
            Frontline Medical Care
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Internet Status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-success" />
            ) : (
              <WifiOff className="w-5 h-5 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>

          {/* Bluetooth Status */}
          <div className="flex items-center gap-2">
            {bluetoothConnected ? (
              <Bluetooth className="w-5 h-5 text-primary" />
            ) : (
              <BluetoothOff className="w-5 h-5 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">
              {bluetoothConnected
                ? `${connectedDevices} devices`
                : "No devices"}
            </span>
          </div>

          {/* Sync Status Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`status-indicator ${
                bluetoothConnected ? "bg-success" : "bg-warning"
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {bluetoothConnected ? "Synced" : "Pending"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MedicalHeader;
