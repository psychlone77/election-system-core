import { Injectable } from '@nestjs/common';

@Injectable()
export class BallotBoxServerService {
  getHello(): string {
    return 'Hello World!';
  }
}
