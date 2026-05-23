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
      // 1. Executa a regra de negócio e guarda a entidade gerada
      const resultado = this.paymentService.processPayment(
        command.pedidoId,
        command.valor,
        'PIX',
      );

      // Se a sua entidade Pagamento tiver uma propriedade de status, 
      // você usaria `resultado.status` aqui. Como não vi no modelo, deixei 'APROVADO'.
      const statusPagamento = 'APROVADO'; 

      // 2. Avisa o RabbitMQ enviando os dados REAIS do objeto 'resultado'
      this.client.emit('payment_processed', {
        pedidoId: command.pedidoId,
        pagamentoId: resultado.pagamentoId, // <-- VARIÁVEL SENDO ÚTIL AQUI! (Pode ser resultado.idPagamento dependendo da sua entidade)
        status: statusPagamento,
        processadoEm: new Date().toISOString()
      });

      console.log(`✅ Pagamento (${resultado.pagamentoId}) processado com status ${statusPagamento} e publicado na fila!`);

    } catch (error) {
      console.error(`❌ Erro ao processar pagamento do pedido ${command.pedidoId}`, error);
      
      this.client.emit('payment_failed', {
        pedidoId: command.pedidoId,
        motivo: 'Erro interno durante o processamento'
      });
    }
  }
}