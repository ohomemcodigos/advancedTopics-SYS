import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OrderController } from './order.controller';
import { CreateOrderHandler } from './commands/create-order.handler';
import { ListOrdersByUserHandler } from './queries/list-orders-by-user.handler';
import { GetOrderByIdHandler } from './queries/get-order-by-id.handler';
import { OrderProjector } from './projections/order.projector';
import { OrderGateway } from './gateways/order.gateway';

@Module({
  imports: [CqrsModule],
  controllers: [OrderController],
  providers: [
    CreateOrderHandler,
    ListOrdersByUserHandler,
    GetOrderByIdHandler,
    OrderProjector,
    OrderGateway,
  ],
})
export class OrderModule {}