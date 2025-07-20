# Real Bluetooth Low Energy (BLE) Setup Guide

This guide explains how to set up real BLE functionality for connecting to actual Bluetooth devices.

## 🚀 Quick Start for Real BLE

### Prerequisites
- Xcode (for iOS development)
- Android Studio (for Android development)
- Physical device (BLE doesn't work in simulators)

### Step 1: Create Development Build

```bash
# Install development client
npx expo install expo-dev-client

# Create iOS development build
npx expo run:ios

# Create Android development build  
npx expo run:android
```

### Step 2: Install on Physical Device

1. **iOS**: Use Xcode to install the development build on your iPhone
2. **Android**: Use Android Studio to install the development build on your Android device

### Step 3: Test Real BLE

1. Open the app on your physical device
2. Go to the "Real BLE" tab
3. Grant Bluetooth and location permissions when prompted
4. Tap "Start Scan" to find nearby BLE devices
5. Connect to a device and send messages

## 🔧 How It Works

### Demo Mode vs Real BLE

- **Demo Mode** (`BLE Demo` tab): Simulates BLE functionality for testing UI
- **Real BLE** (`Real BLE` tab): Connects to actual Bluetooth devices

### Real BLE Features

- ✅ Scans for real BLE devices
- ✅ Connects to devices with proper services/characteristics
- ✅ Sends JSON messages via BLE
- ✅ Handles device disconnection
- ✅ Shows signal strength (RSSI)
- ✅ Proper permission handling

## 📱 Testing with Other Devices

### Option 1: Use BLE Testing Apps

Install these apps on other phones to test BLE communication:

**iOS:**
- nRF Connect (free)
- LightBlue Explorer (free)

**Android:**
- nRF Connect (free)
- BLE Scanner (free)

### Option 2: Use Python BLE Scripts

Run the included Python scripts on computers:

```bash
# Scan for devices
python3 scripts/ble_messenger.py scan

# Advertise as a BLE device
python3 scripts/ble_advertiser.py "Test Device"
```

### Option 3: Connect Two Phones

1. Install the development build on both phones
2. Open the "Real BLE" tab on both
3. Grant permissions on both devices
4. Start scanning on one device
5. The other device should appear in the scan results

## 🔍 Troubleshooting

### Common Issues

**"Bluetooth not initialized"**
- Make sure Bluetooth is enabled on your device
- Grant all required permissions
- Restart the app

**"No devices found"**
- Ensure the other device is advertising BLE services
- Check that both devices are within range (typically 10-30 meters)
- Try restarting Bluetooth on both devices

**"Failed to connect"**
- The device might not have the required BLE services
- Check if the device is already connected to another app
- Try disconnecting and reconnecting

**"Permission denied"**
- Go to device settings and manually grant Bluetooth and location permissions
- On Android, also grant "Nearby devices" permission

### Development Build Issues

**"Build failed"**
```bash
# Clean and rebuild
npx expo run:ios --clear
npx expo run:android --clear
```

**"Native module not found"**
```bash
# Reinstall dependencies
npm install
npx expo install --fix
```

## 📋 Required Permissions

### iOS
- `NSBluetoothAlwaysUsageDescription`
- `NSBluetoothPeripheralUsageDescription` 
- `NSLocationWhenInUseUsageDescription`

### Android
- `BLUETOOTH`
- `BLUETOOTH_ADMIN`
- `BLUETOOTH_SCAN`
- `BLUETOOTH_CONNECT`
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`

## 🎯 Testing Scenarios

### Scenario 1: Phone-to-Phone Communication
1. Install development build on two phones
2. Open "Real BLE" tab on both
3. Start scanning on Phone A
4. Phone B should appear in scan results
5. Connect and send messages

### Scenario 2: Phone-to-Computer Communication
1. Run Python BLE advertiser on computer
2. Open "Real BLE" tab on phone
3. Scan for devices
4. Computer should appear as BLE device
5. Connect and send messages

### Scenario 3: Medical Device Simulation
1. Use nRF Connect to simulate medical device
2. Create custom service with characteristics
3. Connect from phone app
4. Send/receive medical data

## 🔐 Security Considerations

- BLE communication is not encrypted by default
- Implement encryption for sensitive medical data
- Validate all received data
- Handle connection timeouts gracefully
- Implement proper error handling

## 📚 Additional Resources

- [React Native BLE PLX Documentation](https://github.com/Polidea/react-native-ble-plx)
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [BLE Specification](https://www.bluetooth.com/specifications/bluetooth-core-specification/)
- [iOS BLE Guidelines](https://developer.apple.com/design/human-interface-guidelines/bluetooth)
- [Android BLE Guidelines](https://developer.android.com/guide/topics/connectivity/bluetooth-le) 