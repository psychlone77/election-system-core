import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { keystore } from '@app/crypto';

async function bootstrap() {
  const { publicPemPath, privatePemPath } =
    await keystore.ensureServerKeys('eligibility-server');

  process.env.ES_PUBLIC_PEM = publicPemPath;
  process.env.ES_PRIVATE_PEM = privatePemPath;

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
