import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { GetOrderByIdQuery } from '../queries/get-order-by-id.query';

@QueryHandler(GetOrderByIdQuery)
export class GetOrderByIdHandler implements IQueryHandler<GetOrderByIdQuery> {
  
  // 1. Injeção do DataSource no construtor
  constructor(private readonly dataSource: DataSource) {}

  async execute(query: GetOrderByIdQuery) {
    const { id } = query;

    // A string SQL que você já tem pronta (exemplo):
    const sql = `SELECT * FROM PedidosReadModel WHERE id = $1`;

    // 2. Execução da Query usando o DataSource
    // No SQL Server (MSSQL), os parâmetros podem ser @0, @1 ou apenas passados no array
    const result = await this.dataSource.query(sql, [id]);

    // Retorna o primeiro resultado encontrado
    return result[0];
  }
}