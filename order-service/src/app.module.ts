// order-service/src/app.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderEventsController } from './order-events.controller';
import { OrderGateway } from './gateways/order.gateway';
import { CreateOrderHandler } from './commands/create-order.handler';
import { LoggerModule } from 'nestjs-pino';
import { HealthModule } from './health/health.module';
import { PrometheusModule, makeCounterProvider } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register(),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { singleLine: true } }
          : undefined,
      },
    }),
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
          urls: ['amqp://localhost:5672'],
          queue: 'order_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
    HealthModule,
  ],
  controllers: [OrderController, OrderEventsController],
  providers: [
    OrderService,
    OrderGateway,
    CreateOrderHandler,
    makeCounterProvider({
      name: 'orders_created_total',
      help: 'Total de pedidos criados',
    }),
    makeCounterProvider({
      name: 'orders_cancelled_total',
      help: 'Total de pedidos abandonados/cancelados',
    }),
  ],
})
export class AppModule { }