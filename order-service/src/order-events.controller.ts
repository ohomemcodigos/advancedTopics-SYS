import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';

@Controller()
export class OrderEventsController {
  private readonly logger = new Logger(OrderEventsController.name);

  constructor(private readonly orderService: OrderService) {}

  @EventPattern('PagamentoAprovado')
  async handlePagamentoAprovado(@Payload() data: { pedidoId: string }): Promise<void> {
    this.logger.log(`[RabbitMQ] Pagamento Aprovado recebido para o pedido: ${data.pedidoId}`);
    
    await this.orderService.confirmOrder(data.pedidoId);
  }
}