import { Controller, Get, Param, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { ProcessPaymentCommand } from './commands/process-payment.command';

@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly commandBus: CommandBus
  ) {}

  @Get('order/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentByOrder(orderId);
  }

  @EventPattern('PedidoCriado')
  async handleOrderCreated(@Payload() data: any) {
    this.logger.log('📥 EVENTO RECEBIDO NO PAGAMENTO: ' + JSON.stringify(data));
    try {
      await this.commandBus.execute(new ProcessPaymentCommand(data.pedidoId, data.valor));
      this.logger.log('✅ Pagamento processado com sucesso!');
    } catch (e) {
      this.logger.error('❌ Erro no processamento: ' + (e instanceof Error ? e.message : e));
    }
  }
}