import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrderCommand } from './create-order.command';
import { Counter, Histogram } from 'prom-client'; 
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { v4 as uuid } from 'uuid';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    @InjectMetric('orders_created_total') 
    private readonly counter: Counter,
    
    @InjectMetric('gestaopedidos_pedido_criacao_duracao_segundos') 
    private readonly histogram: Histogram,
  ) {}

  async execute(command: CreateOrderCommand) {
    // 1. Inicia o cronômetro para medir a latência
    const end = this.histogram.startTimer({});
    
    try {
      const { dto } = command;
      
      // 2. Lógica de criação do pedido
      const orderId = uuid();
      
      const novoPedido = { 
        id: orderId, 
        status: 'PENDING', 
        userId: dto.userId,
        createdAt: new Date() 
      };

      // 3. Finaliza a medição de tempo
      end();

      // 4. Incrementa o contador de sucesso com label 'Criado'
      this.counter.inc({ status: 'Criado' });

      return novoPedido;

    } catch (error) {
      // Farejador | Incrementa um contador para cada erro
      this.counter.inc({ status: 'Erro' });
      throw error;
    }
  }
}