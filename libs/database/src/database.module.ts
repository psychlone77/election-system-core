import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EntitySchema, MixedList } from 'typeorm';

@Module({})
export class DatabaseModule {
  // prefix: e.g. 'ELIG' -> env keys ELIG_DB_HOST etc.
  /**
   * Configures and returns a dynamic NestJS module for database connectivity using TypeORM.
   *
   * @param prefix Optional string to prefix environment variable keys (e.g., 'APP1' for 'APP1_DB_HOST').
   *
   * @returns A dynamic module configured for PostgreSQL database access.
   *
   * @example
   * // Use default environment variable keys (no prefix)
   * DatabaseModule.forRoot();
   *
   * @example
   * // Use a prefix for environment variable keys
   * // Will look for 'APP1_DB_HOST', 'APP1_DB_PORT', etc.
   * DatabaseModule.forRoot('APP1');
   */
  static forRoot({
    prefix = '',
    entities = [],
  }: {
    prefix?: string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    entities?: MixedList<Function | string | EntitySchema>;
  } = {}): DynamicModule {
    const key = (k: string) => (prefix ? `${prefix}_${k}` : k);

    return {
      module: DatabaseModule,
      imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
          name: prefix || 'default',
          imports: [ConfigModule],
          useFactory: (config: ConfigService) => ({
            type: 'postgres',
            host: config.get(`${key('DB_HOST')}`) ?? 'localhost',
            port: Number(config.get(`${key('DB_PORT')}`)) || 5432,
            username: config.get(`${key('DB_USER')}`) ?? 'postgres',
            password: config.get(`${key('DB_PASS')}`) ?? '',
            database: config.get(`${key('DB_NAME')}`) ?? 'postgres',
            schema: config.get(`${key('DB_SCHEMA')}`) ?? 'public',
            entities: entities,
            synchronize: false, // avoid in prod
            migrationsTableName: 'migrations',
          }),
          inject: [ConfigService],
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}
