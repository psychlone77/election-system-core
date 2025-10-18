import { Body, Controller, Get, Post } from '@nestjs/common';
import { BallotBoxServerService } from './ballot-box-server.service';
import type { ServerCheck } from '@election-system-core/shared';

@Controller()
export class BallotBoxServerController {
  constructor(
    private readonly ballotBoxServerService: BallotBoxServerService,
  ) {}

  @Get()
  getCheck(): ServerCheck {
    return this.ballotBoxServerService.getCheck();
  }

  @Post('submit-ballot')
  async submitBallot(
    @Body() body: { token: string; token_signature: string; ballot: string },
  ) {
    return this.ballotBoxServerService.submitBallot(body);
  }
}
