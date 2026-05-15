import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrderGateway } from './gateways/order.gateway';
import { CommandBus } from '@nestjs/cqrs';

@Controller()
export class OrderEventsController {
  constructor(
    private readonly orderGateway: OrderGateway,
    private readonly commandBus: CommandBus // Opcional, caso queira disparar um Command para atualizar o BD
  ) {}

  // Este é o SEU "PedidoStatusAlteradoConsumer"
  // Ele escuta exatamente o evento que o process-payment.handler.ts emitiu
  @EventPattern('pedido_status_alterado')
  async handlePaymentProcessed(@Payload() data: any) {
    console.log(`[RabbitMQ Consumer] Atualização recebida para o pedido: ${data.pedidoId}. Status Pagamento: ${data.status}`);

    // Mapeia o status do pagamento para o status do pedido
    const novoStatusPedido = data.status === 'APROVADO' ? 'CONFIRMADO' : 'CANCELADO';

    // 1. Notifica o frontend em TEMPO REAL (Requisito da Aula 10)
    this.orderGateway.notificarStatusAlterado(data.pedidoId, {
      pedidoId: data.pedidoId,
      statusAnterior: 'PENDING', // O ideal é buscar do banco, simplificado aqui
      novoStatus: novoStatusPedido,
      observacao: 'Atualizado via RabbitMQ e WebSockets com sucesso!',
      alteradoEm: data.processadoEm
    });

    // 2. (Recomendado) Disparar um Command interno para atualizar o seu banco de leitura/escrita
    // this.commandBus.execute(new UpdateOrderStatusCommand(data.pedidoId, novoStatusPedido));
  }
}