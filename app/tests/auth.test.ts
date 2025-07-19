import {
    createChallenge,
    respondToChallenge,
    verifyChallengeResponse,
} from '../auth/challenge';
import { generateKeyPair } from '../auth/crypto';
import { getKeyPair, storeKeyPair } from '../auth/storage/secureStore';
import { addToWhitelist, isWhitelisted, listWhitelist } from '../auth/whitelist';

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`❌ ${msg}`);
  else console.log(`✅ ${msg}`);
}

function testAll() {
  console.log('🧪 Running Authentication Tests...\n');

  // Step 1: Generate keys for Alice and Bob
  const alice = generateKeyPair();
  const bob = generateKeyPair();

  console.log('🔐 Alice Key Pair:');
  console.log('   Public Key:', alice.publicKey);
  console.log('   Private Key:', alice.privateKey.slice(0, 40) + '...'); // Truncate for readability

  console.log('🔐 Bob Key Pair:');
  console.log('   Public Key:', bob.publicKey);
  console.log('   Private Key:', bob.privateKey.slice(0, 40) + '...\n');

  // Step 2: Store Alice's key locally
  storeKeyPair(alice.privateKey, alice.publicKey);
  const aliceStored = getKeyPair();
  console.log('📦 Alice key stored in secure storage:', aliceStored ? '✔' : '✘');

  // Step 3: Show current whitelist (should be empty)
  console.log('\n📜 Whitelist before adding Bob:');
  console.log(listWhitelist());

  // Step 4: Add Bob to Alice's whitelist
  addToWhitelist({ name: 'Bob', publicKey: bob.publicKey });

  console.log('\n📜 Whitelist after adding Bob:');
  console.log(listWhitelist());

  // Step 5: Confirm Bob is in the whitelist
  assert(isWhitelisted(bob.publicKey), 'Bob should be whitelisted');

  // Step 6: Generate a challenge
  const challenge = createChallenge();
  console.log('\n🧩 Challenge string:', challenge);

  // Step 7: Bob signs the challenge
  const bobSignature = respondToChallenge(challenge, bob.privateKey);
  console.log('🖋️  Bob’s Signature:', bobSignature.slice(0, 40) + '...');

  // Step 8: Alice verifies Bob’s signature
  const verified = verifyChallengeResponse(challenge, bobSignature, bob.publicKey);
  assert(verified, 'Bob’s challenge response should verify');

  // Step 9: Negative test (use Alice’s key to verify Bob’s response)
  const tampered = verifyChallengeResponse(challenge, bobSignature, alice.publicKey);
  assert(!tampered, 'Tampered publicKey should fail verification');

  console.log('\n✅ All authentication tests passed!');
}

testAll();
