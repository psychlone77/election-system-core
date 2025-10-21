import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { Admin, Candidate, DatabaseModule, RegisteredVoters } from '@app/database';
import { EligibleVoter } from '@app/database/entities/eligible-voters';
import { TypeOrmModule } from '@nestjs/typeorm';

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
      entities: [RegisteredVoters, Candidate, Admin],
    }), // will read ELECTION_DB_* env vars
    TypeOrmModule.forFeature([EligibleVoter], 'ELIG'),
    TypeOrmModule.forFeature([RegisteredVoters, Candidate, Admin], 'ELECTION'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
