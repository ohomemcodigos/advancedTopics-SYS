import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrderGateway } from './gateways/order.gateway';

interface PaymentProcessedData {
  pedidoId: string;
  status: string;
  processadoEm: string;
}

@Controller()
export class OrderEventsController {
  constructor(private readonly orderGateway: OrderGateway) {}

  @EventPattern('payment_processed')
  async handlePaymentProcessed(
    @Payload() data: PaymentProcessedData,
  ): Promise<void> {
    console.log(
      `[RabbitMQ] Pagamento recebido para pedido: ${data.pedidoId} — status: ${data.status}`,
    );

    const novoStatus: string =
      data.status === 'APROVADO' ? 'CONFIRMADO' : 'CANCELADO';

    await this.orderGateway.notificarStatusAlterado(data.pedidoId, {
      pedidoId: data.pedidoId,
      novoStatus,
      alteradoEm: new Date(data.processadoEm),
    });
  }
}