import { Injectable, NotFoundException, BadRequestException, Inject, Logger } from '@nestjs/common';
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
    
    private readonly logger = new Logger(OrderService.name);
    private readonly orderGateway: OrderGateway,
  ) { }

  create(dto: CreateOrderDto) {
    this.logger.log({ msg: 'Iniciando criação de pedido', action: 'create', userId: dto.userId });
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
    this.logger.log({ msg: 'Pedido criado com sucesso', action: 'create', orderId: novaOrdem.id, status: novaOrdem.status });
    return novaOrdem;
  }

  findAll() {
    this.logger.log({ msg: 'Buscando todos os pedidos', action: 'findAll' });
    return this.orders;
  }

  findOne(id: string) {
    this.logger.log({ msg: 'Buscando pedido por ID', action: 'findOne', orderId: id });
    const order = this.orders.find(o => o.id === id);
    if (!order) {
      this.logger.warn({ msg: 'Pedido não encontrado', action: 'findOne', orderId: id });
      throw new NotFoundException('Pedido não encontrado');
    }

    return order;
  }

  async confirmOrder(id: string) {
    this.logger.log({ msg: 'Iniciando confirmação de pedido', action: 'confirmOrder', orderId: id });
    const order = this.findOne(id);

    if (order.status !== OrderStatus.PENDING) {
      this.logger.warn({ msg: 'Tentativa de confirmar pedido já processado ou cancelado', action: 'confirmOrder', orderId: id, currentStatus: order.status });
      throw new BadRequestException('Este pedido já foi processado ou cancelado');
    }

    order.status = OrderStatus.CONFIRMED;

    // Publica no RabbitMQ para o payment-service processar
    this.rabbitClient.emit('order_created', {
      pedidoId: order.id,
      valor: order.valorTotal,
      processadoEm: new Date(),
    });

    this.logger.log({ msg: 'Pedido confirmado com sucesso', action: 'confirmOrder', orderId: order.id });
    
    // Notifica o frontend via WebSocket imediatamente
    this.orderGateway.notificarStatusAlterado(order.id, {
      pedidoId: order.id,
      statusAnterior: 'PENDING',
      novoStatus: 'CONFIRMED',
      observacao: 'Pagamento confirmado com sucesso!',
      alteradoEm: new Date(),
    });
    
    this.logger.log({ msg: 'Notificação WebSocket enviada para o frontend', action: 'confirmOrder', orderId: id });

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
    this.logger.log({ msg: 'Buscando pedidos por usuário', action: 'findByUser', userId: userId });
    return this.orders.filter(o => o.userId === userId);
  }
}