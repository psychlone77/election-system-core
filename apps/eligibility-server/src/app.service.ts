import { ServerCheck } from '@election-system-core/shared/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getCheck(): ServerCheck {
    return {
      service: 'eligibility-server',
      status: 'running',
    };
  }
}
