import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DataSource, QueryRunner } from 'typeorm';
import { OrderCreatedEvent } from '../events/order-created.event';

interface ProcessedEventRow {
  '1': number;
}

@EventsHandler(OrderCreatedEvent)
export class OrderProjector implements IEventHandler<OrderCreatedEvent> {
  constructor(private readonly dataSource: DataSource) {}

  async handle(event: OrderCreatedEvent): Promise<void> {
    const { orderId, userId } = event;
    const messageId: string = orderId;

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sqlVerificacao = `SELECT 1 FROM ProcessedEvents WHERE event_id = @0`;
      const processado: ProcessedEventRow[] = await queryRunner.query(
        sqlVerificacao,
        [messageId],
      );

      if (processado && processado.length > 0) {
        await queryRunner.rollbackTransaction();
        return;
      }

      const sqlInsertPedido = `
        INSERT INTO PedidosReadModel (id, cliente_id, status, total, criado_em)
        VALUES (@0, @1, 'PENDING', 0, GETDATE())
      `;
      await queryRunner.query(sqlInsertPedido, [orderId, userId]);

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