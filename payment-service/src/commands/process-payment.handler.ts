/* eslint-disable */
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ProcessPaymentCommand } from './process-payment.command';
import { PaymentService } from '../payment.service';

@CommandHandler(ProcessPaymentCommand)
export class ProcessPaymentHandler implements ICommandHandler<ProcessPaymentCommand> {
  constructor(
    private readonly paymentService: PaymentService,
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  async execute(command: ProcessPaymentCommand): Promise<void> {
    console.log(`💸 Processando pagamento do pedido: ${command.pedidoId}`);

    try {
      const resultado = await this.paymentService.processPayment(
        command.pedidoId,
        command.valor,
        'PIX',
      );

      const statusPagamento = 'APROVADO';

      this.client.emit('payment_processed', {
        pedidoId: command.pedidoId,
        pagamentoId: resultado.pagamentoId,
        status: statusPagamento,
        processadoEm: new Date().toISOString(),
      });

      console.log(
        `✅ Pagamento (${resultado.pagamentoId}) processado com status ${statusPagamento} e publicado na fila!`,
      );
    } catch (error) {
      console.error(
        `❌ Erro ao processar pagamento do pedido ${command.pedidoId}`,
        error,
      );

      this.client.emit('payment_failed', {
        pedidoId: command.pedidoId,
        motivo: 'Erro interno durante o processamento',
      });
    }
  }
}
