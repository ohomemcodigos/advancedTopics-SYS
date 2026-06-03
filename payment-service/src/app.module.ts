import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ProcessPaymentHandler } from './commands/process-payment.handler';
import { LoggerModule } from 'nestjs-pino';

// 1. Importações do Health Check
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';

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
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
    CqrsModule,
    TerminusModule, // 2. Registre o módulo do Terminus aqui
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'payment_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [
    PaymentController,
    HealthController, // 3. Registre o seu novo controlador aqui
  ],
  providers: [
    PaymentService,
    ProcessPaymentHandler,
    makeCounterProvider({
      name: 'payments_processed_total',
      help: 'Total de pagamentos processados',
      labelNames: ['status'],
    }),
  ],
})
export class AppModule {}
