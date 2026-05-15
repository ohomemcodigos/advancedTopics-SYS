import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);

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

  await app.listen(3000);
  console.log(`User Service está rodando em: http://localhost:3000/api`);
}

bootstrap();