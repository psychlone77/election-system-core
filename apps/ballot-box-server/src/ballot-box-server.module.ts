import { Module } from '@nestjs/common';
import { BallotBoxServerController } from './ballot-box-server.controller';
import { BallotBoxServerService } from './ballot-box-server.service';
import { DatabaseModule } from '@app/database';
import { SpentTokens } from '@app/database/entities/spent-tokens';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BallotStorage } from '@app/database/entities/ballot-storage';
import { PublicBallot } from '@app/database/entities/public-ballots';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './apps/ballot-box-server/.env',
      isGlobal: true,
    }),
    DatabaseModule.forRoot({
      prefix: 'ELECTION',
      entities: [SpentTokens],
    }),
    DatabaseModule.forRoot({
      prefix: 'BS',
      entities: [BallotStorage, PublicBallot],
    }),
    TypeOrmModule.forFeature([SpentTokens], 'ELECTION'),
    TypeOrmModule.forFeature([BallotStorage, PublicBallot], 'BS'),
  ],
  controllers: [BallotBoxServerController],
  providers: [BallotBoxServerService],
})
export class BallotBoxServerModule {}
