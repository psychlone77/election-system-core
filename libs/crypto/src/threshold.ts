import * as fs from 'fs';
import * as path from 'path';
import secrets from 'secrets.js-grempe';

export function ensureThresholdKeys(
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

  const secret = secrets.random(4096);
  const shares = secrets.share(secret, numShares, threshold);

  // Save public key (the secret in this context)
  fs.writeFileSync(pubKeyPath, secret, 'utf-8');

  // Save shares
  shares.forEach((share, idx) => {
    fs.writeFileSync(path.join(sharesDir, `share${idx + 1}`), share, 'utf-8');
  });
}

export function reconstructSecretFromShares(
  secretsDir: string,
  threshold: number,
): string {
  const shares = fs
    .readdirSync(secretsDir)
    .map((file) => fs.readFileSync(path.join(secretsDir, file), 'utf-8'));
  if (shares.length < threshold) {
    throw new Error(
      `Not enough shares to reconstruct the secret. Required: ${threshold}, Found: ${shares.length}`,
    );
  }
  return secrets.combine(shares);
}
