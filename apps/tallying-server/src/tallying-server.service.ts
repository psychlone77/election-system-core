import { decryptAesGcm } from '@app/crypto/aes';
import { getPublicEncryptionKeyFromPemFile } from '@app/crypto/key-store';
import { reconstructSecretFromShares } from '@app/crypto/threshold';
import { BallotStorage, Candidate, DecryptedBallot } from '@app/database';
import { BallotPayload, ServerCheck } from '@election-system-core/shared/types';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TallyingServerService {
  constructor(
    @InjectRepository(BallotStorage, 'BS')
    private ballotStorageRepository: Repository<BallotStorage>,
    @InjectRepository(Candidate, 'ELECTION')
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(DecryptedBallot, 'BS')
    private decryptedBallotRepository: Repository<DecryptedBallot>,
  ) {}
  getCheck(): ServerCheck {
    return {
      service: 'tallying-server',
      status: 'running',
    };
  }
  async getPublicKey() {
    const { publicPem } = await getPublicEncryptionKeyFromPemFile(
      process.env.SECRET_FOLDER_PATH,
      'tallying-server.pub',
    );
    return publicPem;
  }

  private parseBallotBuffer(buf: Buffer): BallotPayload | null {
    try {
      const s = buf.toString('utf8');
      const parsed: unknown = JSON.parse(s);
      if (this.isValidBallot(parsed)) return parsed as BallotPayload;
      return null;
    } catch {
      return null;
    }
  }

  private isValidBallot(obj: unknown): boolean {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        if (typeof k !== 'string') return false;
        if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return false;
      }
      return true;
    }
    return false;
  }

  async startTallyingProcess() {
    // reconstruct private key (your threshold function returns string/Buffer)
    const privateKey = await reconstructSecretFromShares(
      './apps/tallying-server/secrets/tallying-server-shares',
      3,
    );

    const ballots = await this.ballotStorageRepository.find();

    // aggregated counts - initialize with candidates from DB so missing candidates are present with 0
    const tally = new Map<string, number>();
    let candidates: Candidate[];
    try {
      candidates = await this.candidateRepository.find();
      for (const c of candidates) {
        if (c && c.id) tally.set(c.id, 0);
      }
    } catch (err) {
      // If candidate table isn't available or query fails, continue with empty tally map
      console.warn(
        'Could not initialize candidates for tallying:',
        String(err),
      );
    }

    for (const ballot of ballots) {
      try {
        console.log('Private Key:', privateKey);
        const ballotKey = await crypto.subtle.unwrapKey(
          'raw',
          Buffer.from(ballot.encrypted_key, 'base64'),
          privateKey,
          {
            name: 'RSA-OAEP',
          },
          {
            name: 'AES-GCM',
            length: 256,
          },
          true,
          ['decrypt'],
        );
        console.log('Ballot Key:', ballotKey);
        const decrypted = await decryptAesGcm(
          ballot.encrypted_ballot,
          ballotKey,
          ballot.iv,
        ); // Buffer or Uint8Array

        const payload = this.parseBallotBuffer(Buffer.from(decrypted));
        if (!payload) {
          console.warn(`Skipping invalid ballot id=${ballot.ballot_id}`);
          continue;
        }
        const decryptedBallot = this.decryptedBallotRepository.create({
          ballot_id: ballot.ballot_id,
          decrypted_ballot: Buffer.from(decrypted).toString('base64'),
          encrypted_ballot: ballot.encrypted_ballot,
          iv: ballot.iv,
          encrypted_key: ballot.encrypted_key,
          token: ballot.token,
        });
        await this.decryptedBallotRepository.save(decryptedBallot);
        // aggregate
        for (const [candidateId, votes] of Object.entries(payload)) {
          const prev = tally.get(candidateId) ?? 0;
          tally.set(candidateId, prev + votes);
        }
      } catch (err) {
        console.warn(
          `Failed to decrypt/parse ballot id=${ballot.ballot_id}: ${String(err)}`,
        );
        continue;
      }
    }

    // Example: print results
    const results = Array.from(tally.entries()).map(([candidate, count]) => ({
      candidate,
      name: candidates.find((c) => c.id === candidate)?.name ?? 'Unknown',
      count,
    }));
    console.log('Tally results:', results);

    return { results };
  }
}
