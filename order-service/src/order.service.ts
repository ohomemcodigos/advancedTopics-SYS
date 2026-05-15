import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices'; // <-- Import necessário!
import { v4 as uuid } from 'uuid';
import { CreateOrderDto } from './dto/create-order.dto';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Injectable()
export class OrderService {
  private orders: any[] = [];

  // 🚀 O SEGREDO: Injetar o cliente do RabbitMQ para poder falar com a fila
  constructor(@Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy) { }

  create(dto: CreateOrderDto) {
    const novaOrdem = {
      id: uuid(),
      userId: dto.userId,
      itens: dto.jogosIds.map(id => ({
        id: id,
        titulo: 'Jogo Simulado para Teste',
        preco: 49.90
      })),
      valorTotal: 49.90,
      status: OrderStatus.PENDING,
      metodoPagamento: dto.metodoPagamento,
      createdAt: new Date(),
    };

    this.orders.push(novaOrdem);
    return novaOrdem;
  }

  findAll() {
    return this.orders;
  }

  findOne(id: string) {
    const order = this.orders.find(o => o.id === id);
    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }
    return order;
  }

  async confirmOrder(id: string) {
    const order = this.findOne(id);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Este pedido já foi processado ou cancelado');
    }

    const paymentSuccess = true;

    if (paymentSuccess) {
      order.status = OrderStatus.CONFIRMED;

      // 🚀 O GATILHO QUE FALTAVA! Avisar o RabbitMQ que o pagamento passou:
      this.rabbitClient.emit('pedido_status_alterado', {
        pedidoId: order.id,
        statusAnterior: 'PENDING',
        novoStatus: 'CONFIRMED',
        processadoEm: new Date()
      });

      return {
        message: 'Pagamento confirmado e pedido finalizado!',
        order,
        payment: {
          status: 'SUCCESS',
          transactionId: uuid()
        },
      };
    } else {
      order.status = OrderStatus.CANCELLED;
      throw new BadRequestException('Falha no pagamento. Pedido cancelado.');
    }
  }

  findByUser(userId: string) {
    return this.orders.filter(o => o.userId === userId);
  }
}