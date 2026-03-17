import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(3000);
  console.log(`Catalog Service está rodando em: http://localhost:3000/api`);
}

bootstrap();