import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { ServerCheck } from '@election-system-core/shared/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getCheck(): ServerCheck {
    return this.appService.getCheck();
  }
}
