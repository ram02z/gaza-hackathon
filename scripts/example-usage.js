#!/usr/bin/env node

/**
 * Example usage of the BLE Messenger Script
 * 
 * This script demonstrates how to use the BLE messenger for various scenarios
 */

const BLEScriptMessenger = require('./ble-messenger.js');

async function exampleUsage() {
  console.log('=== BLE Messenger Example Usage ===\n');
  
  const messenger = new BLEScriptMessenger();
  
  try {
    // Initialize BLE
    console.log('1. Initializing BLE...');
    const initialized = await messenger.initialize();
    if (!initialized) {
      console.error('Failed to initialize BLE');
      return;
    }
    console.log('✓ BLE initialized successfully\n');

    // Scan for devices
    console.log('2. Scanning for devices...');
    await messenger.scanForDevices();
    
    // Wait for scan to complete
    await new Promise(resolve => setTimeout(resolve, 12000));
    console.log('✓ Scan completed\n');

    // Example: Connect to a device (replace with actual device ID)
    const exampleDeviceId = 'AA:BB:CC:DD:EE:FF'; // Replace with actual device ID
    console.log(`3. Attempting to connect to device: ${exampleDeviceId}`);
    const connected = await messenger.connectToDevice(exampleDeviceId);
    
    if (connected) {
      console.log('✓ Connected successfully\n');

      // Send a simple message
      console.log('4. Sending a simple message...');
      const messageSent = await messenger.sendMessage(exampleDeviceId, 'Hello from BLE Messenger!');
      if (messageSent) {
        console.log('✓ Message sent successfully\n');
      }

      // Send a JSON-like message
      console.log('5. Sending a structured message...');
      const structuredMessage = JSON.stringify({
        action: 'status_update',
        data: {
          temperature: 23.5,
          humidity: 45.2,
          timestamp: new Date().toISOString()
        }
      });
      
      const structuredSent = await messenger.sendMessage(exampleDeviceId, structuredMessage);
      if (structuredSent) {
        console.log('✓ Structured message sent successfully\n');
      }

      // List connected devices
      console.log('6. Listing connected devices...');
      messenger.listConnectedDevices();
      console.log('');

      // Disconnect
      console.log('7. Disconnecting...');
      await messenger.disconnectFromDevice(exampleDeviceId);
      console.log('✓ Disconnected successfully\n');
    } else {
      console.log('⚠ Could not connect to device (this is expected if no device is available)\n');
    }

    // Example: Multiple device scenario
    console.log('8. Example: Multiple device scenario');
    console.log('   This would involve:');
    console.log('   - Connecting to multiple devices');
    console.log('   - Broadcasting messages to all');
    console.log('   - Managing different message types');
    console.log('   - Handling connection states\n');

    // Example: Error handling
    console.log('9. Example: Error handling');
    console.log('   - Network timeouts');
    console.log('   - Device disconnections');
    console.log('   - Invalid device IDs');
    console.log('   - Message size limits\n');

  } catch (error) {
    console.error('Error in example:', error);
  } finally {
    console.log('10. Cleaning up...');
    messenger.destroy();
    console.log('✓ Cleanup completed');
  }
}

// Example: Custom message types
function createCustomMessage(type, data) {
  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
    sender: 'ExampleScript',
    content: JSON.stringify(data),
    type: type
  };
}

// Example: Message templates
const messageTemplates = {
  status: (deviceId, status) => ({
    action: 'status_update',
    deviceId: deviceId,
    status: status,
    timestamp: new Date().toISOString()
  }),
  
  command: (command, parameters) => ({
    action: 'command',
    command: command,
    parameters: parameters,
    timestamp: new Date().toISOString()
  }),
  
  data: (dataType, value) => ({
    action: 'data_transfer',
    dataType: dataType,
    value: value,
    timestamp: new Date().toISOString()
  })
};

// Example: Usage patterns
async function demonstratePatterns() {
  console.log('=== Usage Patterns ===\n');
  
  const messenger = new BLEScriptMessenger();
  
  try {
    await messenger.initialize();
    
    // Pattern 1: Status monitoring
    console.log('Pattern 1: Status Monitoring');
    const statusMessage = messageTemplates.status('DEVICE_001', 'online');
    console.log('Status message:', JSON.stringify(statusMessage, null, 2));
    
    // Pattern 2: Command sending
    console.log('\nPattern 2: Command Sending');
    const commandMessage = messageTemplates.command('restart', { delay: 5000 });
    console.log('Command message:', JSON.stringify(commandMessage, null, 2));
    
    // Pattern 3: Data transfer
    console.log('\nPattern 3: Data Transfer');
    const dataMessage = messageTemplates.data('temperature', 23.5);
    console.log('Data message:', JSON.stringify(dataMessage, null, 2));
    
  } catch (error) {
    console.error('Pattern demonstration error:', error);
  } finally {
    messenger.destroy();
  }
}

// Run examples
if (require.main === module) {
  console.log('Starting BLE Messenger Examples...\n');
  
  // Run the main example
  exampleUsage().then(() => {
    console.log('\n=== Example completed ===');
    
    // Run pattern demonstration
    return demonstratePatterns();
  }).then(() => {
    console.log('\n=== All examples completed ===');
    process.exit(0);
  }).catch(error => {
    console.error('Example failed:', error);
    process.exit(1);
  });
}

module.exports = {
  exampleUsage,
  demonstratePatterns,
  messageTemplates,
  createCustomMessage
}; 