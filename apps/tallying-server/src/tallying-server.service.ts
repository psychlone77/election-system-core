import { ServerCheck } from '@election-system-core/shared/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TallyingServerService {
  getCheck(): ServerCheck {
    return {
      service: 'tallying-server',
      status: 'running',
    };
  }
}
