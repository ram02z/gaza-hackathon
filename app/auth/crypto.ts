import nacl from 'tweetnacl';
import { decodeBase64, decodeUTF8, encodeBase64 } from 'tweetnacl-util';

export function generateKeyPair() {
  const pair = nacl.sign.keyPair();
  return {
    publicKey: encodeBase64(pair.publicKey),
    privateKey: encodeBase64(pair.secretKey),
  };
}

export function signMessage(message: string, privateKey: string) {
  const msg = decodeUTF8(message);
  const key = decodeBase64(privateKey);
  return encodeBase64(nacl.sign.detached(msg, key));
}

export function verifySignature(message: string, signature: string, publicKey: string) {
  const msg = decodeUTF8(message);
  const sig = decodeBase64(signature);
  const key = decodeBase64(publicKey);
  return nacl.sign.detached.verify(msg, sig, key);
}
