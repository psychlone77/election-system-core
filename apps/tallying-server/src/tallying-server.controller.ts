import { Controller, Get } from '@nestjs/common';
import { TallyingServerService } from './tallying-server.service';
import type { ServerCheck } from '@election-system-core/shared/types';

@Controller()
export class TallyingServerController {
  constructor(private readonly tallyingServerService: TallyingServerService) {}

  @Get()
  getCheck(): ServerCheck {
    return this.tallyingServerService.getCheck();
  }

  @Get('public-key')
  getPublicKey() {
    return this.tallyingServerService.getPublicKey();
  }

  @Get('final-results')
  getFinalResults() {
    return this.tallyingServerService.getFinalResults();
  }

  @Get('decrypted-ballots')
  getDecryptedBallots() {
    return this.tallyingServerService.getDecryptedBallots();
  }

  @Get('results')
  getResults() {
    return this.tallyingServerService.startTallyingProcess();
  }
}
