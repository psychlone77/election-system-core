import { randomBytes, createCipheriv } from 'crypto';

export function generateAesKey(): Buffer {
  return randomBytes(32); // 256-bit
}

export function encryptAesGcm(plaintext: Buffer, key: Buffer) {
  const iv = randomBytes(12); // recommended 96-bit IV for GCM
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
    tag: tag.toString('base64'),
  };
}

export function decryptAesGcm(
  ciphertextB64: string,
  key: CryptoKey,
  ivB64: string,
) {
  const iv = Buffer.from(ivB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');
  const decipher = crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    ciphertext,
  );
  return decipher;
}
