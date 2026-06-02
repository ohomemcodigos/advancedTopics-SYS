import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrderCommand } from './create-order.command';
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { v4 as uuid } from 'uuid';

interface CreatedOrder {
  id: string;
  status: string;
  userId: string;
  createdAt: Date;
}

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    @InjectMetric('orders_created_total')
    private readonly counter: Counter<string>,

    @InjectMetric('gestaopedidos_pedido_criacao_duracao_segundos')
    private readonly histogram: Histogram<string>,
  ) {}

  execute(command: CreateOrderCommand): CreatedOrder {
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

      end();

      this.counter.inc({ status: 'Criado' });

      return novoPedido;
    } catch (error) {
      this.counter.inc({ status: 'Erro' });
      throw error;
    }
  }
}
