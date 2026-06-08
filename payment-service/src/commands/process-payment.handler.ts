import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProcessPaymentCommand } from './process-payment.command';
import { PaymentService } from '../payment.service';
import { Logger } from '@nestjs/common';

@CommandHandler(ProcessPaymentCommand)
export class ProcessPaymentHandler implements ICommandHandler<ProcessPaymentCommand> {
  private readonly logger = new Logger(ProcessPaymentHandler.name);

  constructor(private readonly paymentService: PaymentService) {}

  async execute(command: ProcessPaymentCommand): Promise<any> {
    // Extraímos 'pedidoId' em vez de 'orderId' para respeitar a estrutura do Command
    const { pedidoId, valor } = command as any; 
    
    this.logger.log(`Executando comando de pagamento para pedido: ${pedidoId} no valor de R$ ${valor}`);

    // O PaymentService espera um orderId, então passamos o pedidoId aqui
    const resultado = this.paymentService.processPayment(pedidoId, valor);

    this.logger.log(
      `✅ Pagamento processado com sucesso! Status: ${resultado.status}`
    );

    return resultado;
  }
}