import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { MetricsInterceptor } from './interceptors/metrics.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(UserModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useGlobalInterceptors(new MetricsInterceptor());
  app.useGlobalInterceptors(new TimeoutInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,     
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('User Service API')
    .setDescription('API responsável pelos usuários')
    .setVersion('1.0')
    .addTag('Usuários')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);;
  app.get(Logger).log(`User Service está rodando em: http://localhost:3002/api`);
}

bootstrap();