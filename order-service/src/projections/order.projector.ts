import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { OrderCreatedEvent } from '../events/order-created.event';

@EventsHandler(OrderCreatedEvent)
export class OrderProjector implements IEventHandler<OrderCreatedEvent> {
  constructor(private readonly dataSource: DataSource) {}

  async handle(event: OrderCreatedEvent) {
    const { orderId, userId } = event;
    const messageId = orderId; 

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verificar idempotência (Ajustado para @0 e nome da coluna da migration)
      const sqlVerificacao = `SELECT 1 FROM ProcessedEvents WHERE event_id = @0`;
      const processado = await queryRunner.query(sqlVerificacao, [messageId]);

      if (processado.length > 0) {
        await queryRunner.rollbackTransaction();
        return; 
      }

      // 2. Inserir no Read Model (Ajustado para @0, @1 e GETDATE())
      // Use os nomes das colunas exatamente como estão na sua migration SQL
      const sqlInsertPedido = `
          INSERT INTO PedidosReadModel (id, cliente_id, status, total, criado_em)
          VALUES (@0, @1, 'PENDING', 0, GETDATE())
      `;
      await queryRunner.query(sqlInsertPedido, [orderId, userId]);

      // 3. Marcar evento como processado
      const sqlInsertEvento = `INSERT INTO ProcessedEvents (event_id, processado_em) VALUES (@0, GETDATE())`;
      await queryRunner.query(sqlInsertEvento, [messageId]);

      await queryRunner.commitTransaction();
      console.log(`Pedido ${orderId} projetado com sucesso!`);
      
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('Erro ao projetar pedido:', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}