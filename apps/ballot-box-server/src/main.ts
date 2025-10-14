import { NestFactory } from '@nestjs/core';
import { BallotBoxServerModule } from './ballot-box-server.module';

async function bootstrap() {
  const app = await NestFactory.create(BallotBoxServerModule);
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
