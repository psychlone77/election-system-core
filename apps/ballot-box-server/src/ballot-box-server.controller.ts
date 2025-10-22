import { Body, Controller, Get, Post } from '@nestjs/common';
import { BallotBoxServerService } from './ballot-box-server.service';
import type {
  ServerCheck,
  SubmitBallotDto,
} from '@election-system-core/shared';

@Controller()
export class BallotBoxServerController {
  constructor(
    private readonly ballotBoxServerService: BallotBoxServerService,
  ) {}

  @Get()
  getCheck(): ServerCheck {
    return this.ballotBoxServerService.getCheck();
  }

  @Get('public-key')
  async getPublicKey() {
    return this.ballotBoxServerService.getPublicKey();
  }

  @Get('ballots')
  async getBallots() {
    return this.ballotBoxServerService.getBallots();
  }

  @Post('submit-ballot')
  async submitBallot(
    @Body()
    body: SubmitBallotDto,
  ) {
    return this.ballotBoxServerService.submitBallot(body);
  }
}
