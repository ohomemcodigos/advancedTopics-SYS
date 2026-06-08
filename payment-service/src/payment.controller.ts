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

  // 1. Escuta o padrão antigo/preso na fila
  @EventPattern('order_created')
  async handleOrderCreatedPattern(@Payload() data: any) {
    this.logger.log('📥 EVENTO CAPTURADO (order_created)');
    await this.processPaymentEvent(data);
  }

  // 2. Escuta o novo padrão que configuramos hoje
  @EventPattern('PedidoCriado')
  async handlePedidoCriadoPattern(@Payload() data: any) {
    this.logger.log('📥 EVENTO CAPTURADO (PedidoCriado)');
    await this.processPaymentEvent(data);
  }

  // Lógica unificada para não repetir código
  private async processPaymentEvent(data: any) {
    this.logger.log('📦 Dados recebidos: ' + JSON.stringify(data));
    try {
      // Garante que o ID e o valor são capturados, independentemente do formato do payload
      const pedidoId = data.pedidoId || data.id || 'ID_DESCONHECIDO';
      const valor = data.valor || 49.9;
      
      await this.commandBus.execute(new ProcessPaymentCommand(pedidoId, valor));
      this.logger.log('✅ Pagamento processado com sucesso via RabbitMQ!');
    } catch (e) {
      this.logger.error('❌ Erro no processamento do evento: ' + (e instanceof Error ? e.message : e));
    }
  }
}