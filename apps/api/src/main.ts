import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';

  const app = await NestFactory.create(AppModule);

  app.use((req, res, next) => {
    const originHeader = req.headers.origin;

    const methods = 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
    const headers = 'Content-Type';

    if (!isProd) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', methods);
      res.setHeader('Access-Control-Allow-Headers', headers);
      if (req.method === 'OPTIONS') return res.status(204).end();
      return next();
    }

    if (
      typeof originHeader === 'string' &&
      (/^http:\/\/localhost:\d+$/.test(originHeader) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(originHeader) ||
        /^http:\/\/172\.31\.\d{1,3}\.\d{1,3}:\d+$/.test(originHeader))
    ) {
      res.setHeader('Access-Control-Allow-Origin', originHeader);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', methods);
      res.setHeader('Access-Control-Allow-Headers', headers);
      if (req.method === 'OPTIONS') return res.status(204).end();
    }

    return next();
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const port = Number.parseInt(process.env.PORT ?? '3001', 10);
  await app.listen(Number.isFinite(port) ? port : 3001, '0.0.0.0');
}
bootstrap();
