import { Controller, Get, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { ProcessPaymentCommand } from './commands/process-payment.command'; // <-- Import adicionado

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Consultar pagamento por ID do pedido' })
  @ApiResponse({ status: 200, description: 'Dados do pagamento encontrados.' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
  findByOrder(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentByOrder(orderId);
  }

  @EventPattern('order_created') 
  async handleOrderCreated(@Payload() data: any) {
    console.log('📦 Evento recebido via RabbitMQ no Payment Service:', data);
    return this.commandBus.execute(
      new ProcessPaymentCommand(data.pedidoId, data.valor),
    );
  }
} 