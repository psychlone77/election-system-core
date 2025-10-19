import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/database';
import { EligibleVoter } from '@app/database/entities/eligible-voters';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegisteredVoters } from '@app/database/entities/registered-voters';
import { IssuedToken } from '@app/database/entities/issued-tokens';
import { Candidate } from '@app/database/entities/candidates';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './apps/eligibility-server/.env',
      isGlobal: true,
    }),
    DatabaseModule.forRoot({
      prefix: 'ELIG',
      entities: [EligibleVoter],
    }), // will read ELIG_DB_* env vars
    DatabaseModule.forRoot({
      prefix: 'ELECTION',
      entities: [RegisteredVoters, IssuedToken, Candidate],
    }), // will read ELECTION_DB_* env vars
    TypeOrmModule.forFeature([EligibleVoter, RegisteredVoters, IssuedToken]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
