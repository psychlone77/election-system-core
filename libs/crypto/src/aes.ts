import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

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
  key: Buffer,
  ivB64: string,
  tagB64: string,
) {
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plain;
}
