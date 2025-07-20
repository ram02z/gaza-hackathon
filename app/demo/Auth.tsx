import React, { useEffect } from 'react';
import { Button, Text, View } from 'react-native';
import { generateKeyPair } from '../auth/crypto';
import { storeKeyPair } from '../auth/storage/secureStore';
import QRDisplay from '../qr/QRDisplay';
import QRScanner from '../qr/QRScanner';

export default function App() {
  useEffect(() => {
    // Setup first run
    const key = generateKeyPair();
    storeKeyPair(key.privateKey, key.publicKey);
  }, []);

  const [scanning, setScanning] = React.useState(false);

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Device Auth Demo</Text>
      <QRDisplay />
      <Button title="Scan QR to Add Device" onPress={() => setScanning(true)} />
      {scanning && <QRScanner onScanned={() => setScanning(false)} />}
    </View>
  );
}