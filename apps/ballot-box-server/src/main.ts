import { NestFactory } from '@nestjs/core';
import { BallotBoxServerModule } from './ballot-box-server.module';
import { keystore } from '@app/crypto';
import axios, { AxiosResponse } from 'axios';

async function loadPublicKeys() {
  let attempts = 0;
  const maxAttempts = 3;
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
  let esKey: AxiosResponse<string, any> | null = null;
  while (attempts < maxAttempts) {
    try {
      esKey = await axios.get<string>(
        process.env.ELIGIBILITY_SERVER_URL + '/public-key',
      );
      break;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) throw error;
      await delay(5000);
    }
  }
  if (esKey) {
    console.log('Loaded public key from eligibility server.', esKey.data);
    process.env.ES_PUBLIC_PEM = esKey.data;
  } else {
    throw new Error('Failed to load public key from eligibility server.');
  }
}

async function bootstrap() {
  await keystore.ensureServerKeys('ballot-box-server');
  await loadPublicKeys();
  const app = await NestFactory.create(BallotBoxServerModule);
  app.enableCors();
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
