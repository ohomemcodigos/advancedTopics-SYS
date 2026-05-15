import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { RedisIoAdapter } from './gateways/redis.adapter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices'; // <-- Imports necessários

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Pedidos')
    .setDescription('API para gestão de pedidos')
    .setVersion('1.0')
    .addTag('Orders')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  // 1. Configuração do WebSocket (SignalR equivalente) com Redis Backplane
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  // 2. NOVO: Configuração do RabbitMQ (MassTransit equivalente)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://rabbitmq:5672'], // URL do RabbitMQ
      queue: 'pedidos_queue', // Nome da fila (certifique-se que o payment manda pra cá)
      queueOptions: {
        durable: true,
      },
    },
  });

  // 3. Inicializa tudo: fila do RabbitMQ e a API na porta 3000
  await app.startAllMicroservices();
  await app.listen(3000);
  
  console.log(`Application is running on: ${await app.getUrl()}/api`);
  console.log(`Microservice (RabbitMQ) is listening...`);
}
bootstrap();