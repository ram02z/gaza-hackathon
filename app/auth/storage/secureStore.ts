let keyStore: { publicKey: string; privateKey: string } | null = null;

export function storeKeyPair(privateKey: string, publicKey: string) {
  keyStore = { privateKey, publicKey };
}

export function getKeyPair() {
  return keyStore;
}
