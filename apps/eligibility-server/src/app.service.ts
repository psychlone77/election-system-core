import { ServerCheck } from '@election-system-core/shared/types';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  getPrivateKeyFromPemFile,
  getPublicKeyFromPemFile,
} from '@app/crypto/key-store';
import { blindrsa, ed25519 } from '@app/crypto';
import {
  EligibleVoter,
  RegisteredVoters,
  IssuedToken,
  Candidate,
} from '@app/database';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(EligibleVoter, 'ELIG')
    private eligibleVoterRepository: Repository<EligibleVoter>,
    @InjectRepository(RegisteredVoters, 'ELECTION')
    private registeredVoterRepository: Repository<RegisteredVoters>,
    @InjectRepository(IssuedToken, 'ELECTION')
    private issuedTokenRepository: Repository<IssuedToken>,
    @InjectRepository(Candidate, 'ELECTION')
    private candidateRepository: Repository<Candidate>,
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

  getPublicKey() {
    return getPublicKeyFromPemFile(process.env.SECRET_FOLDER_PATH);
  }

  getCandidates() {
    return this.candidateRepository.find();
  }

  async postCandidate(
    id: string,
    name: string,
    party: string,
  ) {
    if (!id || !name || !party) {
      throw new BadRequestException('missing fields');
    }
    const record = this.candidateRepository.create({
      id,
      name,
      party,
    });
    await this.candidateRepository.save(record);
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
      throw new BadRequestException('Voter not eligible');
    }

    if (
      !eligible.registration_code ||
      eligible.registration_code !== registrationCode
    ) {
      throw new BadRequestException('Invalid Registration Code');
    }

    const already = await this.registeredVoterRepository.findOne({
      where: { NIC: nic },
    });
    if (already) {
      throw new ConflictException('Voter already registered');
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
    if (!eligible)
      throw new BadRequestException('Voter not eligible or not found');

    const registered = await this.registeredVoterRepository.findOne({
      where: { NIC: nic },
    });
    if (!registered) {
      throw new BadRequestException('Voter not registered');
    }
    if (registered.token_issued) {
      throw new ConflictException('Token already issued for this NIC');
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
    const ok = ed25519.verify(
      registered.public_key,
      blindedTokenStr,
      signatureStr,
    );
    if (!ok) {
      throw new BadRequestException('invalid signature');
    }

    const esPrivateKey = await getPrivateKeyFromPemFile(
      process.env.SECRET_FOLDER_PATH,
    );
    const suite = blindrsa.createSuite();
    const blindSignature = await blindrsa.signBlinded(
      suite,
      esPrivateKey.privateKey,
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
