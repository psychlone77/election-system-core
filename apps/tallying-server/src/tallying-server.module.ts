import { Module } from '@nestjs/common';
import { TallyingServerController } from './tallying-server.controller';
import { TallyingServerService } from './tallying-server.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { BallotStorage } from '@app/database/entities/ballot-storage';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from '@app/database/entities/candidates';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './apps/tallying-server/.env',
      isGlobal: true,
    }),
    DatabaseModule.forRoot({
      prefix: 'ELECTION',
      entities: [Candidate],
    }),
    DatabaseModule.forRoot({
      prefix: 'BS',
      entities: [BallotStorage],
    }),
    TypeOrmModule.forFeature([BallotStorage]),
  ],
  controllers: [TallyingServerController],
  providers: [TallyingServerService],
})
export class TallyingServerModule {}
