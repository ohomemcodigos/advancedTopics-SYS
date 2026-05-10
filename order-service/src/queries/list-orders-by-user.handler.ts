import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListOrdersByUserQuery } from './list-orders-by-user.query';

@QueryHandler(ListOrdersByUserQuery)
export class ListOrdersByUserHandler implements IQueryHandler<ListOrdersByUserQuery> {
   async execute(query: ListOrdersByUserQuery) {
      const offset = (query.pagina - 1) * query.tamanho;
      
      const sqlPaginado = `
         SELECT PedidoId, Status, ValorTotal, CriadoEm 
         FROM PedidosReadModel 
         WHERE UserId = $1 
         ORDER BY CriadoEm DESC 
         OFFSET $2 LIMIT $3
      `;
      const parametros = [query.userId, offset, query.tamanho];

      return [];
   }
}