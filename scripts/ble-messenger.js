#!/usr/bin/env node

/**
 * Cross-platform BLE Messenger Script
 * 
 * This script provides a command-line interface for sending JSON messages
 * via Bluetooth Low Energy (BLE).
 * 
 * Usage:
 *   node ble-messenger.js scan                    # Scan for devices
 *   node ble-messenger.js connect <device-id>     # Connect to device
 *   node ble-messenger.js send <message>          # Send message to connected device
 *   node ble-messenger.js broadcast <message>     # Send message to all connected devices
 *   node ble-messenger.js disconnect <device-id>  # Disconnect from device
 *   node ble-messenger.js list                    # List connected devices
 *   node ble-messenger.js help                    # Show help
 */

const { BleManager, State } = require('react-native-ble-plx');

class BLEScriptMessenger {
  constructor() {
    this.manager = new BleManager();
    this.connectedDevices = new Map();
    this.isScanning = false;
    
    // Standard BLE service and characteristic UUIDs for messaging
    this.MESSAGING_SERVICE = {
      serviceUUID: '6E400001-B5A3-F393-E0A9-E50E24DCCA9E', // Nordic UART Service
      characteristicUUID: '6E400002-B5A3-F393-E0A9-E50E24DCCA9E', // TX Characteristic
    };
  }

