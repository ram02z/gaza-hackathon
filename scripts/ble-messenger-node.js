#!/usr/bin/env node

/**
 * Cross-platform BLE Messenger Script (Node.js Version)
 * 
 * This script provides a command-line interface for sending JSON messages
 * via Bluetooth Low Energy (BLE) using the noble library.
 * 
 * Usage:
 *   node ble-messenger-node.js scan                    # Scan for devices
 *   node ble-messenger-node.js connect <device-id>     # Connect to device
 *   node ble-messenger-node.js send <device-id> <message>  # Send message to device
 *   node ble-messenger-node.js broadcast <message>     # Send message to all connected devices
 *   node ble-messenger-node.js disconnect <device-id>  # Disconnect from device
 *   node ble-messenger-node.js list                    # List connected devices
 *   node ble-messenger-node.js help                    # Show help
 */

const noble = require('noble');
const crypto = require('crypto');

class BLENodeMessenger {
  constructor() {
    this.connectedDevices = new Map();
    this.isScanning = false;
    this.discoveredDevices = new Map();
    
    // Standard BLE service and characteristic UUIDs for messaging
    this.MESSAGING_SERVICE_UUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E'; // Nordic UART Service
    this.TX_CHARACTERISTIC_UUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E'; // TX Characteristic
    this.RX_CHARACTERISTIC_UUID = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E'; // RX Characteristic
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Handle state changes
    noble.on('stateChange', (state) => {
      console.log('BLE State:', state);
      if (state === 'poweredOn') {
        console.log('✓ Bluetooth is powered on and ready');
      } else if (state === 'poweredOff') {
        console.log('✗ Bluetooth is powered off');
      }
    });

    // Handle device discovery
    noble.on('discover', (peripheral) => {
      this.discoveredDevices.set(peripheral.id, peripheral);
      console.log(`Found device: ${peripheral.advertisement.localName || 'Unknown'} (${peripheral.id})`);
      if (peripheral.advertisement.serviceUuids) {
        console.log(`  Services: ${peripheral.advertisement.serviceUuids.join(', ')}`);
      }
    });
  }

  async initialize() {
    return new Promise((resolve) => {
      if (noble.state === 'poweredOn') {
        resolve(true);
      } else {
        noble.once('stateChange', (state) => {
          resolve(state === 'poweredOn');
        });
      }
    });
  }

  async scanForDevices(duration = 10) {
    if (this.isScanning) {
      console.log('Already scanning...');
      return;
    }

    try {
      this.isScanning = true;
      this.discoveredDevices.clear();
      console.log(`Scanning for BLE devices for ${duration} seconds...`);

      await noble.startScanning([this.MESSAGING_SERVICE_UUID], false);

      // Stop scanning after duration
      setTimeout(() => {
        this.stopScanning();
      }, duration * 1000);

    } catch (error) {
      console.error('Start scanning error:', error);
      this.isScanning = false;
    }
  }

  stopScanning() {
    if (this.isScanning) {
      noble.stopScanning();
      this.isScanning = false;
      console.log('Scan stopped');
      console.log(`Total devices found: ${this.discoveredDevices.size}`);
    }
  }

