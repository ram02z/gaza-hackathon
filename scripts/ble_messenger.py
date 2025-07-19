#!/usr/bin/env python3

"""
Cross-platform BLE Messenger Script (Python Version)

This script provides a command-line interface for sending JSON messages
via Bluetooth Low Energy (BLE).

Usage:
    python ble_messenger.py scan                    # Scan for devices
    python ble_messenger.py connect <device-id>     # Connect to device
    python ble_messenger.py send <device-id> <message>  # Send message to device
    python ble_messenger.py broadcast <message>     # Send message to all connected devices
    python ble_messenger.py disconnect <device-id>  # Disconnect from device
    python ble_messenger.py list                    # List connected devices
    python ble_messenger.py help                    # Show help
"""

import asyncio
import json
import sys
import time
import uuid
from typing import Dict, List, Optional
import argparse

try:
    import asyncio
    from bleak import BleakClient, BleakScanner
    from bleak.backends.device import BLEDevice
except ImportError:
    print("Error: bleak library not found. Install it with: pip install bleak")
    sys.exit(1)


class BLEMessenger:
    def __init__(self):
        self.connected_devices: Dict[str, BleakClient] = {}
        self.is_scanning = False
        
        # Standard BLE service and characteristic UUIDs for messaging
        self.MESSAGING_SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"  # Nordic UART Service
        self.TX_CHARACTERISTIC_UUID = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"  # TX Characteristic
        self.RX_CHARACTERISTIC_UUID = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"  # RX Characteristic

    async def scan_for_devices(self, duration: int = 10) -> List[BLEDevice]:
        """Scan for BLE devices that support the messaging service."""
        if self.is_scanning:
            print("Already scanning...")
            return []

        try:
            self.is_scanning = True
            print(f"Scanning for BLE devices for {duration} seconds...")
            
            devices = await BleakScanner.discover(
                timeout=duration,
                service_uuids=[self.MESSAGING_SERVICE_UUID]
            )
            
            print(f"Found {len(devices)} devices:")
            for device in devices:
                print(f"  - {device.name or 'Unknown'} ({device.address})")
                if device.metadata:
                    print(f"    RSSI: {device.metadata.get('rssi', 'N/A')}")
            
            return devices
            
        except Exception as e:
            print(f"Scan error: {e}")
            return []
        finally:
            self.is_scanning = False

    async def connect_to_device(self, device_id: str) -> bool:
        """Connect to a BLE device."""
        try:
            print(f"Connecting to device: {device_id}")
            
            client = BleakClient(device_id)
            await client.connect()
            
            # Discover services
            services = await client.get_services()
            print(f"Connected to: {device_id}")
            print(f"Services found: {len(services)}")
            
            self.connected_devices[device_id] = client
            return True
            
        except Exception as e:
            print(f"Connection error: {e}")
            return False

    async def disconnect_from_device(self, device_id: str) -> None:
        """Disconnect from a BLE device."""
        client = self.connected_devices.get(device_id)
        if client:
            try:
                await client.disconnect()
                del self.connected_devices[device_id]
                print(f"Disconnected from: {device_id}")
            except Exception as e:
                print(f"Disconnection error: {e}")
        else:
            print("Device not connected")

    async def send_message(self, device_id: str, message: str) -> bool:
        """Send a JSON message to a specific device."""
        client = self.connected_devices.get(device_id)
        if not client:
            print(f"Device not connected: {device_id}")
            return False

        try:
            ble_message = {
                "id": str(uuid.uuid4()),
                "timestamp": int(time.time() * 1000),
                "sender": "PythonScript",
                "content": message,
                "type": "text"
            }

            message_json = json.dumps(ble_message)
            message_bytes = message_json.encode('utf-8')

            # Split message into chunks if it's too large (BLE has MTU limits)
            chunk_size = 20
            chunks = [message_bytes[i:i + chunk_size] for i in range(0, len(message_bytes), chunk_size)]

            print(f"Sending message to {device_id}: {ble_message}")

            # Send each chunk
            for i, chunk in enumerate(chunks):
                await client.write_gatt_char(
                    self.TX_CHARACTERISTIC_UUID,
                    chunk
                )
                
                # Small delay between chunks
                if i < len(chunks) - 1:
                    await asyncio.sleep(0.05)

            print("Message sent successfully")
            return True
            
        except Exception as e:
            print(f"Send message error: {e}")
            return False

    async def broadcast_message(self, message: str) -> int:
        """Send a message to all connected devices."""
        if not self.connected_devices:
            print("No devices connected")
            return 0

        print(f"Broadcasting message to {len(self.connected_devices)} devices")
        
        tasks = [
            self.send_message(device_id, message)
            for device_id in self.connected_devices.keys()
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        success_count = sum(1 for result in results if result is True)
        
        print(f"Message sent to {success_count}/{len(self.connected_devices)} devices")
        return success_count

    def list_connected_devices(self) -> None:
        """List all connected devices."""
        if not self.connected_devices:
            print("No devices connected")
            return

        print("Connected devices:")
        for device_id in self.connected_devices.keys():
            print(f"  - {device_id}")

    async def cleanup(self) -> None:
        """Clean up all connections."""
        if self.connected_devices:
            print("Disconnecting from all devices...")
            tasks = [
                self.disconnect_from_device(device_id)
                for device_id in list(self.connected_devices.keys())
            ]
            await asyncio.gather(*tasks, return_exceptions=True)


async def main():
    """Main function to handle command-line interface."""
    parser = argparse.ArgumentParser(description="Cross-platform BLE Messenger")
    parser.add_argument("command", choices=[
        "scan", "connect", "send", "broadcast", "disconnect", "list", "help"
    ])
    parser.add_argument("args", nargs="*", help="Command arguments")
    
    args = parser.parse_args()

    if args.command == "help":
        show_help()
        return

    messenger = BLEMessenger()
    
    try:
        if args.command == "scan":
            await messenger.scan_for_devices()

        elif args.command == "connect":
            if len(args.args) < 1:
                print("Error: Please provide a device ID")
                return
            device_id = args.args[0]
            await messenger.connect_to_device(device_id)

        elif args.command == "disconnect":
            if len(args.args) < 1:
                print("Error: Please provide a device ID")
                return
            device_id = args.args[0]
            await messenger.disconnect_from_device(device_id)

        elif args.command == "send":
            if len(args.args) < 2:
                print("Error: Please provide device ID and message")
                return
            device_id = args.args[0]
            message = " ".join(args.args[1:])
            await messenger.send_message(device_id, message)

        elif args.command == "broadcast":
            if len(args.args) < 1:
                print("Error: Please provide a message")
                return
            message = " ".join(args.args)
            await messenger.broadcast_message(message)

        elif args.command == "list":
            messenger.list_connected_devices()

    except KeyboardInterrupt:
        print("\nInterrupted by user")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await messenger.cleanup()


def show_help():
    """Show help information."""
    help_text = """
Cross-platform BLE Messenger Script (Python Version)

Usage:
    python ble_messenger.py scan                    # Scan for devices
    python ble_messenger.py connect <device-id>     # Connect to device
    python ble_messenger.py send <device-id> <message>  # Send message to device
    python ble_messenger.py broadcast <message>     # Send message to all connected devices
    python ble_messenger.py disconnect <device-id>  # Disconnect from device
    python ble_messenger.py list                    # List connected devices
    python ble_messenger.py help                    # Show this help

Examples:
    python ble_messenger.py scan
    python ble_messenger.py connect AA:BB:CC:DD:EE:FF
    python ble_messenger.py send AA:BB:CC:DD:EE:FF "Hello, world!"
    python ble_messenger.py broadcast "Hello everyone!"
    python ble_messenger.py disconnect AA:BB:CC:DD:EE:FF
    python ble_messenger.py list

Requirements:
    pip install bleak
"""
    print(help_text)


if __name__ == "__main__":
    asyncio.run(main()) 