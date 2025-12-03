import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const isProd =
    process.env.NODE_ENV === 'production';

  // Ensure logs directory exists for file transport
  const logsDir = join(process.cwd(), 'logs');
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true });
  }

  // Configure Winston logger with sensible defaults per environment
  const consoleFormat = isProd
    ? winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      )
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(
          ({
            timestamp,
            level,
            message,
            ...meta
          }) => {
            const rest = Object.keys(meta).length
              ? ` ${JSON.stringify(meta)}`
              : '';
            return `[${timestamp}] ${level}: ${message}${rest}`;
          },
        ),
      );

  const logger = WinstonModule.createLogger({
    level:
      process.env.LOG_LEVEL ??
      (isProd ? 'info' : 'debug'),
    exitOnError: false,
    transports: [
      new winston.transports.Console({
        level:
          process.env.CONSOLE_LOG_LEVEL ??
          (isProd ? 'info' : 'debug'),
        format: consoleFormat,
        handleExceptions: true,
      }),
      new winston.transports.File({
        filename: join(logsDir, 'app.log'),
        level:
          process.env.FILE_LOG_LEVEL ?? 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
        handleExceptions: true,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
      }),
    ],
  });

  const app = await NestFactory.create(
    AppModule,
    { logger },
  );

  // API base and versioning now using v1
  app.setGlobalPrefix(
    process.env.API_PREFIX ?? 'api',
  );
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(
          (s) => s.trim(),
        )
      : true,
    credentials: true,
    methods:
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    exposedHeaders:
      'Content-Length, Content-Type',
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: !isProd,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: true,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 3000);
  const host =
    process.env.HOST ??
    (isProd ? '0.0.0.0' : '127.0.0.1');
  await app.listen(port, host);
}
bootstrap();
