import { v4 as uuidv4 } from 'uuid';
import { signMessage, verifySignature } from './crypto';

export function createChallenge() {
  return uuidv4();
}

export function respondToChallenge(challenge: string, privateKey: string) {
  return signMessage(challenge, privateKey);
}

export function verifyChallengeResponse(challenge: string, signature: string, publicKey: string) {
  return verifySignature(challenge, signature, publicKey);
}
