import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderEventsController } from './order-events.controller';
import { OrderGateway } from './gateways/order.gateway';
import { CreateOrderHandler } from './commands/create-order.handler';
import { ListOrdersByUserHandler } from './queries/list-orders-by-user.handler';
import { GetOrderByIdHandler } from './queries/get-order-by-id.handler';
import { OrderProjector } from './projections/order.projector';
import { LoggerModule } from 'nestjs-pino';
import { HealthModule } from './health/health.module';
import { PrometheusModule, makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register(),
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) => req.headers['x-correlation-id'] || req.id,
        customProps: (req) => ({
          correlationId: req.headers['x-correlation-id'],
          environment: process.env.NODE_ENV,
        }),
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { singleLine: true } }
          : undefined,
      },
    }),
    CqrsModule,
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'sqlserver',
      port: 1433,
      username: 'sa',
      password: process.env.DB_PASSWORD || 'MasterKey@123!',
      database: 'order_db',
      autoLoadEntities: true,
      synchronize: false,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
      connectionTimeout: 30000,
    }),
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
    HealthModule,
  ],
  controllers: [OrderController, OrderEventsController],
  providers: [
    OrderService,
    OrderGateway,
    CreateOrderHandler,
    ListOrdersByUserHandler,
    GetOrderByIdHandler,
    OrderProjector,
    makeCounterProvider({
      name: 'orders_created_total',
      help: 'Total de pedidos criados',
      labelNames: ['status'],
    }),
    makeHistogramProvider({
      name: 'gestaopedidos_pedido_criacao_duracao_segundos',
      help: 'Duração do fluxo de criação de pedido',
      buckets: [0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
    }),
    makeCounterProvider({
      name: 'orders_cancelled_total',
      help: 'Total de pedidos abandonados/cancelados',
    }),
  ],
})
export class AppModule { }
