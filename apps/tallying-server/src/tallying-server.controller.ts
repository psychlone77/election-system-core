import { Controller, Get } from '@nestjs/common';
import { TallyingServerService } from './tallying-server.service';

@Controller()
export class TallyingServerController {
  constructor(private readonly tallyingServerService: TallyingServerService) {}

  @Get()
  getHello(): string {
    return this.tallyingServerService.getHello();
  }
}
