import { webcrypto } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export function toPem(header: string, buf: ArrayBuffer) {
  const b64 = Buffer.from(buf).toString('base64');
  const lines = b64.match(/.{1,64}/g) || [];
  return `-----BEGIN ${header}-----\n${lines.join('\n')}\n-----END ${header}-----\n`;
}

export function pemToDer(pem: string) {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  return Buffer.from(b64, 'base64');
}

export async function pemToFile(pem: string, path: string) {
  return await fs.writeFile(path, pem);
}

export async function ensureServerKeys(appName: string, secretsDir?: string) {
  const dir =
    secretsDir || path.join(process.cwd(), 'apps', appName, 'secrets');
  await fs.mkdir(dir, { recursive: true });

  const pubPath = path.join(dir, 'public.pem');
  const privPath = path.join(dir, 'private.pem');

  const existsPub = await fileExists(pubPath);
  const existsPriv = await fileExists(privPath);

  if (existsPub && existsPriv) {
    return { publicPemPath: pubPath, privatePemPath: privPath };
  }

  // generate RSA-PSS 4096 keypair (SHA-384 to be compatible with SHA384.PSS suites)
  const keyPair = await webcrypto.subtle.generateKey(
    {
      name: 'RSA-PSS',
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-384',
    },
    true,
    ['sign', 'verify'],
  );

  const spki = await webcrypto.subtle.exportKey('spki', keyPair.publicKey);
  const pkcs8 = await webcrypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  const pubPem = toPem('PUBLIC KEY', spki);
  const privPem = toPem('PRIVATE KEY', pkcs8);

  await fs.writeFile(pubPath, pubPem, { encoding: 'utf-8', mode: 0o600 });
  await fs.writeFile(privPath, privPem, { encoding: 'utf-8', mode: 0o600 });

  return { publicPemPath: pubPath, privatePemPath: privPath };
}

export async function loadServerKeys(secretsDir?: string) {
  const dir = secretsDir || path.join(process.cwd());
  const pubPath = path.join(dir, 'public.pem');
  const privPath = path.join(dir, 'private.pem');

  const pubPem = String(await fs.readFile(pubPath, 'utf-8'));
  const privPem = String(await fs.readFile(privPath, 'utf-8'));

  const pubDer = pemToDer(pubPem);
  const privDer = pemToDer(privPem);

  const publicKey = await webcrypto.subtle.importKey(
    'spki',
    pubDer,
    { name: 'RSA-PSS', hash: 'SHA-384' },
    true,
    ['verify'],
  );

  const privateKey = await webcrypto.subtle.importKey(
    'pkcs8',
    privDer,
    { name: 'RSA-PSS', hash: 'SHA-384' },
    true,
    ['sign'],
  );

  return { publicKey, privateKey, publicPem: pubPem, privatePem: privPem };
}

export async function getPublicKeyFromPemFile(secretsDir?: string) {
  const dir = secretsDir || path.join(process.cwd());
  const pubPath = path.join(dir, 'public.pem');

  const pubPem = String(await fs.readFile(pubPath, 'utf-8'));

  const pubDer = pemToDer(pubPem);

  const publicKey = await webcrypto.subtle.importKey(
    'spki',
    pubDer,
    { name: 'RSA-PSS', hash: 'SHA-384' },
    true,
    ['verify'],
  );

  return { publicKey, publicPem: pubPem };
}

export async function getPrivateKeyFromPemFile(secretsDir?: string) {
  const dir = secretsDir || path.join(process.cwd());
  const privPath = path.join(dir, 'private.pem');

  const privPem = String(await fs.readFile(privPath, 'utf-8'));

  const privDer = pemToDer(privPem);

  const privateKey = await webcrypto.subtle.importKey(
    'pkcs8',
    privDer,
    { name: 'RSA-PSS', hash: 'SHA-384' },
    true,
    ['sign'],
  );

  return { privateKey, privatePem: privPem };
}
