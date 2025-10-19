import { decryptAesGcm } from '@app/crypto/aes';
import { reconstructSecretFromShares } from '@app/crypto/threshold';
import { BallotStorage } from '@app/database/entities/ballot-storage';
import { Candidate } from '@app/database/entities/candidates';
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
  ) {}
  getCheck(): ServerCheck {
    return {
      service: 'tallying-server',
      status: 'running',
    };
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
    const privateKeyString = reconstructSecretFromShares(
      './apps/tallying-server/secrets',
      3,
    );
    const privateKey = Buffer.from(privateKeyString, 'utf-8');

    const ballots = await this.ballotStorageRepository.find();

    // aggregated counts - initialize with candidates from DB so missing candidates are present with 0
    const tally = new Map<string, number>();
    try {
      const candidates = await this.candidateRepository.find();
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
        const decrypted = decryptAesGcm(
          ballot.encrypted_ballot,
          privateKey,
          ballot.iv,
          ballot.tag,
        ); // Buffer or Uint8Array

        const payload = this.parseBallotBuffer(Buffer.from(decrypted));
        if (!payload) {
          console.warn(`Skipping invalid ballot id=${ballot.ballot_id}`);
          continue;
        }

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
      count,
    }));
    console.log('Tally results:', results);

    return { results };
  }
}
