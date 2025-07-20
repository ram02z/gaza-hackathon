# BLE Messenger Scripts

This directory contains cross-platform scripts for sending JSON messages via Bluetooth Low Energy (BLE).

## Files

- `BLEMessenger.tsx` - React Native component for BLE messaging (for mobile apps)
- `ble-messenger.js` - Node.js script for command-line BLE messaging
- `ble_messenger.py` - Python script for command-line BLE messaging

## Prerequisites

### For React Native (BLEMessenger.tsx)
- React Native project with Expo
- `react-native-ble-plx` library (already installed)

### For Node.js (ble-messenger.js)
- Node.js installed
- `react-native-ble-plx` library (already installed)

### For Python (ble_messenger.py)
- Python 3.7+ installed
- `bleak` library: `pip install bleak`

## Usage

### React Native Component

Import and use the component in your React Native app:

```typescript
import BLEMessengerComponent from '../components/BLEMessenger';

// In your component
<BLEMessengerComponent />
```

### Node.js Script

```bash
# Scan for devices
node scripts/ble-messenger.js scan

# Connect to a device
node scripts/ble-messenger.js connect <device-id>

# Send message to specific device
node scripts/ble-messenger.js send <device-id> <message>

# Broadcast message to all connected devices
node scripts/ble-messenger.js broadcast <message>

# Disconnect from device
node scripts/ble-messenger.js disconnect <device-id>

# List connected devices
node scripts/ble-messenger.js list

# Show help
node scripts/ble-messenger.js help
```

### Python Script

```bash
# Scan for devices
python scripts/ble_messenger.py scan

# Connect to a device
python scripts/ble_messenger.py connect <device-id>

# Send message to specific device
python scripts/ble_messenger.py send <device-id> <message>

# Broadcast message to all connected devices
python scripts/ble_messenger.py broadcast <message>

# Disconnect from device
python scripts/ble_messenger.py disconnect <device-id>

# List connected devices
python scripts/ble_messenger.py list

# Show help
python scripts/ble_messenger.py help
```

## Message Format

All messages are sent in JSON format:

```json
{
  "id": "unique-message-id",
  "timestamp": 1640995200000,
  "sender": "ScriptName",
  "content": "Your message here",
  "type": "text"
}
```

## BLE Service Configuration

The scripts use the Nordic UART Service (NUS) for messaging:

- **Service UUID**: `6E400001-B5A3-F393-E0A9-E50E24DCCA9E`
- **TX Characteristic**: `6E400002-B5A3-F393-E0A9-E50E24DCCA9E`
- **RX Characteristic**: `6E400003-B5A3-F393-E0A9-E50E24DCCA9E`

## Features

- **Cross-platform**: Works on iOS, Android, Windows, macOS, and Linux
- **JSON messaging**: Structured message format with metadata
- **Chunked transmission**: Handles large messages by splitting into chunks
- **Multiple connections**: Connect to multiple devices simultaneously
- **Broadcast messaging**: Send messages to all connected devices
- **Error handling**: Robust error handling and connection management

## Examples

### Basic Usage

1. **Scan for devices**:
   ```bash
   python scripts/ble_messenger.py scan
   ```

2. **Connect to a device**:
   ```bash
   python scripts/ble_messenger.py connect AA:BB:CC:DD:EE:FF
   ```

3. **Send a message**:
   ```bash
   python scripts/ble_messenger.py send AA:BB:CC:DD:EE:FF "Hello, world!"
   ```

4. **Broadcast to all connected devices**:
   ```bash
   python scripts/ble_messenger.py broadcast "Hello everyone!"
   ```

### Advanced Usage

**Connect to multiple devices and send different messages**:

```bash
# Connect to first device
python scripts/ble_messenger.py connect AA:BB:CC:DD:EE:FF

# Connect to second device
python scripts/ble_messenger.py connect 11:22:33:44:55:66

# Send specific message to first device
python scripts/ble_messenger.py send AA:BB:CC:DD:EE:FF "Message for device 1"

# Send specific message to second device
python scripts/ble_messenger.py send 11:22:33:44:55:66 "Message for device 2"

# Broadcast to both devices
python scripts/ble_messenger.py broadcast "Message for everyone"
```

## Troubleshooting

### Common Issues

1. **Bluetooth not enabled**: Make sure Bluetooth is enabled on your device
2. **Permission denied**: Ensure your app has Bluetooth permissions
3. **Device not found**: Make sure the device is in range and advertising
4. **Connection failed**: Try scanning again or restart the device

### Platform-Specific Notes

- **iOS**: Requires Bluetooth permissions in Info.plist
- **Android**: Requires Bluetooth permissions in AndroidManifest.xml
- **Windows**: May require administrator privileges for some operations
- **macOS**: May require user approval for Bluetooth access

## Security Considerations

- BLE communications are not encrypted by default
- Consider implementing encryption for sensitive data
- Be aware of potential eavesdropping in public environments
- Validate received messages before processing

## License

This code is provided as-is for educational and development purposes. 