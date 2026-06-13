import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { ListOrdersByUserQuery } from '../queries/list-orders-by-user.query';

@QueryHandler(ListOrdersByUserQuery)
export class ListOrdersByUserHandler implements IQueryHandler<ListOrdersByUserQuery> {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async execute(query: ListOrdersByUserQuery): Promise<any[]> {
    const { userId } = query;

    // CORREÇÃO: O SQL Server utiliza @0 para variáveis indexadas no TypeORM, e não $1.
    const sqlPaginado = `SELECT * FROM PedidosReadModel WHERE cliente_id = @0 ORDER BY criado_em DESC`;

    return await this.dataSource.query(sqlPaginado, [userId]);
  }
}