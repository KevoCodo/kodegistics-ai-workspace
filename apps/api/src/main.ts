import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number.parseInt(process.env.PORT ?? '3001', 10);
  await app.listen(Number.isFinite(port) ? port : 3001, '0.0.0.0');
}
bootstrap();
