import { subtle } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import secrets from 'secrets.js-grempe';
import { toPem } from './key-store';

export async function ensureThresholdKeys(
  appName = 'tallying-server',
  secretsDir = './secrets',
  numShares = 5,
  threshold = 3,
) {
  const pubKeyPath = path.join(secretsDir, `${appName}.pub`);
  const sharesDir = path.join(secretsDir, `${appName}-shares`);

  // Check if public key and shares exist
  const pubKeyExists = fs.existsSync(pubKeyPath);
  const sharesExist =
    fs.existsSync(sharesDir) && fs.readdirSync(sharesDir).length >= numShares;

  if (pubKeyExists && sharesExist) {
    return;
  }

  // Generate new secret and shares
  if (!fs.existsSync(secretsDir)) fs.mkdirSync(secretsDir, { recursive: true });
  if (!fs.existsSync(sharesDir)) fs.mkdirSync(sharesDir, { recursive: true });
  const { publicKey, privateKey } = await subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'],
  );
  // Export privateKey to ArrayBuffer (PKCS8) and convert to hex
  const pkcs8 = await subtle.exportKey('pkcs8', privateKey);
  const privateKeyHex = Buffer.from(pkcs8).toString('hex');
  const shares = secrets.share(privateKeyHex, numShares, threshold);

  // Export publicKey to ArrayBuffer (SPKI) and save as PEM
  const spki = await subtle.exportKey('spki', publicKey);
  const pubKeyPem = toPem('PUBLIC KEY', spki);

  fs.writeFileSync(pubKeyPath, pubKeyPem, 'utf-8');

  // Save shares
  shares.forEach((share, idx) => {
    fs.writeFileSync(path.join(sharesDir, `share${idx + 1}`), share, 'utf-8');
  });
}

export function reconstructSecretFromShares(
  secretsDir: string,
  threshold: number,
): Promise<CryptoKey> {
  const shares = fs
    .readdirSync(secretsDir)
    .map((file) => fs.readFileSync(path.join(secretsDir, file), 'utf-8'));
  if (shares.length < threshold) {
    throw new Error(
      `Not enough shares to reconstruct the secret. Required: ${threshold}, Found: ${shares.length}`,
    );
  }
  const combinedHex = secrets.combine(shares);
  const combinedBuffer = Buffer.from(combinedHex, 'hex');
  return subtle.importKey(
    'pkcs8',
    combinedBuffer,
    { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
    true,
    ['decrypt', 'unwrapKey'],
  );
}
