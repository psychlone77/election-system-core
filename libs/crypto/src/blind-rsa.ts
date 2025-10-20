import { RSABSSA } from '@cloudflare/blindrsa-ts';

/**
 * Create a suite instance. Caller may choose a variant; default to SHA384.PSS.Randomized
 */
export function createSuite() {
  return RSABSSA.SHA384.PSS.Randomized();
}

/**
 * Generate an RSA keypair using the provided suite (returns privateKey, publicKey, suite)
 */
export async function generateKeypair(
  suite = createSuite(),
  opts?: { modulusLength?: number; publicExponent?: number[] },
) {
  const publicExponent = opts?.publicExponent ?? [1, 0, 1];
  const modulusLength = opts?.modulusLength ?? 4096;
  const { privateKey, publicKey } = await suite.generateKey({
    publicExponent: Uint8Array.from(publicExponent),
    modulusLength,
  });
  return { privateKey, publicKey, suite };
}

/**
 * Blind a message using the suite and a public key.
 * Returns a Promise resolving to { blindedMsg, inv } as per README.
 */
export async function blind(
  suite: ReturnType<typeof createSuite>,
  message: Uint8Array | Buffer,
  publicKey: CryptoKey,
) {
  const preparedMessage = suite.prepare(message);
  const BlindOutput = await suite.blind(publicKey, preparedMessage);
  return {
    ...BlindOutput,
    preparedMessage,
  };
}

/**
 * Finalize a blinded signature into a usable signature.
 * README shows finalize(publicKey, preparedMsg, blindSig, inv)
 */

export async function finalize(
  suite: ReturnType<typeof createSuite>,
  publicKey: CryptoKey,
  preparedMessage: Uint8Array<ArrayBufferLike>,
  blindSignature: Uint8Array,
  inv: Uint8Array,
) {
  return suite.finalize(publicKey, preparedMessage, blindSignature, inv);
}

/**
 * Server: blind-sign a blinded message using the private key
 */
export async function signBlinded(
  suite: ReturnType<typeof createSuite>,
  privateKey: CryptoKey,
  blinded: Uint8Array | Buffer | string,
) {
  if (typeof blinded === 'string') {
    blinded = Buffer.from(blinded, 'base64');
  }
  return suite.blindSign(privateKey, blinded);
}

/**
 * Verify a signature. README shows verify(publicKey, signature, preparedMsg)
 */
export async function verify(
  suite: ReturnType<typeof createSuite>,
  publicKey: CryptoKey,
  signature: Uint8Array | Buffer,
  preparedMessage: Uint8Array | Buffer,
) {
  return suite.verify(publicKey, signature, preparedMessage);
}
