import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrderCommand } from './create-order.command';
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { v4 as uuid } from 'uuid';
import { Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

interface CreatedOrder {
  id: string;
  status: string;
  userId: string;
  createdAt: Date;
}

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  private readonly logger = new Logger(CreateOrderHandler.name);

  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
    
    @InjectMetric('orders_created_total')
    private readonly counter: Counter<string>,

    @InjectMetric('gestaopedidos_pedido_criacao_duracao_segundos')
    private readonly histogram: Histogram<string>,
  ) {}

  async execute(command: CreateOrderCommand): Promise<CreatedOrder> {
    const end = this.histogram.startTimer({});

    try {
      const { dto } = command;
      const orderId = uuid();

      const novoPedido: CreatedOrder = {
        id: orderId,
        status: 'PENDING',
        userId: dto.userId,
        createdAt: new Date(),
      };

      const quantidadeItens = dto.jogosIds ? dto.jogosIds.length : 1;
      const valorTotal = +(quantidadeItens * 49.9).toFixed(2);

      this.logger.log(`📢 Preparando evento PedidoCriado para o RabbitMQ (Pedido: ${orderId})`);
      
      // A CORREÇÃO: O .subscribe() é o gatilho que força o NestJS a disparar a mensagem!
      this.rabbitClient.emit('PedidoCriado', {
        pedidoId: orderId,
        valor: valorTotal,
        metodoPagamento: dto.metodoPagamento || 'PIX',
      }).subscribe({
        next: () => this.logger.log('✅ Gatilho acionado: Mensagem enviada para a fila!'),
        error: (err) => this.logger.error(`Erro ao enviar para a fila: ${err.message}`)
      });

      end();
      this.counter.inc({ status: 'Criado' });

      return novoPedido;
    } catch (error) {
      this.counter.inc({ status: 'Erro' });
      this.logger.error(`Erro ao criar pedido: ${error instanceof Error ? error.message : error}`);
      throw error;
    }
  }
}