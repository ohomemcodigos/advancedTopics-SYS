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
    .setTitle('Pagamentos')
    .setDescription('API responsável pelos pagamentos')
    .setVersion('1.0')
    .addTag('Pagamentos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log(`Payment Service está rodando em: http://localhost:3000/api`);
}

bootstrap();