import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';
import { MetricsInterceptor } from './interceptors/metrics.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useGlobalInterceptors(new MetricsInterceptor());
  app.useGlobalInterceptors(new TimeoutInterceptor());
  app.enableCors({ origin: '*', credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,     
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Catalog Service API')
    .setDescription('API responsável pelo catálogo de jogos')
    .setVersion('1.0')
    .addTag('Jogos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001); 
  
  app.get(Logger).log(`Catalog Service está rodando em: http://localhost:3001/api`);
}

bootstrap();