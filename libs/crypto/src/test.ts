import { createHash, generateKeyPairSync } from 'crypto';
import { blind, createSuite, finalize, signBlinded, verify } from './blind-rsa';
import { pemToCryptoKey } from './key-store';
import { sign, verify as edVerify } from './ed25519';

// Generate Ed25519 key pair
const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

console.log('Public Key:\n', publicKey);
console.log('Private Key:\n', privateKey);

const nic = '741234567V';

const pk =
  '-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEADhlgcQBLkTMzWCY7ziw1wYqIJ0SC5O2ZmgEQ99ReiAI=\n-----END PUBLIC KEY-----';

const sk =
  '-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEIF38LozzTqpmTmPLmrkhYLaNpFRp5/2Km5vElwd4JHtX\n-----END PRIVATE KEY-----';

// generate SHA256 of nic and private key sk
const hash = createHash('sha256');
hash.update(nic + sk);
const digest = hash.digest('hex');

console.log('SHA256 Digest:', digest);

//generate server blind rsa 4096 key pair
const rsaPub = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAp2SUIUaPwkA2boAAAzpM
Dh8TXjN8vpxrMFShAHpIEWfGcnfMM6Usx6Msnt4VP0+K7BFcDhpxL1gBpWYcurZ3
25spJsCxKo635Z9KYMf0OA6lcjcJPATv6co5I+SXkpfw4chF4a5rIf53MC2uBngq
Co63jjqY9JPX2jxkxUb2P6spgljpEcLuZX6VOiYUXk6MXoYsJoI3H6UsgR3cQF1u
xt3sFcC3YeTnEFHC5C9z6Hxl8rys7Wrls1DWVOH6xP/Yw5ptndpCFSthJYJTACvT
ebkZsfl0u0bRIAyJRZ2n1Hfy1R/d0bAlXUdrf4nSWvd/UW1zGURsAueXua3ESOZl
nKj0Nbyf8nOCuVPu341SLgeZ0vuFqdJvwCHcNgDzWFLO6BxcOOBQ59J+5Rgyw2pk
R6Cy5MbGOPlYw5rtilYtLc+dO2L02eMhcuT89OlAIY60Obi+xX7eBCeugU1DmR/c
z9dn9mpuGKN5Z6cMvCciTIuOGFdNHy49klZgQIB6tz3PUMyPaeXA6Lurg1Cl6dW7
Ym/+li/i9bCRzCO+hXoOf0Ui5HMrCGZmb71KpA/HwjQzatAGeXqI9RPLILBHDLEf
Km1uzVuQKb3THVorJqnydhZ4vuMaP8C7iQ+4rItrYScTArBNlkzipdewc3HOFvnZ
YfTisFCFK2F4JTEHGFOZEhcCAwEAAQ==
-----END PUBLIC KEY-----`;

const rsaPriv = `-----BEGIN PRIVATE KEY-----
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
expW4SdFIADa7ubw3qPdsqTAhqmkqQ==
-----END PRIVATE KEY-----
`;

//blind the hash
let rsaPublicKey: CryptoKey;
pemToCryptoKey(rsaPub, 'public')
  .then(async (key) => {
    rsaPublicKey = key;
    const suite = createSuite();
    const blindOuput = await blind(
      suite,
      Buffer.from(digest, 'hex'),
      rsaPublicKey,
    );
    // You can use blindOuput here or log it
    console.log('Blinded Message:', blindOuput);

    // Voter signs the blinded message along with inv and nic
    const voter_signature = sign(
      Buffer.from(blindOuput.blindedMsg).toString('base64') +
        Buffer.from(blindOuput.inv).toString('base64') +
        nic,
      sk,
    );
    console.log('Voter Signature:', voter_signature);

    // Voter sends the blinded message and signature to the server

    //server verifies the voter's signature
    const isVoterSigValid = edVerify(
      pk,
      Buffer.from(blindOuput.blindedMsg).toString('base64') +
        Buffer.from(blindOuput.inv).toString('base64') +
        nic,
      voter_signature,
    );

    console.log('Is Voter Signature Valid?', isVoterSigValid);

    // server signs the blinded message
    const rsaPrivateKey = await pemToCryptoKey(rsaPriv, 'private');
    const blindSignature = await signBlinded(
      suite,
      rsaPrivateKey,
      blindOuput.blindedMsg,
    );

    console.log('Blind Signature:', blindSignature);

    // Client finalizes the signature
    const finalizedSignature = await finalize(
      suite,
      rsaPublicKey,
      blindOuput.preparedMessage,
      blindSignature,
      blindOuput.inv,
    );

    console.log('Finalized Signature:', finalizedSignature);

    // Verify the finalized signature
    const isValid = await verify(
      suite,
      rsaPublicKey,
      finalizedSignature,
      blindOuput.preparedMessage,
    );

    console.log('Is the finalized signature valid?', isValid);
  })
  .catch((err) => {
    console.error('Failed to convert PEM to CryptoKey:', err);
  });
