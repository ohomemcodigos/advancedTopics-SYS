import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { ListOrdersByUserQuery } from '../queries/list-orders-by-user.query';

@QueryHandler(ListOrdersByUserQuery)
export class ListOrdersByUserHandler implements IQueryHandler<ListOrdersByUserQuery> {
  
  constructor(private readonly dataSource: DataSource) {}

  async execute(query: ListOrdersByUserQuery) {
    const { userId } = query;

    // Use a variável sqlPaginado que já está no seu arquivo
    const sqlPaginado = `SELECT * FROM PedidosReadModel WHERE cliente_id = $1 ORDER BY criado_em DESC`;

    // Executa e retorna a lista
    return await this.dataSource.query(sqlPaginado, [userId]);
  }
}