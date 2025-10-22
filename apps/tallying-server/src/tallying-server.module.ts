import { Module } from '@nestjs/common';
import { TallyingServerController } from './tallying-server.controller';
import { TallyingServerService } from './tallying-server.service';
import { ConfigModule } from '@nestjs/config';
import {
  BallotStorage,
  Candidate,
  DatabaseModule,
  DecryptedBallot,
} from '@app/database';
import { TypeOrmModule } from '@nestjs/typeorm';

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
      entities: [BallotStorage, DecryptedBallot],
    }),
    TypeOrmModule.forFeature([BallotStorage, DecryptedBallot], 'BS'),
    TypeOrmModule.forFeature([Candidate], 'ELECTION'),
  ],
  controllers: [TallyingServerController],
  providers: [TallyingServerService],
})
export class TallyingServerModule {}
