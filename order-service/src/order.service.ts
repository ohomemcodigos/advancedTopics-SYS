import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { v4 as uuid } from 'uuid';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderGateway } from './gateways/order.gateway';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Injectable()
export class OrderService {
  private orders: any[] = [];

  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
    private readonly orderGateway: OrderGateway,
  ) { }

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
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return order;
  }

  async confirmOrder(id: string) {
    const order = this.findOne(id);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Este pedido já foi processado ou cancelado');
    }

    order.status = OrderStatus.CONFIRMED;

    // Publica no RabbitMQ para o payment-service processar
    this.rabbitClient.emit('order_created', {
      pedidoId: order.id,
      valor: order.valorTotal,
      processadoEm: new Date(),
    });

    // Notifica o frontend via WebSocket imediatamente
    this.orderGateway.notificarStatusAlterado(order.id, {
      pedidoId: order.id,
      statusAnterior: 'PENDING',
      novoStatus: 'CONFIRMED',
      observacao: 'Pagamento confirmado com sucesso!',
      alteradoEm: new Date(),
    });

    return {
      message: 'Pagamento confirmado e pedido finalizado!',
      order,
      payment: {
        status: 'SUCCESS',
        transactionId: uuid(),
      },
    };
  }

  findByUser(userId: string) {
    return this.orders.filter(o => o.userId === userId);
  }
}