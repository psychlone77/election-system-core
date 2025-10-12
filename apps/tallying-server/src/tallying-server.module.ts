import { Module } from '@nestjs/common';
import { TallyingServerController } from './tallying-server.controller';
import { TallyingServerService } from './tallying-server.service';

@Module({
  imports: [],
  controllers: [TallyingServerController],
  providers: [TallyingServerService],
})
export class TallyingServerModule {}
