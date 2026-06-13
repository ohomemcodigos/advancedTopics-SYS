import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OrderController } from './order.controller';
import { OrderEventsController } from './order-events.controller'; // <-- IMPORTADO
import { VersionController } from './version.controller';
import { CreateOrderHandler } from './commands/create-order.handler';
import { ListOrdersByUserHandler } from './queries/list-orders-by-user.handler';
import { GetOrderByIdHandler } from './queries/get-order-by-id.handler';
import { OrderProjector } from './projections/order.projector';
import { OrderGateway } from './gateways/order.gateway';
import { OrderService } from './order.service'; // <-- IMPORTADO

@Module({
  imports: [CqrsModule],
  
  controllers: [
    OrderController, 
    VersionController, 
    OrderEventsController
  ],

  providers: [
    OrderService,
    CreateOrderHandler,
    ListOrdersByUserHandler,
    GetOrderByIdHandler,
    OrderProjector,
    OrderGateway,
  ],
})
export class OrderModule {}