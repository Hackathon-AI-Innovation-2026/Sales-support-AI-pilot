import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/filters';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.use(cookieParser());

  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  const corsOrigins = configService.get<string[]>('CORS_ORIGIN');
  app.enableCors({
    credentials: true,
    origin: corsOrigins,
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(new LoggingInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = configService.get<number>('PORT')!;
  await app.listen(port);
  logger.log(`Backend API running on http://localhost:${port}/${globalPrefix}`);
}
void bootstrap();
