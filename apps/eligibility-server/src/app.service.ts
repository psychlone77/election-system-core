import { EligibleVoter } from '@app/database/entities/eligible-voters';
import { RegisteredVoters } from '@app/database/entities/registered-voters';
import { ServerCheck } from '@election-system-core/shared/types';
import { IssuedToken } from '@app/database/entities/issued-tokens';
import * as cryptoHelpers from '@app/crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getPublicKeyFromPemFile } from '@app/crypto/helper';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(EligibleVoter)
    private eligibleVoterRepository: Repository<EligibleVoter>,
    @InjectRepository(RegisteredVoters)
    private registeredVoterRepository: Repository<RegisteredVoters>,
    @InjectRepository(IssuedToken)
    private issuedTokenRepository: Repository<IssuedToken>,
  ) {}
  getCheck(): ServerCheck {
    return {
      service: 'eligibility-server',
      status: 'running',
    };
  }
  getEligibleVoters() {
    return this.eligibleVoterRepository.find();
  }

  async registerVoter(
    nic: string,
    registrationCode: string,
    publicKey: string,
  ) {
    if (!nic || !registrationCode || !publicKey) {
      throw new BadRequestException('missing fields');
    }

    const eligible = await this.eligibleVoterRepository.findOne({
      where: { NIC: nic },
    });
    if (!eligible) {
      throw new BadRequestException('voter not eligible');
    }

    if (
      !eligible.registration_code ||
      eligible.registration_code !== registrationCode
    ) {
      throw new BadRequestException('invalid registration code');
    }

    const already = await this.registeredVoterRepository.findOne({
      where: { NIC: nic },
    });
    if (already) {
      throw new ConflictException('voter already registered');
    }

    const record = this.registeredVoterRepository.create({
      NIC: nic,
      public_key: publicKey,
    });
    await this.registeredVoterRepository.save(record);

    // Optionally clear/consume the registration code so it can't be reused
    await this.eligibleVoterRepository.save(eligible);

    return { success: true, NIC: nic };
  }

  async requestToken(nic: string, blindedToken: string, signature: string) {
    if (!nic || !blindedToken || !signature) {
      throw new BadRequestException('missing fields');
    }

    const eligible = await this.eligibleVoterRepository.findOne({
      where: { NIC: nic },
    });
    if (!eligible) throw new BadRequestException('voter not eligible');

    const registered = await this.registeredVoterRepository.findOne({
      where: { NIC: nic },
    });
    if (!registered) {
      throw new BadRequestException('voter not registered');
    }
    if (registered.token_issued) {
      throw new ConflictException('token already issued for this NIC');
    }

    // Normalize inputs: accept either Buffer/Uint8Array or string for blindedToken/signature
    const blindedTokenStr =
      typeof blindedToken === 'string'
        ? blindedToken
        : Buffer.from(blindedToken as any).toString('base64');
    const signatureStr =
      typeof signature === 'string'
        ? signature
        : Buffer.from(signature as any).toString('base64');

    // Verify the Ed25519 signature over the blindedToken using the stored public key
    const ok = cryptoHelpers.ed25519.verify(
      registered.public_key,
      blindedTokenStr,
      signatureStr,
    );
    if (!ok) {
      throw new BadRequestException('invalid signature');
    }

    const esPrivateKey = await getPublicKeyFromPemFile(
      process.env.ES_PRIVATE_KEY_PATH || 'es-private-key.pem',
    );
    const suite = cryptoHelpers.blindrsa.createSuite();
    const blindSignature = await cryptoHelpers.blindrsa.signBlinded(
      suite,
      esPrivateKey,
      blindedTokenStr,
    );

    // Persist issued token record
    const issued = this.issuedTokenRepository.create({
      nic,
      blinded_token: blindedTokenStr,
      blind_signature: String(blindSignature),
    });
    await this.issuedTokenRepository.save(issued);

    // Mark eligible voter as having been issued a token to prevent re-issuance
    registered.token_issued = true;
    await this.registeredVoterRepository.save(registered);

    return { success: true, blindSignature };
  }
}
