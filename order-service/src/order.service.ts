import { Injectable, NotFoundException, BadRequestException, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { v4 as uuid } from 'uuid';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderGateway } from './gateways/order.gateway';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Injectable()
export class OrderService {
  private orders: any[] = [];
  
  // O Logger fica aqui, como propriedade da classe!
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy,
    private readonly orderGateway: OrderGateway,
    @InjectMetric('orders_created_total') private readonly ordersCreatedCounter: Counter<string>,
    @InjectMetric('orders_cancelled_total') private readonly ordersCancelledCounter: Counter<string>,
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
    this.ordersCreatedCounter.inc();
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

  cancelOrder(id: string) {
    this.logger.log({ msg: 'Iniciando cancelamento de pedido', action: 'cancelOrder', orderId: id });
    const order = this.findOne(id);

    if (order.status !== OrderStatus.PENDING) {
      this.logger.warn({ msg: 'Tentativa de cancelar pedido já processado', action: 'cancelOrder', orderId: id, currentStatus: order.status });
      throw new BadRequestException('Somente pedidos pendentes podem ser cancelados');
    }

    order.status = OrderStatus.CANCELLED;
    this.ordersCancelledCounter.inc();
    this.logger.log({ msg: 'Pedido cancelado com sucesso', action: 'cancelOrder', orderId: id });

    return { message: 'Pedido cancelado.', order };
  }

  findByUser(userId: string) {
    this.logger.log({ msg: 'Buscando pedidos por usuário', action: 'findByUser', userId: userId });
    return this.orders.filter(o => o.userId === userId);
  }
}
