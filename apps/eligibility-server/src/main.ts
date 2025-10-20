import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { keystore } from '@app/crypto';

async function bootstrap() {
  await keystore.ensureServerKeys('eligibility-server');

  const app = await NestFactory.create(AppModule);

  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