  async initialize() {
    try {
      const state = await this.manager.state();
      console.log('BLE State:', state);

      if (state === State.PoweredOn) {
        return true;
      }

      return new Promise((resolve) => {
        const subscription = this.manager.onStateChange((state) => {
          if (state === State.PoweredOn) {
            subscription.remove();
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

  async scanForDevices() {
    if (this.isScanning) {
      console.log('Already scanning...');
      return;
    }

    try {
      this.isScanning = true;
      console.log('Scanning for BLE devices...');

      await this.manager.startDeviceScan(
        [this.MESSAGING_SERVICE.serviceUUID],
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error('Scan error:', error);
            this.isScanning = false;
            return;
          }

          if (device) {
            console.log(`Found device: ${device.name || 'Unknown'} (${device.id})`);
          }
        }
      );

      // Stop scanning after 10 seconds
      setTimeout(() => {
        this.stopScanning();
      }, 10000);

    } catch (error) {
      console.error('Start scanning error:', error);
      this.isScanning = false;
    }
  }

  stopScanning() {
    if (this.isScanning) {
      this.manager.stopDeviceScan();
      this.isScanning = false;
      console.log('Scan stopped');
    }
  }

  async connectToDevice(deviceId) {
    try {
      console.log(`Connecting to device: ${deviceId}`);
      
      const device = await this.manager.devices([deviceId]);
      if (device.length === 0) {
        console.error('Device not found');
        return false;
      }

      const connectedDevice = await device[0].connect();
      const discoveredDevice = await connectedDevice.discoverAllServicesAndCharacteristics();
      
      this.connectedDevices.set(deviceId, discoveredDevice);
      console.log(`Connected to: ${deviceId}`);
      
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  }

  async disconnectFromDevice(deviceId) {
    const device = this.connectedDevices.get(deviceId);
    if (device) {
      try {
        await device.cancelConnection();
        this.connectedDevices.delete(deviceId);
        console.log(`Disconnected from: ${deviceId}`);
      } catch (error) {
        console.error('Disconnection error:', error);
      }
    } else {
      console.log('Device not connected');
    }
  }

  async sendMessage(deviceId, message) {
    const device = this.connectedDevices.get(deviceId);
    if (!device) {
      console.error('Device not connected:', deviceId);
      return false;
    }

    try {
      const bleMessage = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        sender: 'Script',
        content: message,
        type: 'text',
      };

      const messageJson = JSON.stringify(bleMessage);
      const messageBuffer = Buffer.from(messageJson, 'utf8');

      // Split message into chunks if it's too large
      const chunkSize = 20;
      const chunks = [];
      
      for (let i = 0; i < messageBuffer.length; i += chunkSize) {
        chunks.push(messageBuffer.slice(i, i + chunkSize));
      }

      // Send each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        await device.writeCharacteristicWithResponseForService(
          this.MESSAGING_SERVICE.serviceUUID,
          this.MESSAGING_SERVICE.characteristicUUID,
          chunk.toString('base64')
        );
        
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      console.log('Message sent successfully:', bleMessage);
      return true;
    } catch (error) {
      console.error('Send message error:', error);
      return false;
    }
  }

  async broadcastMessage(message) {
    if (this.connectedDevices.size === 0) {
      console.log('No devices connected');
      return 0;
    }

    const promises = Array.from(this.connectedDevices.keys()).map(deviceId =>
      this.sendMessage(deviceId, message)
    );

    const results = await Promise.all(promises);
    const successCount = results.filter(Boolean).length;
    console.log(`Message sent to ${successCount}/${this.connectedDevices.size} devices`);
    return successCount;
  }

  listConnectedDevices() {
    if (this.connectedDevices.size === 0) {
      console.log('No devices connected');
      return;
    }

    console.log('Connected devices:');
    this.connectedDevices.forEach((device, deviceId) => {
      console.log(`  - ${device.name || 'Unknown'} (${deviceId})`);
    });
  }

  destroy() {
    this.stopScanning();
    this.connectedDevices.forEach((device, deviceId) => {
      this.disconnectFromDevice(deviceId);
    });
    this.manager.destroy();
  }
}

// Command-line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help') {
    showHelp();
    return;
  }

  const messenger = new BLEScriptMessenger();
  
  try {
    const initialized = await messenger.initialize();
    if (!initialized) {
      console.error('Failed to initialize BLE. Please enable Bluetooth.');
      return;
    }

    switch (command) {
      case 'scan':
        await messenger.scanForDevices();
        break;

      case 'connect':
        const deviceId = args[1];
        if (!deviceId) {
          console.error('Please provide a device ID');
          return;
        }
        await messenger.connectToDevice(deviceId);
        break;

      case 'disconnect':
        const disconnectDeviceId = args[1];
        if (!disconnectDeviceId) {
          console.error('Please provide a device ID');
          return;
        }
        await messenger.disconnectFromDevice(disconnectDeviceId);
        break;

      case 'send':
        const targetDeviceId = args[1];
        const message = args[2];
        if (!targetDeviceId || !message) {
          console.error('Please provide device ID and message');
          return;
        }
        await messenger.sendMessage(targetDeviceId, message);
        break;

      case 'broadcast':
        const broadcastMessage = args[1];
        if (!broadcastMessage) {
          console.error('Please provide a message');
          return;
        }
        await messenger.broadcastMessage(broadcastMessage);
        break;

      case 'list':
        messenger.listConnectedDevices();
        break;

      default:
        console.error('Unknown command:', command);
        showHelp();
        break;
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Keep the process alive for a bit to allow BLE operations to complete
    setTimeout(() => {
      messenger.destroy();
      process.exit(0);
    }, 2000);
  }
}

function showHelp() {
  console.log(`
Cross-platform BLE Messenger Script

Usage:
  node ble-messenger.js scan                    # Scan for devices
  node ble-messenger.js connect <device-id>     # Connect to device
  node ble-messenger.js send <device-id> <message>  # Send message to device
  node ble-messenger.js broadcast <message>     # Send message to all connected devices
  node ble-messenger.js disconnect <device-id>  # Disconnect from device
  node ble-messenger.js list                    # List connected devices
  node ble-messenger.js help                    # Show this help

Examples:
  node ble-messenger.js scan
  node ble-messenger.js connect ABC123
  node ble-messenger.js send ABC123 "Hello, world!"
  node ble-messenger.js broadcast "Hello everyone!"
  node ble-messenger.js disconnect ABC123
  node ble-messenger.js list
`);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = BLEScriptMessenger; 