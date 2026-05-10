import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CreateOrderCommand } from './create-order.command';
import { OrderCreatedEvent } from '../events/order-created.event';
import { v4 as uuid } from 'uuid';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
   constructor(private readonly eventBus: EventBus) {}

   async execute(command: CreateOrderCommand) {
      const { dto } = command;
      const orderId = uuid();

      // Aqui disparamos o evento que o Projetor vai escutar depois
      this.eventBus.publish(new OrderCreatedEvent(orderId, dto.userId, dto.jogosIds));

      return { id: orderId, status: 'PENDING' };
   }
}