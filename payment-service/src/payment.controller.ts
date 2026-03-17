import { Controller, Get, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Consultar pagamento por ID do pedido' })
  @ApiResponse({ status: 200, description: 'Dados do pagamento encontrados.' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado.' })
  findByOrder(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentByOrder(orderId);
  }
}