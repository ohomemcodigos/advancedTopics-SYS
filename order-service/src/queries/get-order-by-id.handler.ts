import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrderByIdQuery } from './get-order-by-id.query';

@QueryHandler(GetOrderByIdQuery)
export class GetOrderByIdHandler implements IQueryHandler<GetOrderByIdQuery> {
   async execute(query: GetOrderByIdQuery) {
      const sql = `
         SELECT PedidoId, Status, ValorTotal, CriadoEm 
         FROM PedidosReadModel 
         WHERE PedidoId = $1
      `;
      const parametros = [query.id];

      return null;
   }
}