import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ProcessPaymentHandler } from './commands/process-payment.handler';
import { LoggerModule } from 'nestjs-pino';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';
import { PrometheusModule, makeCounterProvider } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register(),
    LoggerModule.forRoot({ pinoHttp: { transport: { target: 'pino-pretty' } } }),
    CqrsModule,
    TerminusModule,
    ClientsModule.register([
      {
        name: 'RABBITMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'], 
          queue: 'order_queue',           
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  // Note que AppController foi removido da lista abaixo
  controllers: [PaymentController, HealthController],
  // Note que AppService foi removido da lista abaixo
  providers: [
    PaymentService,
    ProcessPaymentHandler,
    makeCounterProvider({ 
      name: 'payments_processed_total', 
      help: 'Total de pagamentos processados', 
      labelNames: ['status'] 
    }),
  ],
})
export class AppModule {}