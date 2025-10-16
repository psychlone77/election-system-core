import { webcrypto } from 'crypto';
import * as fs from 'fs';

export function getPublicKeyFromPemFile(
  pemFilePath: string,
): Promise<CryptoKey> {
  const pem = fs.readFileSync(pemFilePath, 'utf-8');
  const publicKey = webcrypto.subtle.importKey(
    'spki',
    Buffer.from(pem, 'base64'),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt'],
  );
  return publicKey;
}

export function getPrivateKeyFromPemFile(
  pemFilePath: string,
): Promise<CryptoKey> {
  const pem = fs.readFileSync(pemFilePath, 'utf-8');
  const privateKey = webcrypto.subtle.importKey(
    'pkcs8',
    Buffer.from(pem, 'base64'),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['decrypt'],
  );
  return privateKey;
}
