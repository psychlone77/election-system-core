import { Controller, Get } from '@nestjs/common';
import { BallotBoxServerService } from './ballot-box-server.service';

@Controller()
export class BallotBoxServerController {
  constructor(
    private readonly ballotBoxServerService: BallotBoxServerService,
  ) {}

  @Get()
  getHello(): string {
    return this.ballotBoxServerService.getHello();
  }
}
