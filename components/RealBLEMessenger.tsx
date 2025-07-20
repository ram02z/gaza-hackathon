import React, { useEffect, useState } from 'react';
import {
    Alert,
    PermissionsAndroid,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { BleManager, Device, State } from 'react-native-ble-plx';

interface BLEMessage {
  id: string;
  timestamp: number;
  sender: string;
  content: string;
  type: 'text' | 'data' | 'command';
}

interface BLEDevice {
  id: string;
  name?: string;
  rssi?: number;
}

// Real BLE Messenger for development builds
class RealBLEMessenger {
  private manager: BleManager;
  private connectedDevices: Map<string, Device> = new Map();
  private isScanning = false;
  private isInitialized = false;

  constructor() {
    this.manager = new BleManager();
    console.log('Real BLE Messenger initialized');
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ];
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        const allGranted = permissions.every(
          perm => granted[perm] === PermissionsAndroid.RESULTS.GRANTED
        );
        return allGranted;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Bluetooth and location permissions are required for BLE scanning.');
        return false;
      }

      // Check BLE state
      const state = await this.manager.state();
      console.log('BLE State:', state);

      if (state === State.PoweredOn) {
        this.isInitialized = true;
        return true;
      } else if (state === State.PoweredOff) {
        Alert.alert(
          'Bluetooth Required',
          'Please enable Bluetooth in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Wait for BLE to be powered on
      return new Promise((resolve) => {
        const subscription = this.manager.onStateChange((state) => {
          console.log('BLE state changed to:', state);
          if (state === State.PoweredOn) {
            subscription.remove();
            this.isInitialized = true;
            resolve(true);
          } else if (state === State.PoweredOff) {
            subscription.remove();
            resolve(false);
          }
        }, true);
      });
    } catch (error) {
      console.error('BLE initialization error:', error);
      return false;
    }
  }

  async startScanning(onDeviceFound?: (device: BLEDevice) => void): Promise<void> {
    if (this.isScanning || !this.isInitialized) return;

    try {
      this.isScanning = true;
      console.log('Starting real BLE scan...');

      await this.manager.startDeviceScan(
        null, // Scan for all devices
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error('Scan error:', error);
            this.isScanning = false;
            return;
          }

          if (device && onDeviceFound) {
            const bleDevice: BLEDevice = {
              id: device.id,
              name: device.name || device.localName || 'Unknown Device',
              rssi: device.rssi,
            };
            onDeviceFound(bleDevice);
          }
        }
      );
    } catch (error) {
      console.error('Error starting BLE scan:', error);
      this.isScanning = false;
    }
  }

  stopScanning(): void {
    if (this.isScanning) {
      this.manager.stopDeviceScan();
      this.isScanning = false;
      console.log('BLE scan stopped');
    }
  }

  async connectToDevice(device: BLEDevice): Promise<boolean> {
    try {
      console.log(`Connecting to device: ${device.name || device.id}`);
      
      const realDevice = await this.manager.devices([device.id]);
      if (realDevice.length === 0) {
        console.error('Device not found');
        return false;
      }

      const connectedDevice = await realDevice[0].connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();
      
      this.connectedDevices.set(device.id, connectedDevice);
      console.log(`Connected to: ${device.name || device.id}`);
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  }

  async disconnectFromDevice(deviceId: string): Promise<void> {
    const device = this.connectedDevices.get(deviceId);
    if (device) {
      try {
        await device.cancelConnection();
        this.connectedDevices.delete(deviceId);
        console.log(`Disconnected from: ${deviceId}`);
      } catch (error) {
        console.error('Disconnection error:', error);
      }
    }
  }

  async sendMessage(deviceId: string, message: Omit<BLEMessage, 'id' | 'timestamp'>): Promise<boolean> {
    const device = this.connectedDevices.get(deviceId);
    if (!device) {
      console.error('Device not connected:', deviceId);
      return false;
    }

    try {
      // Find a suitable service and characteristic for messaging
      const services = await device.services();
      if (services.length === 0) {
        console.error('No services found on device');
        return false;
      }

      // Use the first service and find a writable characteristic
      const service = services[0];
      const characteristics = await service.characteristics();
      const writableChar = characteristics.find(char => 
        char.isWritableWithResponse || char.isWritableWithoutResponse
      );

      if (!writableChar) {
        console.error('No writable characteristic found');
        return false;
      }

      // Convert message to bytes
      const messageStr = JSON.stringify({
        ...message,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      });
      
      const messageBytes = Array.from(messageStr).map(char => char.charCodeAt(0));
      
      // Send the message
      await writableChar.writeWithResponse(btoa(String.fromCharCode(...messageBytes)));
      
      console.log('Message sent successfully');
      return true;
    } catch (error) {
      console.error('Send message error:', error);
      return false;
    }
  }

  getConnectedDevices(): BLEDevice[] {
    return Array.from(this.connectedDevices.entries()).map(([id, device]) => ({
      id,
      name: device.name || device.localName || 'Unknown Device',
    }));
  }

  destroy(): void {
    this.stopScanning();
    this.connectedDevices.clear();
    this.manager.destroy();
  }
}

