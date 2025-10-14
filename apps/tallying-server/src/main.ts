import { NestFactory } from '@nestjs/core';
import { TallyingServerModule } from './tallying-server.module';

async function bootstrap() {
  const app = await NestFactory.create(TallyingServerModule);
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
