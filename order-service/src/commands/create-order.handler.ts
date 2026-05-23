import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOrderCommand } from './create-order.command';
import { v4 as uuid } from 'uuid';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
   async execute(command: CreateOrderCommand) {
      const { dto } = command;
      const orderId = uuid();
      return { id: orderId, status: 'PENDING', userId: dto.userId };
   }
}