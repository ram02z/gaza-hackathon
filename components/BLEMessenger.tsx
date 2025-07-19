import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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
}

// Web-compatible BLE Messenger (works in Expo Go)
class BLEMessenger {
  private connectedDevices: Map<string, BLEDevice> = new Map();
  private isScanning = false;
  private isWebPlatform = Platform.OS === 'web';
  private mockDevices: BLEDevice[] = [
    { id: 'MOCK-DEVICE-001', name: 'Mock BLE Device 1' },
    { id: 'MOCK-DEVICE-002', name: 'Mock BLE Device 2' },
    { id: 'MOCK-DEVICE-003', name: 'Mock BLE Device 3' },
  ];

  constructor() {
    console.log('BLE Messenger initialized for platform:', Platform.OS);
    console.log('Using web-compatible mode (works in Expo Go)');
  }

  async initialize(): Promise<boolean> {
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (this.isWebPlatform) {
      console.log('Web platform detected - using mock BLE mode');
      Alert.alert(
        'Web Demo Mode',
        'This is a demo version that simulates BLE functionality. For real BLE, use the mobile app with a development build.',
        [{ text: 'OK' }]
      );
    } else {
      console.log('Mobile platform detected - using mock BLE mode (Expo Go limitation)');
      Alert.alert(
        'Expo Go Limitation',
        'Real BLE requires a development build. This demo simulates BLE functionality.',
        [{ text: 'OK' }]
      );
    }
    
    return true;
  }

  async startScanning(onDeviceFound?: (device: BLEDevice) => void): Promise<void> {
    if (this.isScanning) return;

    this.isScanning = true;
    console.log('Starting mock BLE scan...');

    // Simulate device discovery
    this.mockDevices.forEach((device, index) => {
      setTimeout(() => {
        if (onDeviceFound) {
          onDeviceFound(device);
        }
      }, (index + 1) * 1000); // Stagger device discovery
    });

    // Stop scanning after 5 seconds
    setTimeout(() => {
      this.isScanning = false;
      console.log('Mock BLE scan completed');
    }, 5000);
  }

  stopScanning(): void {
    this.isScanning = false;
    console.log('Mock BLE scan stopped');
  }

  async connectToDevice(device: BLEDevice): Promise<boolean> {
    try {
      console.log(`Connecting to device: ${device.name || device.id}`);
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.connectedDevices.set(device.id, device);
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
      // Simulate disconnection delay
      await new Promise(resolve => setTimeout(resolve, 500));
      this.connectedDevices.delete(deviceId);
      console.log(`Disconnected from: ${deviceId}`);
    }
  }

  async sendMessage(deviceId: string, message: Omit<BLEMessage, 'id' | 'timestamp'>): Promise<boolean> {
    const device = this.connectedDevices.get(deviceId);
    if (!device) {
      console.error('Device not connected:', deviceId);
      return false;
    }

    try {
      const bleMessage: BLEMessage = {
        ...message,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };

      console.log('Message sent successfully:', bleMessage);
      return true;
    } catch (error) {
      console.error('Send message error:', error);
      return false;
    }
  }

  async broadcastMessage(message: Omit<BLEMessage, 'id' | 'timestamp'>): Promise<number> {
    if (this.connectedDevices.size === 0) {
      console.log('No devices connected');
      return 0;
    }

    const promises = Array.from(this.connectedDevices.keys()).map(deviceId =>
      this.sendMessage(deviceId, message)
    );

    const results = await Promise.all(promises);
    return results.filter(Boolean).length;
  }

  getConnectedDevices(): BLEDevice[] {
    return Array.from(this.connectedDevices.values());
  }

  destroy(): void {
    this.stopScanning();
    this.connectedDevices.clear();
  }
}

// React component for BLE messaging
const BLEMessengerComponent: React.FC = () => {
  const [bleMessenger] = useState(() => new BLEMessenger());
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
      const sentCount = await bleMessenger.broadcastMessage(bleMessage);
      success = sentCount > 0;
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
      <Text style={styles.title}>BLE Messenger</Text>
      
      {/* Demo Notice */}
      <View style={styles.demoNotice}>
        <Text style={styles.demoNoticeText}>
          🎭 Demo Mode - This simulates BLE functionality for testing.
          {Platform.OS === 'web' 
            ? ' Use the mobile app for real BLE features.' 
            : ' For real BLE, create a development build with: npx expo run:ios'
          }
        </Text>
      </View>
      
      {/* Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Platform: {Platform.OS}
        </Text>
        <Text style={styles.statusText}>
          BLE Status: {isInitialized ? 'Ready (Demo Mode)' : 'Initializing...'}
        </Text>
        <Text style={styles.statusText}>
          Connected: {connectedDevices.length} devices
        </Text>
        <Text style={styles.statusText}>
          Mode: Demo (Expo Go Compatible)
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
  demoNotice: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  demoNoticeText: {
    color: '#1976d2',
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

export default BLEMessengerComponent;
export { BLEMessenger, type BLEMessage };
