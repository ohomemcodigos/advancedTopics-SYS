import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ProcessPaymentHandler } from './commands/process-payment.handler';
import { LoggerModule } from 'nestjs-pino'; // <-- Adicione este import!

@Module({
  imports: [
      LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { singleLine: true } }
          : undefined,
      },
    }),
    CqrsModule, 
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
  controllers: [PaymentController],
  providers: [
    PaymentService,
    ProcessPaymentHandler, // <-- Registre o handler aqui para o CQRS achá-lo!
  ],
})
export class AppModule { }