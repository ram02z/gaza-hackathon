#!/usr/bin/env python3

"""
BLE Advertiser Script
Makes this device discoverable as a BLE device for testing
"""

import asyncio
import json
import time
import uuid
from typing import Dict, Any

try:
    from bleak import BleakServer
    from bleak.backends.service import BleakGATTService
    from bleak.backends.characteristic import BleakGATTCharacteristic
except ImportError:
    print("Error: bleak library not found. Install it with: pip install bleak")
    exit(1)


class BLEAdvertiser:
    def __init__(self, device_name: str = "Test BLE Device"):
        self.device_name = device_name
        self.server = None
        self.is_advertising = False
        
        # Nordic UART Service UUIDs
        self.NUS_SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
        self.NUS_TX_CHARACTERISTIC_UUID = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
        self.NUS_RX_CHARACTERISTIC_UUID = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"
        
        # Message storage
        self.received_messages = []

    async def start_advertising(self):
        """Start advertising as a BLE device"""
        try:
            print(f"Starting BLE advertiser as '{self.device_name}'...")
            
            # Create a simple BLE server
            self.server = BleakServer()
            
            # Add Nordic UART Service
            service = BleakGATTService(
                uuid=self.NUS_SERVICE_UUID,
                handle=0x0010,
                properties=["read", "write", "notify"]
            )
            
            # Add TX characteristic (for receiving messages)
            tx_char = BleakGATTCharacteristic(
                uuid=self.NUS_TX_CHARACTERISTIC_UUID,
                handle=0x0011,
                properties=["write", "notify"],
                value=b""
            )
            
            # Add RX characteristic (for sending messages)
            rx_char = BleakGATTCharacteristic(
                uuid=self.NUS_RX_CHARACTERISTIC_UUID,
                handle=0x0012,
                properties=["read", "write"],
                value=b""
            )
            
            service.add_characteristic(tx_char)
            service.add_characteristic(rx_char)
            
            self.server.add_service(service)
            
            # Start advertising
            await self.server.start()
            self.is_advertising = True
            
            print(f"✅ '{self.device_name}' is now advertising!")
            print("   Other devices should be able to discover this device")
            print("   Press Ctrl+C to stop advertising")
            
            # Keep advertising
            while self.is_advertising:
                await asyncio.sleep(1)
                
        except Exception as e:
            print(f"Error starting advertiser: {e}")

    async def stop_advertising(self):
        """Stop advertising"""
        if self.server and self.is_advertising:
            await self.server.stop()
            self.is_advertising = False
            print("Stopped advertising")

    def handle_message(self, message_data: bytes):
        """Handle received messages"""
        try:
            message_str = message_data.decode('utf-8')
            message_json = json.loads(message_str)
            
            self.received_messages.append({
                'timestamp': time.time(),
                'data': message_json
            })
            
            print(f"📨 Received message: {message_json}")
            
        except Exception as e:
            print(f"Error handling message: {e}")


async def main():
    """Main function"""
    print("=== BLE Advertiser ===")
    print("This script makes this device discoverable as a BLE device")
    print("Other devices can then connect and send messages to this device")
    print()
    
    # Get device name from user
    device_name = input("Enter device name (default: 'Test BLE Device'): ").strip()
    if not device_name:
        device_name = "Test BLE Device"
    
    advertiser = BLEAdvertiser(device_name)
    
    try:
        await advertiser.start_advertising()
    except KeyboardInterrupt:
        print("\nStopping advertiser...")
        await advertiser.stop_advertising()
        print("Done!")


if __name__ == "__main__":
    asyncio.run(main()) 