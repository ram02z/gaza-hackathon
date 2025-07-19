type WhitelistedDevice = {
  publicKey: string;
  name?: string;
};

let whitelist: WhitelistedDevice[] = [];

export function addToWhitelist(device: WhitelistedDevice) {
  if (!whitelist.find(d => d.publicKey === device.publicKey)) {
    whitelist.push(device);
  }
}

export function isWhitelisted(publicKey: string) {
  return whitelist.some(d => d.publicKey === publicKey);
}

export function listWhitelist() {
  return whitelist;
}
