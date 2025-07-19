import React from 'react';
import QRCode from 'react-native-qrcode-svg';
import { getKeyPair } from '../auth/storage/secureStore';

export default function QRDisplay() {
  const key = getKeyPair();
  if (!key) return null;

  const data = JSON.stringify({ publicKey: key.publicKey, name: 'My Device' });

  return <QRCode value={data} size={250} />;
}
