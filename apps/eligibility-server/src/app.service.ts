import { EligibleVoter } from '@app/database/entities/eligible-voters';
import { ServerCheck } from '@election-system-core/shared/types';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(EligibleVoter)
    private eligibleVoterRepository: Repository<EligibleVoter>,
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
}