// React component for real BLE messaging
const RealBLEMessengerComponent: React.FC = () => {
  const [bleMessenger] = useState(() => new RealBLEMessenger());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<BLEDevice[]>([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<BLEMessage[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  useEffect(() => {
    initializeBLE();
    return () => {
      bleMessenger.destroy();
    };
  }, []);

  const initializeBLE = async () => {
    const initialized = await bleMessenger.initialize();
    setIsInitialized(initialized);
  };

  const startScan = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Bluetooth not initialized');
      return;
    }

    setIsScanning(true);
    setDevices([]);

    await bleMessenger.startScanning((device) => {
      setDevices(prev => {
        const exists = prev.find(d => d.id === device.id);
        if (!exists) {
          return [...prev, device];
        }
        return prev;
      });
    });
  };

  const stopScan = () => {
    bleMessenger.stopScanning();
    setIsScanning(false);
  };

  const connectToDevice = async (device: BLEDevice) => {
    const success = await bleMessenger.connectToDevice(device);
    if (success) {
      setConnectedDevices(bleMessenger.getConnectedDevices());
      setSelectedDevice(device.id);
      Alert.alert('Success', `Connected to ${device.name || device.id}`);
    } else {
      Alert.alert('Error', 'Failed to connect to device');
    }
  };

  const disconnectFromDevice = async (deviceId: string) => {
    await bleMessenger.disconnectFromDevice(deviceId);
    setConnectedDevices(bleMessenger.getConnectedDevices());
    if (selectedDevice === deviceId) {
      setSelectedDevice(null);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const bleMessage: Omit<BLEMessage, 'id' | 'timestamp'> = {
      sender: 'User',
      content: message.trim(),
      type: 'text',
    };

    let success = false;
    if (selectedDevice) {
      success = await bleMessenger.sendMessage(selectedDevice, bleMessage);
    } else {
      Alert.alert('Error', 'Please select a device to send message to');
      return;
    }

    if (success) {
      setMessages(prev => [...prev, {
        ...bleMessage,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      }]);
      setMessage('');
    } else {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Real BLE Messenger</Text>
      
      {/* Real BLE Notice */}
      <View style={styles.realBLENotice}>
        <Text style={styles.realBLENoticeText}>
          🔵 Real BLE Mode - This connects to actual Bluetooth devices.
          Requires development build (npx expo run:ios/android).
        </Text>
      </View>
      
      {/* Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Platform: {Platform.OS}
        </Text>
        <Text style={styles.statusText}>
          BLE Status: {isInitialized ? 'Ready (Real BLE)' : 'Initializing...'}
        </Text>
        <Text style={styles.statusText}>
          Connected: {connectedDevices.length} devices
        </Text>
        <Text style={styles.statusText}>
          Mode: Real Bluetooth Low Energy
        </Text>
      </View>

      {/* Scan Controls */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isScanning && styles.buttonActive]}
          onPress={isScanning ? stopScan : startScan}
        >
          <Text style={styles.buttonText}>
            {isScanning ? 'Stop Scan' : 'Start Scan'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Device List */}
      <Text style={styles.sectionTitle}>Available Devices</Text>
      <ScrollView style={styles.deviceList}>
        {devices.map((device) => (
          <TouchableOpacity
            key={device.id}
            style={styles.deviceItem}
            onPress={() => connectToDevice(device)}
          >
            <Text style={styles.deviceName}>
              {device.name || 'Unknown Device'}
            </Text>
            <Text style={styles.deviceId}>{device.id}</Text>
            {device.rssi && (
              <Text style={styles.deviceRSSI}>Signal: {device.rssi} dBm</Text>
            )}
          </TouchableOpacity>
        ))}
        {devices.length === 0 && (
          <Text style={styles.noDevicesText}>
            No devices found. Tap "Start Scan" to search for BLE devices.
          </Text>
        )}
      </ScrollView>

      {/* Connected Devices */}
      {connectedDevices.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Connected Devices</Text>
          <ScrollView style={styles.deviceList}>
            {connectedDevices.map((device) => (
              <View key={device.id} style={styles.connectedDeviceItem}>
                <Text style={styles.deviceName}>
                  {device.name || 'Unknown Device'}
                </Text>
                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={() => disconnectFromDevice(device.id)}
                >
                  <Text style={styles.disconnectButtonText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </>
      )}

      {/* Message Input */}
      <View style={styles.messageContainer}>
        <TextInput
          style={styles.messageInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Type your message..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <Text style={styles.sectionTitle}>Messages</Text>
      <ScrollView style={styles.messageList}>
        {messages.map((msg) => (
          <View key={msg.id} style={styles.messageItem}>
            <Text style={styles.messageSender}>{msg.sender}</Text>
            <Text style={styles.messageContent}>{msg.content}</Text>
            <Text style={styles.messageTime}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        ))}
        {messages.length === 0 && (
          <Text style={styles.noMessagesText}>
            No messages yet. Connect to a device and send a message!
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  realBLENotice: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  realBLENoticeText: {
    color: '#2e7d32',
    fontSize: 14,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonActive: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  deviceList: {
    maxHeight: 150,
    marginBottom: 20,
  },
  deviceItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  deviceRSSI: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
  noDevicesText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  connectedDeviceItem: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  disconnectButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  messageList: {
    flex: 1,
  },
  messageItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 16,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  noMessagesText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
});

export default RealBLEMessengerComponent;
export { RealBLEMessenger, type BLEMessage };
