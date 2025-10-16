import {
  createPublicKey,
  createPrivateKey,
  sign as nodeSign,
  verify as nodeVerify,
} from 'crypto';

// export function generateEd25519Keypair() {
//   const { publicKey, privateKey } = createPrivateKey({ key: '' });
//   // NOTE: this function is a placeholder. Key generation for ed25519 should
//   // use crypto.generateKeyPairSync in Node.js v12.17+ or higher.
//   throw new Error(
//     'Key generation not implemented in this scaffold. Use crypto.generateKeyPairSync in Node.js runtime.',
//   );
// }

export function sign(message: Buffer | string, privateKeyPem: string) {
  const key = createPrivateKey({ key: privateKeyPem });
  const msg =
    typeof message === 'string' ? Buffer.from(message, 'utf8') : message;
  return nodeSign(null, msg, key).toString('base64');
}

export function verify(
  publicKeyPem: string,
  message: Buffer | string,
  signatureB64: string,
) {
  const key = createPublicKey({ key: publicKeyPem });
  const msg =
    typeof message === 'string' ? Buffer.from(message, 'utf8') : message;
  const sig = Buffer.from(signatureB64, 'base64');
  return nodeVerify(null, msg, key, sig);
}

export default { sign, verify };
