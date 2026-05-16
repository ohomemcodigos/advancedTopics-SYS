import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt'; // <-- Importação do JWT adicionada
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderEventsController } from './order-events.controller';
import { OrderGateway } from './gateways/order.gateway';
import { CreateOrderHandler } from './commands/create-order.handler';

@Module({
  imports: [
    CqrsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'senha_doida_uaulegauuuu_567364537@#@',
      signOptions: { expiresIn: '1d' },
    }),
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'order_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [OrderController, OrderEventsController],
  providers: [
    OrderService,
    OrderGateway,
    CreateOrderHandler,
  ],
})
export class AppModule { }