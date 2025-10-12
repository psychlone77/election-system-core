import { Module } from '@nestjs/common';
import { BallotBoxServerController } from './ballot-box-server.controller';
import { BallotBoxServerService } from './ballot-box-server.service';

@Module({
  imports: [],
  controllers: [BallotBoxServerController],
  providers: [BallotBoxServerService],
})
export class BallotBoxServerModule {}