  async connectToDevice(deviceId) {
    const peripheral = this.discoveredDevices.get(deviceId);
    if (!peripheral) {
      console.error('Device not found. Please scan for devices first.');
      return false;
    }

    try {
      console.log(`Connecting to device: ${peripheral.advertisement.localName || deviceId}`);
      
      await new Promise((resolve, reject) => {
        peripheral.connect((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      // Discover services
      const services = await new Promise((resolve, reject) => {
        peripheral.discoverAllServicesAndCharacteristics((error, services, characteristics) => {
          if (error) {
            reject(error);
          } else {
            resolve({ services, characteristics });
          }
        });
      });

      this.connectedDevices.set(deviceId, { peripheral, ...services });
      console.log(`✓ Connected to: ${peripheral.advertisement.localName || deviceId}`);
      console.log(`  Services found: ${services.services.length}`);
      
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
        await new Promise((resolve, reject) => {
          device.peripheral.disconnect((error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });
        
        this.connectedDevices.delete(deviceId);
        console.log(`✓ Disconnected from: ${deviceId}`);
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
        id: crypto.randomBytes(8).toString('hex'),
        timestamp: Date.now(),
        sender: 'NodeScript',
        content: message,
        type: 'text'
      };

      const messageJson = JSON.stringify(bleMessage);
      const messageBuffer = Buffer.from(messageJson, 'utf8');

      // Find the TX characteristic
      const txCharacteristic = device.characteristics.find(
        char => char.uuid.toLowerCase() === this.TX_CHARACTERISTIC_UUID.toLowerCase()
      );

      if (!txCharacteristic) {
        console.error('TX characteristic not found');
        return false;
      }

      // Split message into chunks if it's too large
      const chunkSize = 20;
      const chunks = [];
      
      for (let i = 0; i < messageBuffer.length; i += chunkSize) {
        chunks.push(messageBuffer.slice(i, i + chunkSize));
      }

      console.log(`Sending message to ${deviceId}:`, bleMessage);

      // Send each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        await new Promise((resolve, reject) => {
          txCharacteristic.write(chunk, true, (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });
        
        // Small delay between chunks
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      console.log('✓ Message sent successfully');
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

    console.log(`Broadcasting message to ${this.connectedDevices.size} devices`);
    
    const promises = Array.from(this.connectedDevices.keys()).map(deviceId =>
      this.sendMessage(deviceId, message)
    );

    const results = await Promise.all(promises);
    const successCount = results.filter(Boolean).length;
    
    console.log(`✓ Message sent to ${successCount}/${this.connectedDevices.size} devices`);
    return successCount;
  }

  listConnectedDevices() {
    if (this.connectedDevices.size === 0) {
      console.log('No devices connected');
      return;
    }

    console.log('Connected devices:');
    this.connectedDevices.forEach((device, deviceId) => {
      const name = device.peripheral.advertisement.localName || 'Unknown';
      console.log(`  - ${name} (${deviceId})`);
    });
  }

  listDiscoveredDevices() {
    if (this.discoveredDevices.size === 0) {
      console.log('No devices discovered. Run scan first.');
      return;
    }

    console.log('Discovered devices:');
    this.discoveredDevices.forEach((peripheral, deviceId) => {
      const name = peripheral.advertisement.localName || 'Unknown';
      console.log(`  - ${name} (${deviceId})`);
    });
  }

  destroy() {
    this.stopScanning();
    this.connectedDevices.forEach((device, deviceId) => {
      this.disconnectFromDevice(deviceId);
    });
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

  const messenger = new BLENodeMessenger();
  
  try {
    console.log('Initializing BLE...');
    const initialized = await messenger.initialize();
    if (!initialized) {
      console.error('Failed to initialize BLE. Please enable Bluetooth.');
      return;
    }

    switch (command) {
      case 'scan':
        await messenger.scanForDevices();
        break;

      case 'devices':
        messenger.listDiscoveredDevices();
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
Cross-platform BLE Messenger Script (Node.js Version)

Usage:
  node ble-messenger-node.js scan                    # Scan for devices
  node ble-messenger-node.js devices                 # List discovered devices
  node ble-messenger-node.js connect <device-id>     # Connect to device
  node ble-messenger-node.js send <device-id> <message>  # Send message to device
  node ble-messenger-node.js broadcast <message>     # Send message to all connected devices
  node ble-messenger-node.js disconnect <device-id>  # Disconnect from device
  node ble-messenger-node.js list                    # List connected devices
  node ble-messenger-node.js help                    # Show this help

Examples:
  node ble-messenger-node.js scan
  node ble-messenger-node.js devices
  node ble-messenger-node.js connect AA:BB:CC:DD:EE:FF
  node ble-messenger-node.js send AA:BB:CC:DD:EE:FF "Hello, world!"
  node ble-messenger-node.js broadcast "Hello everyone!"
  node ble-messenger-node.js disconnect AA:BB:CC:DD:EE:FF
  node ble-messenger-node.js list

Requirements:
  - Bluetooth hardware
  - Noble library (already installed)
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

module.exports = BLENodeMessenger; 