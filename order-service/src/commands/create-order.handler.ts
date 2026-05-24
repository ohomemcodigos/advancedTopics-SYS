// order-service/src/commands/create-order.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrderCommand } from './create-order.command';
import { Inject } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client'; 
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { v4 as uuid } from 'uuid'; // Import necessário para gerar IDs

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    @InjectMetric('gestaopedidos_pedidos_criados_total') 
    private readonly counter: Counter<string>,
    @InjectMetric('gestaopedidos_pedido_criacao_duracao_segundos') 
    private readonly histogram: Histogram<string>,
  ) {}

  async execute(command: CreateOrderCommand) {
    // 1. Inicia o cronômetro para medir a latência
    const end = this.histogram.startTimer();
    
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
      // Varejador de erros | Incrementa um contador para cada erro
      this.counter.inc({ status: 'Erro' });
      throw error;
    }
  }
}