import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrderGateway } from './gateways/order.gateway';

@Controller()
export class OrderEventsController {
  constructor(private readonly orderGateway: OrderGateway) { }

  @EventPattern('payment_processed')
  async handlePaymentProcessed(@Payload() data: any) {
    console.log(`[RabbitMQ] Pagamento recebido para pedido: ${data.pedidoId} — status: ${data.status}`);

    const novoStatus = data.status === 'APROVADO' ? 'CONFIRMADO' : 'CANCELADO';

    this.orderGateway.notificarStatusAlterado(data.pedidoId, {
      pedidoId: data.pedidoId,
      novoStatus,
      alteradoEm: data.processadoEm,
    });
  }
}