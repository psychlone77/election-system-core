import nacl from 'tweetnacl';
import { decodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';

export function sign(message: Buffer | string, privateKey: Uint8Array) {
  const msg =
    typeof message === 'string' ? decodeUTF8(message) : new Uint8Array(message);
  const signature = nacl.sign.detached(msg, privateKey);
  return encodeBase64(signature);
}

export function verify(
  publicKey: Uint8Array,
  message: Buffer | string,
  signatureB64: string,
) {
  const msg =
    typeof message === 'string' ? decodeUTF8(message) : new Uint8Array(message);
  const signature = decodeBase64(signatureB64);
  return nacl.sign.detached.verify(msg, signature, publicKey);
}

export default { sign, verify };
