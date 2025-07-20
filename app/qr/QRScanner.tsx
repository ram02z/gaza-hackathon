import React from 'react';
import { RNCamera } from 'react-native-camera';
import { addToWhitelist } from '../auth/whitelist';

export default function QRScanner({ onScanned }: { onScanned: () => void }) {
  const onBarCodeRead = ({ data }: { data: string }) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.publicKey) {
        addToWhitelist(parsed);
        onScanned();
      }
    } catch (e) {
      console.warn('Invalid QR');
    }
  };

  return (
    <RNCamera
      style={{ flex: 1 }}
      onBarCodeRead={onBarCodeRead}
      captureAudio={false}
    />
  );
}
