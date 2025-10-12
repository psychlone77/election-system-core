import { Injectable } from '@nestjs/common';

@Injectable()
export class TallyingServerService {
  getHello(): string {
    return 'Hello World!';
  }
}
