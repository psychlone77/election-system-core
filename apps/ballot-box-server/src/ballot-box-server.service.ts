import { ServerCheck } from '@election-system-core/shared';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BallotBoxServerService {
  getCheck(): ServerCheck {
    return {
      service: 'ballot-box-server',
      status: 'running',
    };
  }
}
