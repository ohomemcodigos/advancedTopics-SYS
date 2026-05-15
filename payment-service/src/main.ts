import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,     
    }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://rabbitmq:5672'], // Se estiver usando Docker, talvez seja amqp://rabbitmq:5672
      queue: 'order_queue', // A fila que o order-service está usando
      queueOptions: {
        durable: true,
      },
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Pagamentos')
    .setDescription('API responsável pelos pagamentos')
    .setVersion('1.0')
    .addTag('Pagamentos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();

  await app.listen(3000);
  console.log(`Payment Service está rodando em: http://localhost:3000/api`);
}

bootstrap();