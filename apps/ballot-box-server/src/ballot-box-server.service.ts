import { BallotStorage } from '@app/database/entities/ballot-storage';
import { SpentTokens } from '@app/database/entities/spent-tokens';
import { ServerCheck } from '@election-system-core/shared';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { webcrypto } from 'crypto';
import * as blindrsa from '@app/crypto/blind-rsa';
import { getPrivateKeyFromPemFile, pemToDer } from '@app/crypto/key-store';

@Injectable()
export class BallotBoxServerService {
  constructor(
    @InjectRepository(SpentTokens)
    private spentTokensRepository: Repository<SpentTokens>,
    @InjectRepository(BallotStorage)
    private ballotStorageRepository: Repository<BallotStorage>,
  ) {}
  getCheck(): ServerCheck {
    return {
      service: 'ballot-box-server',
      status: 'running',
    };
  }

  async submitBallot({
    token,
    token_signature,
    ballot,
  }: {
    token: string;
    token_signature: string;
    ballot: string;
  }) {
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
    const prepared = suite.prepare(Buffer.from(token, 'utf-8'));
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
      throw new BadRequestException('token already spent');
    }

    // 4) Persist spent token
    const spentToken = this.spentTokensRepository.create({ token });
    await this.spentTokensRepository.save(spentToken);

    // 5) Store encrypted ballot and return signed receipt
    const ballotRecord = this.ballotStorageRepository.create({
      encrypted_ballot: ballot,
    });
    const saved = await this.ballotStorageRepository.save(ballotRecord);
    const ballotId = saved.ballot_id;

    // 6) Hash ballotId + encrypted ballot and sign with Ballot Box private key
    const dataToHash = Buffer.concat([
      Buffer.from(ballotId, 'utf8'),
      Buffer.from(String(ballot), 'utf8'),
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
