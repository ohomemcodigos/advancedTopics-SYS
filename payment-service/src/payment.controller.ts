import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);
  private client: ClientProxy;

  constructor(private readonly paymentService: PaymentService) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'], 
        queue: 'order_queue',
        queueOptions: { durable: true },
      },
    });
  }

  @EventPattern('PedidoCriado')
  async handlePedidoCriado(@Payload() data: any) {
    this.logger.log(`Recebido no RabbitMQ: Pedido [${data.pedidoId}]`);
    
    // Processa a regra de negócio real
    this.paymentService.processPayment(data.pedidoId, data.valor);

    // Emite o evento de volta informando que foi aprovado
    this.logger.log(`Enviando evento de PagamentoAprovado para a fila...`);
    this.client.emit('PagamentoAprovado', { pedidoId: data.pedidoId });
  }
}