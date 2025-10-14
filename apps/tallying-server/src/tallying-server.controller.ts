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
}
