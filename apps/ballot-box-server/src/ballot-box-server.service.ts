import { BallotStorage } from '@app/database/entities/ballot-storage';
import { SpentTokens } from '@app/database/entities/spent-tokens';
import { ServerCheck, SubmitBallotDto } from '@election-system-core/shared';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { webcrypto } from 'crypto';
import * as blindrsa from '@app/crypto/blind-rsa';
import {
  getPrivateKeyFromPemFile,
  getPublicKeyFromPemFile,
  pemToDer,
} from '@app/crypto/key-store';

@Injectable()
export class BallotBoxServerService {
  constructor(
    @InjectRepository(SpentTokens, 'ELECTION')
    private spentTokensRepository: Repository<SpentTokens>,
    @InjectRepository(BallotStorage, 'BS')
    private ballotStorageRepository: Repository<BallotStorage>,
  ) {}
  getCheck(): ServerCheck {
    return {
      service: 'ballot-box-server',
      status: 'running',
    };
  }

  async getPublicKey() {
    const { publicPem } = await getPublicKeyFromPemFile(
      process.env.SECRET_FOLDER_PATH,
    );
    return publicPem;
  }

  async submitBallot({
    encryptedBallot,
    iv,
    encryptedKey,
    token,
    token_signature,
  }: SubmitBallotDto) {
    // 1) Load ES public key (path set by eligibility server at startup)
    const esPubPem = process.env.ES_PUBLIC_PEM;
    if (!esPubPem) {
      throw new BadRequestException('ES public key not configured');
    }

    const pubDer = pemToDer(esPubPem);

    // import ES public key as CryptoKey compatible with RSABSSA suite
    const esPublicKey = await webcrypto.subtle.importKey(
      'spki',
      pubDer,
      { name: 'RSA-PSS', hash: 'SHA-384' },
      true,
      ['verify'],
    );

    // 2) Verify the blind signature over the token
    const suite = blindrsa.createSuite();
    const prepared = Buffer.from(token, 'base64');
    const sigBuf = Buffer.from(token_signature, 'base64');
    const verified = await blindrsa.verify(
      suite,
      esPublicKey,
      sigBuf,
      prepared,
    );
    if (!verified) throw new BadRequestException('invalid token signature');

    // 3) Check spent tokens DB
    const existing = await this.spentTokensRepository.findOne({
      where: { token },
    });
    if (existing) {
      throw new BadRequestException('Token generated was already used');
    }

    // 4) Persist spent token
    const spentToken = this.spentTokensRepository.create({
      token,
    });
    await this.spentTokensRepository.save(spentToken);

    // 5) Store encrypted ballot and return signed receipt
    const ballotRecord = this.ballotStorageRepository.create({
      ballot_id: crypto.randomUUID(),
      encrypted_ballot: encryptedBallot,
      iv,
      encrypted_key: encryptedKey,
      token,
    });
    const saved = await this.ballotStorageRepository.save(ballotRecord);
    const ballotId = saved.ballot_id;

    // 6) Hash ballotId + encrypted ballot and sign with Ballot Box private key
    const dataToHash = Buffer.concat([
      Buffer.from(ballotId, 'utf8'),
      Buffer.from(String(encryptedBallot), 'utf8'),
    ]);
    const hashBuffer = await webcrypto.subtle.digest('SHA-256', dataToHash);

    const bbPrivateKey = await getPrivateKeyFromPemFile(
      process.env.SECRET_FOLDER_PATH,
    );

    const signature = await webcrypto.subtle.sign(
      { name: 'RSA-PSS', saltLength: 64 },
      bbPrivateKey.privateKey,
      hashBuffer,
    );
    const signatureB64 = Buffer.from(signature).toString('base64');

    return {
      ballotId,
      hash: Buffer.from(hashBuffer).toString('base64'),
      signature: signatureB64,
    };
  }
}
