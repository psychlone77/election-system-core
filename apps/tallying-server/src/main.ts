import { NestFactory } from '@nestjs/core';
import { TallyingServerModule } from './tallying-server.module';
import { ensureThresholdKeys } from '@app/crypto/threshold';

async function bootstrap() {
  ensureThresholdKeys('tallying-server', process.env.SECRET_FOLDER_PATH, 5, 3);
  const app = await NestFactory.create(TallyingServerModule);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
