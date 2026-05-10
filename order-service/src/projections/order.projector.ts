import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OrderCreatedEvent } from '../events/order-created.event';

@EventsHandler(OrderCreatedEvent)
export class OrderProjector implements IEventHandler<OrderCreatedEvent> {
   async handle(event: OrderCreatedEvent) {
      const { orderId, userId, jogosIds } = event;
      const messageId = orderId;

      const sqlVerificacao = `SELECT 1 FROM ProcessedEvents WHERE MessageId = $1`;
      const paramVerificacao = [messageId];
      
      const eventoJaProcessado = false; 

      if (eventoJaProcessado) {
         return;
      }

      const sqlInsertPedido = `
         INSERT INTO PedidosReadModel (PedidoId, UserId, Status, ValorTotal, CriadoEm)
         VALUES ($1, $2, 'PENDING', 0, NOW())
      `;
      const paramInsertPedido = [orderId, userId];

      const sqlInsertEvento = `INSERT INTO ProcessedEvents (MessageId) VALUES ($1)`;
      const paramInsertEvento = [messageId];
   }
}